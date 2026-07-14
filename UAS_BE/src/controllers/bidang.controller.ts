import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
import { randomUUID } from "crypto";
import slugify from "slugify";

// ===============================
// CREATE BIDANG
// ===============================

export const createBidang = async (
    req: Request,
    res: Response
) => {

    try {

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Nama bidang wajib diisi."
            });
        }

        const slug = slugify(name, {
            lower: true,
            strict: true
        });

        const existingBidang = await prisma.bidang.findUnique({
            where: {
                slug
            }
        });

        if (existingBidang) {
            return res.status(400).json({
                message: "Bidang sudah ada."
            });
        }

        const bidang = await prisma.bidang.create({

            data: {
                id: randomUUID(),
                name,
                slug
            }

        });

        return res.status(201).json({

            message: "Bidang berhasil ditambahkan.",
            data: bidang

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};

// ===============================
// GET ALL BIDANG
// ===============================

export const getBidang = async (
    req: Request,
    res: Response
) => {

    try {

        const bidang = await prisma.bidang.findMany({

            orderBy: {
                created_at: "desc"
            }

        });

        return res.status(200).json({

            message: "Berhasil mengambil data bidang.",
            data: bidang

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};

// ===============================
// GET BIDANG BY ID
// ===============================

export const getBidangById = async (
    req: Request,
    res: Response
) => {

    try {

        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!id) {
            return res.status(400).json({
                message: "ID bidang wajib diisi."
            });
        }

        const bidang = await prisma.bidang.findUnique({

            where: {
                id
            }

        });

        if (!bidang) {

            return res.status(404).json({

                message: "Bidang tidak ditemukan."

            });

        }

        return res.status(200).json({

            message: "Berhasil mengambil detail bidang.",
            data: bidang

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};

// ===============================
// UPDATE BIDANG
// ===============================

export const updateBidang = async (
    req: Request,
    res: Response
) => {

    try {

        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!id) {
            return res.status(400).json({
                message: "ID bidang wajib diisi."
            });
        }

        const { name } = req.body;

        const bidang = await prisma.bidang.findUnique({

            where: {
                id
            }

        });

        if (!bidang) {

            return res.status(404).json({

                message: "Bidang tidak ditemukan."

            });

        }

        const slug = slugify(name, {

            lower: true,
            strict: true

        });

        const updatedBidang = await prisma.bidang.update({

            where: {
                id
            },

            data: {
                name,
                slug
            }

        });

        return res.status(200).json({

            message: "Bidang berhasil diupdate.",
            data: updatedBidang

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};

// ===============================
// DELETE BIDANG
// ===============================

export const deleteBidang = async (
    req: Request,
    res: Response
) => {

    try {

        const idParam = req.params.id;

        if (!idParam || Array.isArray(idParam)) {
            return res.status(400).json({
                message: "Invalid bidang id."
            });
        }

        const id = idParam;

        const bidang = await prisma.bidang.findUnique({

            where: {
                id
            }

        });

        if (!bidang) {

            return res.status(404).json({

                message: "Bidang tidak ditemukan."

            });

        }

        await prisma.bidang.delete({

            where: {
                id
            }

        });

        return res.status(200).json({

            message: "Bidang berhasil dihapus."

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};