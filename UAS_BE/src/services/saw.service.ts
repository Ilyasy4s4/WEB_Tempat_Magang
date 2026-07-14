import { prisma } from "../lib/db.js";
import { randomUUID } from "crypto";

// =========================================================
// calculateAndSaveSAW
// Menjalankan seluruh algoritma SAW untuk 1 recommendation_request:
//   1. Normalisasi bobot (dibagi total, supaya selalu jumlah = 1)
//   2. Ambil company yang sesuai filter (tenant, bidang, kota, mode kerja)
//   3. Cari nilai max/min tiap kriteria dari company-company itu saja
//   4. Normalisasi tiap nilai (benefit: value/max, cost: min/value)
//   5. Kalikan bobot, jumlahkan -> final_score
//   6. Urutkan & simpan ke recommendation_results
//
// Dipanggil dari recommendation.controller.ts, tapi ditulis di sini
// supaya logikanya bisa dites/dipakai ulang terpisah dari HTTP layer.
// =========================================================
export async function calculateAndSaveSAW(requestId: string) {
  const request = await prisma.recommendation_requests.findUnique({
    where: { id: requestId },
    include: {
      recommendation_request_weights: {
        include: { criteria: true },
      },
    },
  });

  if (!request) {
    return { status: "not_found" as const };
  }

  // 1. Normalisasi bobot
  const totalWeight = request.recommendation_request_weights.reduce(
    (sum, item) => sum + Number(item.weight),
    0
  );
  const divisor = totalWeight > 0 ? totalWeight : 1;

  const normalizedWeights = request.recommendation_request_weights.map((item) => ({
    ...item,
    normalizedWeight: Number(item.weight) / divisor,
  }));

  // 2. Ambil company sesuai filter request
  const companiesData = await prisma.companies.findMany({
    where: {
      tenant_id: request.tenant_id,
      is_active: true,
      ...(request.bidang_id && { bidang_id: request.bidang_id }),
      ...(request.city && { city: request.city }),
      ...(request.work_mode && { work_mode: request.work_mode }),
    },
    include: {
      company_criteria_values: true,
    },
  });

  if (companiesData.length === 0) {
    return { status: "no_companies" as const };
  }

  // 3. Susun matriks nilai per company per kriteria
  const matrix = companiesData.map((company) => {
    const values: Record<string, number> = {};

    normalizedWeights.forEach((w) => {
      values[w.criteria_id] = 0;
    });

    company.company_criteria_values.forEach((item) => {
      values[item.criteria_id] = Number(item.value);
    });

    return { company, values };
  });

  // 4. Cari max/min tiap kriteria (dari company yang sudah difilter saja)
  const maxMin: Record<string, { max: number; min: number }> = {};

  for (const weight of normalizedWeights) {
    const values = matrix
      .map((m) => m.values[weight.criteria_id])
      .filter((value): value is number => typeof value === "number");

    maxMin[weight.criteria_id] = {
      max: values.length > 0 ? Math.max(...values) : 1,
      min: values.length > 0 ? Math.min(...values) : 1,
    };
  }

  // 5. Normalisasi + kalikan bobot -> final_score
  const results: { companyId: string; companyName: string; score: number }[] = [];

  for (const item of matrix) {
    let score = 0;

    for (const weight of normalizedWeights) {
      const criteriaKey = String(weight.criteria_id);
      const value = item.values[criteriaKey] ?? 0;
      const extreme = maxMin[criteriaKey] ?? { max: 1, min: 1 };
      let normalized = 0;

      if (weight.criteria.type === "benefit") {
        normalized = extreme.max > 0 ? value / extreme.max : 0;
      } else {
        normalized = value > 0 ? extreme.min / value : 0;
      }

      score += normalized * weight.normalizedWeight;
    }

    results.push({
      companyId: item.company.id,
      companyName: item.company.name,
      score,
    });
  }

  // 6. Urutkan dari skor tertinggi
  results.sort((a, b) => b.score - a.score);

  // 7. Simpan hasil (hapus hasil lama dulu supaya bisa di-recalculate ulang)
  await prisma.$transaction(async (tx) => {
    await tx.recommendation_results.deleteMany({
      where: { recommendation_request_id: request.id },
    });

    await tx.recommendation_results.createMany({
      data: results.map((item, index) => ({
        id: randomUUID(),
        recommendation_request_id: request.id,
        company_id: item.companyId,
        final_score: Number(item.score.toFixed(4)),
        rank_position: index + 1,
      })),
    });
  });

  return {
    status: "ok" as const,
    tenantId: request.tenant_id,
    userId: request.user_id,
    weights: normalizedWeights.map((item) => ({
      criteriaId: item.criteria_id,
      criteriaName: item.criteria.name,
      originalWeight: Number(item.weight),
      normalizedWeight: Number(item.normalizedWeight.toFixed(4)),
    })),
    results: results.map((item, index) => ({
      rank: index + 1,
      companyId: item.companyId,
      companyName: item.companyName,
      score: Number(item.score.toFixed(4)),
    })),
  };
}