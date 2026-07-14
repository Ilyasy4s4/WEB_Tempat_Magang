import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// ===============================
// CREATE ADMIN (super_admin only)
// ===============================

export const createAdmin = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            tenantId,
            name,
            email,
            password
        } = req.body;

        if (
            !tenantId ||
            !name ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message: "Semua data wajib diisi."
            });
        }

        // cek tenant
        const tenant = await prisma.tenants.findUnique({

            where: {
                id: tenantId
            }

        });

        if (!tenant) {

            return res.status(404).json({

                message: "Tenant tidak ditemukan."

            });

        }

        // cek email
        const existingUser =
            await prisma.users.findUnique({

                where: {
                    email
                }

            });

        if (existingUser) {

            return res.status(400).json({

                message: "Email sudah digunakan."

            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const admin =
            await prisma.users.create({

                data: {

                    id: randomUUID(),

                    tenant_id: tenantId,

                    name,

                    email,

                    password: hashedPassword,

                    role: "admin"

                }

            });

        return res.status(201).json({

            message: "Admin berhasil dibuat.",

            data: admin

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};

// ===============================
// GET ALL USERS (super_admin only, lintas tenant)
// ===============================

export const getUsers = async (
    req: Request,
    res: Response
) => {

    try {

        const users = await prisma.users.findMany({

            include: {
                tenants: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },

            orderBy: {
                created_at: "desc"
            }

        });

        return res.status(200).json({

            message: "Berhasil mengambil data user.",
            data: users

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};

// ===============================
// GET USER BY ID (super_admin only)
// ===============================

export const getUserById = async (
    req: Request,
    res: Response
) => {

    try {

        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!id) {

            return res.status(400).json({

                message: "ID user wajib diisi."

            });

        }

        const user = await prisma.users.findUnique({

            where: {
                id
            },

            include: {

                tenants: {

                    select: {

                        id: true,
                        name: true

                    }

                }

            }

        });

        if (!user) {

            return res.status(404).json({

                message: "User tidak ditemukan."

            });

        }

        return res.status(200).json({

            message: "Berhasil mengambil detail user.",
            data: user

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};
// ===============================
// UPDATE USER (super_admin only)
// ===============================

export const updateUser = async (
    req: Request,
    res: Response
) => {

    try {

        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!id) {
            return res.status(400).json({
                message: "ID user wajib diisi."
            });
        }

        const {
            tenantId,
            name,
            email
        } = req.body;

        const user = await prisma.users.findUnique({

            where: {
                id
            }

        });

        if (!user) {

            return res.status(404).json({

                message: "User tidak ditemukan."

            });

        }

        // cek tenant jika diubah
        if (tenantId) {

            const tenant = await prisma.tenants.findUnique({

                where: {
                    id: tenantId
                }

            });

            if (!tenant) {

                return res.status(404).json({

                    message: "Tenant tidak ditemukan."

                });

            }

        }

        // cek email jika berubah
        if (email && email !== user.email) {

            const existingUser =
                await prisma.users.findUnique({

                    where: {
                        email
                    }

                });

            if (existingUser) {

                return res.status(400).json({

                    message: "Email sudah digunakan."

                });

            }

        }

        const updatedUser =
            await prisma.users.update({

                where: {
                    id
                },

                data: {

                    tenant_id: tenantId,
                    name,
                    email

                }

            });

        return res.status(200).json({

            message: "User berhasil diupdate.",
            data: updatedUser

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};
// ===============================
// DELETE USER (super_admin only)
// ===============================

export const deleteUser = async (
    req: Request,
    res: Response
) => {

    try {

        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!id) {

            return res.status(400).json({

                message: "ID user wajib diisi."

            });

        }

        const user =
            await prisma.users.findUnique({

                where: {
                    id
                }

            });

        if (!user) {

            return res.status(404).json({

                message: "User tidak ditemukan."

            });

        }

        await prisma.users.delete({

            where: {
                id
            }

        });

        return res.status(200).json({

            message: "User berhasil dihapus."

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};

// ===============================
// GET MAHASISWA BY TENANT (admin only, READ-ONLY, scoped ke kampusnya sendiri)
// Beda dengan getUsers di atas: ini khusus admin kampus, otomatis
// difilter tenant_id dari token, dan cuma menampilkan role mahasiswa.
// super_admin juga boleh akses ini untuk lihat mahasiswa tenant tertentu.
// ===============================

export const getMahasiswaByTenant = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const { role, tenantId } = req.user!;

        if (role === "admin" && !tenantId) {
            return res.status(400).json({
                message: "Akun ini tidak terdaftar pada kampus manapun."
            });
        }

        const mahasiswa = await prisma.users.findMany({

            where: {
                role: "mahasiswa",
                ...(role === "super_admin" ? {} : { tenant_id: tenantId })
            },

            select: {
                id: true,
                name: true,
                email: true,
                nim: true,
                jurusan: true,
                created_at: true,
                tenants: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },

            orderBy: {
                created_at: "desc"
            }

        });

        return res.status(200).json({

            message: "Berhasil mengambil data mahasiswa.",
            data: mahasiswa

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Terjadi kesalahan server."

        });

    }

};
// ===============================
// SELF-SERVICE PROFILE (siapapun yang login: super_admin / admin / mahasiswa)
// Dipakai halaman Settings admin & bisa dipakai ulang untuk profil user lain.
// ===============================

export const getMyProfile = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const id = req.user!.id;

        const user = await prisma.users.findUnique({

            where: {
                id
            },

            include: {
                tenants: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }

        });

        if (!user) {

            return res.status(404).json({
                message: "User tidak ditemukan."
            });

        }

        return res.status(200).json({

            message: "Berhasil mengambil profil.",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenant_id,
                tenantName: user.tenants?.name || null
            }

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Terjadi kesalahan server."
        });

    }

};

// ===============================
// UPDATE MY PROFILE (nama & email sendiri)
// ===============================

export const updateMyProfile = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const id = req.user!.id;
        const { name, email } = req.body;

        if (!name && !email) {

            return res.status(400).json({
                message: "Tidak ada data yang diubah."
            });

        }

        if (email) {

            const existingUser = await prisma.users.findUnique({
                where: {
                    email
                }
            });

            if (existingUser && existingUser.id !== id) {

                return res.status(400).json({
                    message: "Email sudah digunakan."
                });

            }

        }

        const updatedUser = await prisma.users.update({

            where: {
                id
            },

            data: {
                name,
                email
            }

        });

        return res.status(200).json({

            message: "Profil berhasil diperbarui.",
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email
            }

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Terjadi kesalahan server."
        });

    }

};

// ===============================
// CHANGE MY PASSWORD (verifikasi password lama dulu)
// ===============================

export const changeMyPassword = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const id = req.user!.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {

            return res.status(400).json({
                message: "Password lama dan password baru wajib diisi."
            });

        }

        if (String(newPassword).length < 6) {

            return res.status(400).json({
                message: "Password baru minimal 6 karakter."
            });

        }

        const user = await prisma.users.findUnique({
            where: {
                id
            }
        });

        if (!user) {

            return res.status(404).json({
                message: "User tidak ditemukan."
            });

        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {

            return res.status(401).json({
                message: "Password lama salah."
            });

        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: {
                id
            },
            data: {
                password: hashedPassword
            }
        });

        return res.status(200).json({
            message: "Password berhasil diubah."
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Terjadi kesalahan server."
        });

    }

};