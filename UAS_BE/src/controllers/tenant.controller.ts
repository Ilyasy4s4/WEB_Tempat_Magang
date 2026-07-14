import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
import { randomUUID } from "crypto";
import slugify from "slugify";

// ===============================
// GET PUBLIC TENANTS (tanpa auth)
// Dipakai halaman Register, supaya mahasiswa yang belum login
// bisa memilih kampusnya. Hanya kembalikan id & nama saja,
// tidak ada email/address/subscription_status (data internal).
// ===============================

export const getPublicTenants = async (
    req: Request,
    res: Response
) => {

    try {

        const tenants = await prisma.tenants.findMany({

            select: {
                id: true,
                name: true
            },

            orderBy: {
                name: "asc"
            }

        });

        return res.status(200).json({

            message: "Berhasil mengambil daftar kampus.",
            data: tenants

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};

// ===============================
// CREATE TENANT
// ===============================

export const createTenant = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            name,
            email,
            address
        } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Nama kampus wajib diisi."
            });
        }

        const slug = slugify(name, {
            lower: true,
            strict: true
        });

        const existingTenant =
            await prisma.tenants.findUnique({
                where: {
                    slug
                }
            });

        if (existingTenant) {
            return res.status(400).json({
                message: "Tenant sudah ada."
            });
        }

        const tenant =
            await prisma.tenants.create({

                data: {
                    id: randomUUID(),
                    name,
                    slug,
                    email,
                    address
                }

            });

        return res.status(201).json({

            message: "Tenant berhasil ditambahkan.",
            data: tenant

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Terjadi kesalahan server."
        });

    }

};

// ===============================
// GET ALL TENANT
// ===============================

export const getTenants = async (
    req: Request,
    res: Response
) => {

    try {

        const tenants =
            await prisma.tenants.findMany({

                orderBy: {
                    created_at: "desc"
                }

            });

        return res.status(200).json({

            message: "Berhasil mengambil data tenant.",
            data: tenants

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};

// ===============================
// GET TENANT BY ID
// ===============================

export const getTenantById = async (
    req: Request,
    res: Response
) => {

    try {

        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!id) {
            return res.status(400).json({
                message: "ID tenant wajib diisi."
            });
        }

        const tenant =
            await prisma.tenants.findUnique({

                where: {
                    id
                }

            });

        if (!tenant) {

            return res.status(404).json({

                message: "Tenant tidak ditemukan."

            });

        }

        return res.status(200).json({

            message: "Berhasil mengambil detail tenant.",
            data: tenant

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};

// ===============================
// UPDATE TENANT
// ===============================

export const updateTenant = async (
    req: Request,
    res: Response
) => {

    try {

        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!id) {
            return res.status(400).json({
                message: "ID tenant wajib diisi."
            });
        }

        const {
            name,
            email,
            address
        } = req.body;

        const tenant =
            await prisma.tenants.findUnique({

                where: {
                    id
                }

            });

        if (!tenant) {

            return res.status(404).json({

                message: "Tenant tidak ditemukan."

            });

        }

        const slug = slugify(name, {
            lower: true,
            strict: true
        });

        const updatedTenant =
            await prisma.tenants.update({

                where: {
                    id
                },

                data: {
                    name,
                    slug,
                    email,
                    address
                }

            });

        return res.status(200).json({

            message: "Tenant berhasil diupdate.",
            data: updatedTenant

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};

// ===============================
// DELETE TENANT
// ===============================

export const deleteTenant = async (
    req: Request,
    res: Response
) => {

    try {

        const idParam = req.params.id;

        if (!idParam || Array.isArray(idParam)) {
            return res.status(400).json({
                message: "Invalid tenant id."
            });
        }

        const id = idParam;

        const tenant =
            await prisma.tenants.findUnique({

                where: {
                    id
                }

            });

        if (!tenant) {

            return res.status(404).json({

                message: "Tenant tidak ditemukan."

            });

        }

        await prisma.tenants.delete({

            where: {
                id
            }

        });

        return res.status(200).json({

            message: "Tenant berhasil dihapus."

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};