import { Response } from "express";
import { prisma } from "../lib/db.js";
import { randomUUID } from "crypto";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { recalculateCompanyCriteriaValue } from "../services/rating.service.js";

// ===============================
// CREATE REVIEW
// userId & tenantId diambil dari token (bukan body).
// Agregasi AVG(rating) -> company_criteria_values sekarang
// ===============================
export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const tenantId = req.user!.tenantId;

        if (!tenantId) {
            return res.status(400).json({ message: "Akun ini tidak terdaftar pada kampus manapun." });
        }

        const { companyId, comment, ratings } = req.body;

        // ===============================
        // 1. VALIDASI INPUT
        // ===============================
        if (!companyId || !Array.isArray(ratings) || ratings.length === 0) {
            return res.status(400).json({ message: "Data tidak lengkap." });
        }

        // ===============================
        // 2. AMBIL DATA MASTER (Paralel)
        // ===============================
        const [company, existingReview, requiredCriteria] = await Promise.all([
            prisma.companies.findUnique({ where: { id: companyId } }),
            prisma.reviews.findFirst({ where: { user_id: userId, company_id: companyId } }),
            prisma.criteria.findMany({ where: { tenant_id: tenantId, source: "rating_mahasiswa" } })
        ]);

        if (!company) return res.status(404).json({ message: "Perusahaan tidak ditemukan." });

        // Pastikan mahasiswa hanya bisa review company di kampusnya sendiri
        if (company.tenant_id !== tenantId) {
            return res.status(403).json({ message: "Perusahaan ini bukan mitra kampusmu." });
        }

        if (existingReview) return res.status(400).json({ message: "Anda sudah memberikan review pada perusahaan ini." });

        // ===============================
        // 3. CEK JUMLAH KRITERIA
        // ===============================
        if (ratings.length !== requiredCriteria.length) {
            return res.status(400).json({
                message: `Anda wajib mengisi seluruh ${requiredCriteria.length} penilaian.`
            });
        }

        // ===============================
        // 4. CEK DUPLIKAT KRITERIA
        // ===============================
        const incomingCriteriaIds = ratings.map((item: any) => item.criteriaId);
        const uniqueCriteria = new Set(incomingCriteriaIds);

        if (uniqueCriteria.size !== incomingCriteriaIds.length) {
            return res.status(400).json({ message: "Terdapat kriteria yang dikirim lebih dari satu kali." });
        }

        // ===============================
        // 5. AMBIL DATA MASTER KRITERIA
        // ===============================
        const masterCriteria = await prisma.criteria.findMany({
            where: { id: { in: incomingCriteriaIds } }
        });

        // ===============================
        // 6. VALIDASI DETAIL KRITERIA
        // ===============================
        for (const item of ratings) {
            const criteria = masterCriteria.find(c => c.id === item.criteriaId);

            if (!criteria) {
                return res.status(404).json({ message: `Kriteria ${item.criteriaId} tidak ditemukan.` });
            }
            if (criteria.tenant_id !== tenantId) {
                return res.status(403).json({ message: `${criteria.name} bukan milik tenant ini.` });
            }
            if (criteria.source !== "rating_mahasiswa") {
                return res.status(403).json({ message: `${criteria.name} tidak dapat dinilai mahasiswa.` });
            }
            if (Number(item.rating) < 1 || Number(item.rating) > 5) {
                return res.status(400).json({ message: `${criteria.name} harus bernilai 1 sampai 5.` });
            }
        }

        // ===============================
        // 7. DB TRANSACTION
        // ===============================
        const finalReview = await prisma.$transaction(async (tx) => {
            const reviewId = randomUUID();

            // a. Simpan data Ulasan Utama
            const createdReview = await tx.reviews.create({
                data: {
                    id: reviewId,
                    tenant_id: tenantId,
                    user_id: userId,
                    company_id: companyId,
                    comment
                }
            });

            // b. Simpan semua Detail Rating (Bulk Insert)
            await tx.review_ratings.createMany({
                data: ratings.map((item: any) => ({
                    id: randomUUID(),
                    review_id: reviewId,
                    criteria_id: item.criteriaId,
                    rating: Number(item.rating)
                }))
            });

            // c. UPDATE NILAI SPK REAL-TIME lewat rating.service.ts
            for (const item of ratings) {
                await recalculateCompanyCriteriaValue(tx, {
                    tenantId,
                    companyId,
                    criteriaId: item.criteriaId,
                    fallbackRating: Number(item.rating)
                });
            }

            return createdReview;
        });

        return res.status(201).json({
            message: "Review berhasil ditambahkan dan nilai SPK diperbarui.",
            data: finalReview
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ===============================
// GET REVIEWS BY COMPANY
// Dipakai halaman detail perusahaan (publik/mahasiswa yang login) untuk
// menampilkan daftar ulasan + rating rata-rata dari perusahaan tersebut.
// Tetap scoped ke tenant milik user yang login (kecuali super_admin).
// ===============================
export const getCompanyReviews = async (req: AuthRequest, res: Response) => {
    try {
        const idParam = req.params.companyId;
        const companyId = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!companyId) return res.status(400).json({ message: "ID perusahaan wajib diisi." });

        const company = await prisma.companies.findUnique({ where: { id: companyId } });
        if (!company) return res.status(404).json({ message: "Perusahaan tidak ditemukan." });

        const { role, tenantId } = req.user!;
        if (role !== "super_admin" && company.tenant_id !== tenantId) {
            return res.status(403).json({ message: "Kamu tidak punya akses ke perusahaan ini." });
        }

        const reviews = await prisma.reviews.findMany({
            where: { company_id: companyId },
            orderBy: { created_at: "desc" },
            include: {
                users: { select: { id: true, name: true } },
                review_ratings: { include: { criteria: true } }
            }
        });

        const formatted = reviews.map((r) => {
            const ratings = r.review_ratings.map((rr) => Number(rr.rating));
            const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

            return {
                id: r.id,
                userName: r.users?.name || "Pengguna",
                comment: r.comment,
                createdAt: r.created_at,
                averageRating: Number(avg.toFixed(2)),
                ratings: r.review_ratings.map((rr) => ({
                    criteriaId: rr.criteria_id,
                    criteriaName: rr.criteria.name,
                    rating: rr.rating
                }))
            };
        });

        const overallAvg =
            formatted.length > 0
                ? Number(
                      (formatted.reduce((sum, r) => sum + r.averageRating, 0) / formatted.length).toFixed(2)
                  )
                : 0;

        return res.status(200).json({
            message: "Berhasil mengambil ulasan perusahaan.",
            averageRating: overallAvg,
            count: formatted.length,
            data: formatted
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ===============================
// GET ALL REVIEWS (untuk halaman moderasi Ulasan di dashboard admin/super_admin)
// admin: hanya ulasan di kampusnya sendiri. super_admin: semua ulasan lintas kampus.
// ===============================
export const getReviews = async (req: AuthRequest, res: Response) => {
    try {
        const { role, tenantId } = req.user!;

        const reviews = await prisma.reviews.findMany({
            where: role === "super_admin" ? {} : { tenant_id: tenantId ?? "__none__" },
            orderBy: { created_at: "desc" },
            include: {
                users: { select: { id: true, name: true } },
                companies: { select: { id: true, name: true } },
                review_ratings: { include: { criteria: true } }
            }
        });

        const formatted = reviews.map((r) => {
            const ratings = r.review_ratings.map((rr) => Number(rr.rating));
            const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

            return {
                id: r.id,
                userName: r.users?.name || "Pengguna",
                companyId: r.company_id,
                companyName: r.companies?.name || "-",
                comment: r.comment,
                createdAt: r.created_at,
                averageRating: Number(avg.toFixed(2)),
                ratings: r.review_ratings.map((rr) => ({
                    criteriaId: rr.criteria_id,
                    criteriaName: rr.criteria.name,
                    rating: rr.rating
                }))
            };
        });

        return res.status(200).json({
            message: "Berhasil mengambil semua ulasan.",
            data: formatted
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ===============================
// DELETE REVIEW (moderasi - hapus ulasan yang melanggar)
// Setelah dihapus, nilai rata-rata kriteria yang terpengaruh dihitung ulang
// otomatis lewat rating.service.ts, supaya hasil SAW tetap akurat.
// ===============================
export const deleteReview = async (req: AuthRequest, res: Response) => {
    try {
        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!id) return res.status(400).json({ message: "ID ulasan wajib diisi." });

        const review = await prisma.reviews.findUnique({
            where: { id },
            include: { review_ratings: true }
        });

        if (!review) return res.status(404).json({ message: "Ulasan tidak ditemukan." });

        const { role, tenantId } = req.user!;
        if (role !== "super_admin" && review.tenant_id !== tenantId) {
            return res.status(403).json({ message: "Kamu tidak punya akses untuk menghapus ulasan ini." });
        }

        const companyId = review.company_id;
        const affectedCriteriaIds = Array.from(
            new Set(review.review_ratings.map((rr) => rr.criteria_id))
        );

        await prisma.$transaction(async (tx) => {
            // Hapus detail rating dulu, baru ulasan utamanya
            await tx.review_ratings.deleteMany({ where: { review_id: id } });
            await tx.reviews.delete({ where: { id } });

            // Hitung ulang rata-rata tiap kriteria yang tadinya dipengaruhi ulasan ini.
            // Kalau ini ulasan terakhir untuk kriteria tsb, nilainya jadi 0 (belum ada rating sama sekali).
            for (const criteriaId of affectedCriteriaIds) {
                await recalculateCompanyCriteriaValue(tx, {
                    tenantId: review.tenant_id,
                    companyId,
                    criteriaId,
                    fallbackRating: 0
                });
            }
        });

        return res.status(200).json({ message: "Ulasan berhasil dihapus dan nilai SPK diperbarui." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};