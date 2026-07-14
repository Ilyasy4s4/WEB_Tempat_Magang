import { Response } from "express";
import { prisma } from "../lib/db.js";
import { randomUUID } from "crypto";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// ==========================================
// GET COMPANY CRITERIA
// Ditambah ownership check: admin hanya boleh lihat nilai kriteria
// company yang ada di kampusnya sendiri.
//
// PENTING: sebelumnya fungsi ini hanya menampilkan baris yang SUDAH ADA
// di company_criteria_values. Kalau ada kriteria baru dibuat SETELAH
// company ini ada (misal kriteria "Honor" ditambah belakangan), tidak
// pernah ada baris untuk kombinasi company+criteria itu, jadi kriteria
// itu tidak pernah muncul di sini sama sekali.
//
// Sekarang sumber datanya diubah: ambil SEMUA kriteria milik tenant ini,
// lalu digabung (LEFT JOIN manual) dengan nilai yang sudah ada. Kriteria
// yang belum punya nilai otomatis tampil dengan value 0 dan tetap bisa
// diisi/disimpan admin. Ini juga otomatis "menyembuhkan" data lama tanpa
// perlu migrasi manual.
// ==========================================
export const getCompanyCriteria = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.params.id as string;

        const company = await prisma.companies.findUnique({
            where: { id: companyId },
            include: {
                company_criteria_values: true
            }
        });

        if (!company) {
            return res.status(404).json({ message: "Perusahaan tidak ditemukan." });
        }

        const { role, tenantId } = req.user!;
        if (role !== "super_admin" && company.tenant_id !== tenantId) {
            return res.status(403).json({ message: "Kamu tidak punya akses ke perusahaan ini." });
        }

        // Semua kriteria milik tenant company ini (bukan hanya yang sudah punya baris nilai)
        const allCriteria = await prisma.criteria.findMany({
            where: { tenant_id: company.tenant_id },
            orderBy: { code: "asc" }
        });

        const existingValueByCriteriaId = new Map(
            company.company_criteria_values.map((item) => [item.criteria_id, item])
        );

        const result = allCriteria.map((criteria) => {
            const existing = existingValueByCriteriaId.get(criteria.id);
            return {
                id: existing?.id ?? null,
                criteriaId: criteria.id,
                criteriaName: criteria.name,
                source: criteria.source,
                value: existing ? Number(existing.value) : 0,
                editable: criteria.source === "input_admin"
            };
        });

        return res.status(200).json({
            company: company.name,
            criteria: result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ==========================================
// UPDATE COMPANY CRITERIA (Optimized & Safe)
// Ditambah ownership check yang sama: admin tidak bisa mengubah
// nilai kriteria company milik kampus lain.
//
// PENTING: sebelumnya fungsi ini hanya UPDATE baris yang sudah ada di
// company_criteria_values, dan diam-diam melewati (skip) kriteria yang
// belum punya baris sama sekali -- sehingga kriteria baru (misal "Honor")
// tidak pernah tersimpan untuk company lama. Sekarang pakai upsert:
// kalau barisnya belum ada, dibuat; kalau sudah ada, di-update.
// ==========================================
export const updateCompanyCriteria = async (req: AuthRequest, res: Response) => {
    try {
        const idParam = req.params.id;
        const companyId = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!companyId) {
            return res.status(400).json({ message: "ID perusahaan tidak valid." });
        }

        const { criteria } = req.body; // Ekspektasi: array of { criteriaId, value }
        if (!Array.isArray(criteria) || criteria.length === 0) {
            return res.status(400).json({ message: "Data kriteria tidak boleh kosong." });
        }

        // 1. Cek keberadaan perusahaan + kepemilikan tenant
        const company = await prisma.companies.findUnique({ where: { id: companyId } });
        if (!company) {
            return res.status(404).json({ message: "Perusahaan tidak ditemukan." });
        }

        const { role, tenantId } = req.user!;
        if (role !== "super_admin" && company.tenant_id !== tenantId) {
            return res.status(403).json({ message: "Kamu tidak punya akses untuk mengubah perusahaan ini." });
        }

        // 2. Validasi kriteria langsung dari tabel criteria (bukan lewat baris nilai
        // yang mungkin belum ada), supaya kriteria baru tetap bisa divalidasi & disimpan.
        const incomingCriteriaIds = criteria.map(item => item.criteriaId);
        const criteriaDefinitions = await prisma.criteria.findMany({
            where: {
                id: { in: incomingCriteriaIds },
                tenant_id: company.tenant_id
            }
        });
        const criteriaById = new Map(criteriaDefinitions.map((c) => [c.id, c]));

        // 3. Baris nilai yang sudah ada (untuk tahu mana yang perlu create vs update)
        const existingCompanyCriteria = await prisma.company_criteria_values.findMany({
            where: {
                company_id: companyId,
                criteria_id: { in: incomingCriteriaIds }
            }
        });
        const existingByCriteriaId = new Map(
            existingCompanyCriteria.map((item) => [item.criteria_id, item])
        );

        // 4. Validasi aturan main SEBELUM melakukan update apa pun ke DB
        const updateOperations = [];

        for (const item of criteria) {
            const criteriaDef = criteriaById.get(item.criteriaId);

            // Kriteria tidak ditemukan / bukan milik tenant ini -> lewati
            if (!criteriaDef) continue;

            // Validasi: Hanya boleh edit kriteria dengan source 'input_admin'
            if (criteriaDef.source !== "input_admin") {
                return res.status(403).json({
                    message: `${criteriaDef.name} berasal dari rating mahasiswa dan tidak dapat diubah.`
                });
            }

            const existingRecord = existingByCriteriaId.get(item.criteriaId);

            if (existingRecord) {
                updateOperations.push(
                    prisma.company_criteria_values.update({
                        where: { id: existingRecord.id },
                        data: { value: Number(item.value) }
                    })
                );
            } else {
                updateOperations.push(
                    prisma.company_criteria_values.create({
                        data: {
                            id: randomUUID(),
                            tenant_id: company.tenant_id,
                            company_id: companyId,
                            criteria_id: item.criteriaId,
                            value: Number(item.value)
                        }
                    })
                );
            }
        }

        // 5. Jalankan semua operasi sekaligus dalam satu Transaksi Aman (All or Nothing)
        if (updateOperations.length > 0) {
            await prisma.$transaction(updateOperations);
        }

        return res.status(200).json({
            message: "Nilai kriteria berhasil diperbarui."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};