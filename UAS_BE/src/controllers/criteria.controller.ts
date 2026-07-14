import { Response } from "express";
import { prisma } from "../lib/db.js";
import { randomUUID } from "crypto";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// ===============================
// CREATE CRITERIA
// tenantId TIDAK lagi diambil dari body — selalu dari token admin yang login.
// ===============================
export const createCriteria = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const tenantId = req.user!.tenantId;

        if (!tenantId) {
            return res.status(400).json({ message: "Akun ini tidak terdaftar pada kampus manapun." });
        }

        const {
            code,
            name,
            type,
            default_weight,
            source,
            description
        } = req.body;

        if (
            !code ||
            !name ||
            !type ||
            default_weight === undefined ||
            !source
        ) {

            return res.status(400).json({
                message: "Semua data wajib diisi."
            });

        }

        // tenant tidak perlu dicek ulang, sudah pasti valid (berasal dari token)

        const exist =
            await prisma.criteria.findFirst({

                where: {
                    tenant_id: tenantId,
                    code
                }

            });

        if (exist) {

            return res.status(400).json({

                message: "Kode kriteria sudah digunakan."

            });

        }

        const criteria =
            await prisma.criteria.create({

                data: {

                    id: randomUUID(),

                    tenant_id: tenantId,

                    code,

                    name,

                    type,

                    default_weight,

                    source,

                    description

                }

            });

        return res.status(201).json({

            message: "Kriteria berhasil ditambahkan.",

            data: criteria

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};
// ===============================
// GET ALL CRITERIA
// Sekarang selalu difilter tenant_id milik admin yang login,
// supaya admin kampus A tidak melihat daftar kriteria kampus B.
// ===============================
export const getCriteria = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const { role, tenantId } = req.user!;

        const data =
            await prisma.criteria.findMany({

                where: role === "super_admin" ? {} : { tenant_id: tenantId ?? "__none__" },

                include: {

                    tenants: {

                        select: {

                            id: true,
                            name: true

                        }

                    }

                },

                orderBy: {

                    code: "asc"

                }

            });

        return res.status(200).json({

            message: "Berhasil mengambil data kriteria.",

            data

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};
// ===============================
// GET CRITERIA BY ID
// Ditambah ownership check supaya admin tidak bisa lihat kriteria
// milik kampus lain walau tahu ID-nya.
// ===============================
export const getCriteriaById = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        const criteria =
            await prisma.criteria.findUnique({

                where: {
                    id
                }

            });

        if (!criteria) {

            return res.status(404).json({

                message: "Kriteria tidak ditemukan."

            });

        }

        const { role, tenantId } = req.user!;
        if (role !== "super_admin" && criteria.tenant_id !== tenantId) {
            return res.status(403).json({ message: "Kamu tidak punya akses ke kriteria ini." });
        }

        return res.status(200).json({

            message: "Berhasil.",

            data: criteria

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};
// ===============================
// UPDATE CRITERIA
// Ditambah ownership check. tenant_id sengaja tidak bisa diubah
// lewat body supaya kriteria tidak bisa "dipindah tenant".
// ===============================
export const updateCriteria = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const id = typeof req.params.id === 'string' ? req.params.id : undefined;

        const {
            code,
            name,
            type,
            default_weight,
            source,
            description
        } = req.body;

        const criteria =
            await prisma.criteria.findUnique({

                where: {
                    id
                }

            });

        if (!criteria) {

            return res.status(404).json({

                message: "Kriteria tidak ditemukan."

            });

        }

        const { role, tenantId } = req.user!;
        if (role !== "super_admin" && criteria.tenant_id !== tenantId) {
            return res.status(403).json({ message: "Kamu tidak punya akses untuk mengubah kriteria ini." });
        }

        const updated =
            await prisma.criteria.update({

                where: {
                    id
                },

                data: {

                    code,

                    name,

                    type,

                    default_weight,

                    source,

                    description

                }

            });

        return res.status(200).json({

            message: "Kriteria berhasil diupdate.",

            data: updated

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};
// ===============================
// DELETE CRITERIA
// Ditambah ownership check yang sama seperti update.
// ===============================
export const deleteCriteria = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        const criteria =
            await prisma.criteria.findUnique({

                where: {
                    id
                }

            });

        if (!criteria) {

            return res.status(404).json({

                message: "Kriteria tidak ditemukan."

            });

        }

        const { role, tenantId } = req.user!;
        if (role !== "super_admin" && criteria.tenant_id !== tenantId) {
            return res.status(403).json({ message: "Kamu tidak punya akses untuk menghapus kriteria ini." });
        }

        await prisma.criteria.delete({

            where: {
                id
            }

        });

        return res.status(200).json({

            message: "Kriteria berhasil dihapus."

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};