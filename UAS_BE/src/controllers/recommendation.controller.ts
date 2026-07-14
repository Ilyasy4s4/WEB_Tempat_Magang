import { Response } from "express";
import { prisma } from "../lib/db.js";
import { randomUUID } from "crypto";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { calculateAndSaveSAW } from "../services/saw.service.js";

// ==========================================
// 1. CREATE RECOMMENDATION REQUEST
// tenantId & userId TIDAK lagi diambil dari body — selalu dari token
// mahasiswa yang login. Mahasiswa hanya bisa membuat request untuk
// dirinya sendiri, di kampusnya sendiri.
// ==========================================
export const createRecommendationRequest = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const tenantId = req.user!.tenantId;

        if (!tenantId) {
            return res.status(400).json({ message: "Akun ini tidak terdaftar pada kampus manapun." });
        }

        const { bidangId, city, work_mode, weights } = req.body;

        if (!Array.isArray(weights) || weights.length === 0) {
            return res.status(400).json({ message: "Data tidak lengkap." });
        }

        // Validasi setiap criteriaId di weights harus milik tenant ini,
        // supaya mahasiswa tidak bisa memberi bobot ke kriteria kampus lain
        const criteriaIds = weights.map((w: any) => w.criteriaId);
        const validCriteria = await prisma.criteria.findMany({
            where: { id: { in: criteriaIds }, tenant_id: tenantId },
        });

        if (validCriteria.length !== criteriaIds.length) {
            return res.status(400).json({ message: "Terdapat kriteria yang tidak valid untuk kampusmu." });
        }

        const requestId = randomUUID();

        const request = await prisma.$transaction(async (tx) => {
            const createdRequest = await tx.recommendation_requests.create({
                data: {
                    id: requestId,
                    tenant_id: tenantId,
                    user_id: userId,
                    bidang_id: bidangId || null,
                    city: city || null,
                    work_mode: work_mode || null
                }
            });

            await tx.recommendation_request_weights.createMany({
                data: weights.map((item: any) => ({
                    id: randomUUID(),
                    recommendation_request_id: requestId,
                    criteria_id: item.criteriaId,
                    weight: Number(item.weight)
                }))
            });

            return createdRequest;
        });

        return res.status(201).json({
            message: "Request rekomendasi berhasil dibuat.",
            data: request
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ==========================================
// 2. GET RECOMMENDATION RESULT (SAW ENGINE)
// Logika perhitungan sekarang di saw.service.ts, controller ini
// tinggal: cek kepemilikan request, panggil service, format response.
// ==========================================
export const getRecommendationResult = async (req: AuthRequest, res: Response) => {
    try {
        const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        if (!requestId) {
            return res.status(400).json({ message: "ID request wajib diisi." });
        }

        // Ambil dulu request-nya (ringan) untuk cek kepemilikan sebelum
        // menjalankan perhitungan SAW yang lebih berat.
        const request = await prisma.recommendation_requests.findUnique({
            where: { id: requestId },
        });

        if (!request) {
            return res.status(404).json({ message: "Request tidak ditemukan." });
        }

        const { role, id: selfId, tenantId } = req.user!;

        // mahasiswa hanya boleh lihat request miliknya sendiri;
        // admin boleh lihat semua request di kampusnya; super_admin bebas.
        const isOwner = request.user_id === selfId;
        const isAdminSameTenant = role === "admin" && request.tenant_id === tenantId;
        const isSuperAdmin = role === "super_admin";

        if (!isOwner && !isAdminSameTenant && !isSuperAdmin) {
            return res.status(403).json({ message: "Kamu tidak punya akses ke request ini." });
        }

        const result = await calculateAndSaveSAW(requestId);

        if (result.status === "not_found") {
            return res.status(404).json({ message: "Request tidak ditemukan." });
        }

        if (result.status === "no_companies") {
            return res.status(404).json({ message: "Tidak ada perusahaan yang memenuhi kriteria filter." });
        }

        return res.status(200).json({
            message: "Rekomendasi berhasil dihitung menggunakan metode SAW.",
            weights: result.weights,
            data: result.results,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server saat memproses perhitungan SPK." });
    }
};

// ==========================================
// 3. GET RECOMMENDATION HISTORY
// mahasiswa: hanya bisa lihat riwayatnya sendiri (userId di URL diabaikan).
// admin: boleh lihat riwayat mahasiswa manapun DI KAMPUSNYA SENDIRI.
// super_admin: bebas lihat semua.
// ==========================================
export const getRecommendationHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { role, id: selfId, tenantId } = req.user!;

        const paramUserId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

        let targetUserId: string;

        if (role === "mahasiswa") {
            // mahasiswa tidak bisa memilih userId lain lewat URL, selalu dirinya sendiri
            targetUserId = selfId;
        } else {
            if (!paramUserId) {
                return res.status(400).json({ message: "ID pengguna wajib diisi." });
            }

            if (role === "admin") {
                const targetUser = await prisma.users.findUnique({ where: { id: paramUserId } });
                if (!targetUser || targetUser.tenant_id !== tenantId) {
                    return res.status(403).json({ message: "Mahasiswa ini bukan bagian dari kampusmu." });
                }
            }

            targetUserId = paramUserId;
        }

        const history = await prisma.recommendation_requests.findMany({
            where: { user_id: targetUserId },
            orderBy: { created_at: "desc" },
            include: {
                recommendation_request_weights: {
                    include: { criteria: true }
                },
                recommendation_results: {
                    orderBy: { rank_position: "asc" },
                    include: { companies: true }
                }
            }
        });

        const formattedHistory = history.map(reqItem => ({
            requestId: reqItem.id,
            createdAt: reqItem.created_at,
            filters: {
                bidangId: reqItem.bidang_id,
                city: reqItem.city,
                workMode: reqItem.work_mode
            },
            preferences: reqItem.recommendation_request_weights.map((w: any) => ({
                criteriaName: w.criteria.name,
                weight: Number(w.weight)
            })),
            results: reqItem.recommendation_results.map((r: any) => ({
                rank: r.rank_position,
                companyId: r.company_id,
                companyName: r.companies?.name || "Perusahaan Tidak Diketahui",
                score: Number(r.final_score)
            }))
        }));

        return res.status(200).json({
            message: "Riwayat rekomendasi berhasil diambil.",
            data: formattedHistory
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server saat mengambil riwayat." });
    }
};