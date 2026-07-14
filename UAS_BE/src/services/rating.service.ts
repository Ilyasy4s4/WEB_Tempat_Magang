import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

// =========================================================
// recalculateCompanyCriteriaValue
// Menghitung ulang AVG(rating) untuk 1 company + 1 kriteria,
// lalu meng-upsert hasilnya ke company_criteria_values.
//
// PENTING: parameter `tx` di sini adalah transaction client Prisma
// (bukan `prisma` biasa). Fungsi ini HARUS dipanggil di dalam
// prisma.$transaction(...) yang sama dengan insert review_ratings,
// supaya rating yang baru saja masuk ikut terhitung di AVG-nya
// (real-time, bukan hasil query basi).
// =========================================================
export async function recalculateCompanyCriteriaValue(
  tx: Prisma.TransactionClient,
  params: {
    tenantId: string;
    companyId: string;
    criteriaId: string;
    fallbackRating: number; // dipakai kalau AVG gagal dihitung (harusnya tidak pernah terjadi)
  }
) {
  const { tenantId, companyId, criteriaId, fallbackRating } = params;

  const aggregate = await tx.review_ratings.aggregate({
    where: {
      reviews: {
        company_id: companyId,
      },
      criteria_id: criteriaId,
    },
    _avg: {
      rating: true,
    },
  });

  const averageScore = aggregate._avg.rating ?? fallbackRating;

  await tx.company_criteria_values.upsert({
    where: {
      company_id_criteria_id: {
        company_id: companyId,
        criteria_id: criteriaId,
      },
    },
    update: {
      value: averageScore,
    },
    create: {
      id: randomUUID(),
      tenant_id: tenantId,
      company_id: companyId,
      criteria_id: criteriaId,
      value: averageScore,
    },
  });

  return averageScore;
}