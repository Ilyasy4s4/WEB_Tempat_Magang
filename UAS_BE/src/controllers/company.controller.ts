import { Response } from "express";
import { prisma } from "../lib/db.js";
import { randomUUID } from "crypto";
import slugify from "slugify";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// ===============================
// CREATE COMPANY
// tenantId TIDAK lagi diambil dari body — selalu dari token admin yang login.
// Ini memastikan admin kampus A tidak bisa membuat company atas nama kampus B.
// ===============================
export const createCompany = async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = req.user!.tenantId;

        if (!tenantId) {
            return res.status(400).json({ message: "Akun ini tidak terdaftar pada kampus manapun." });
        }

        const {
            bidangId,
            name,
            city,
            address,
            work_mode,
            kuota,
            description,
            logo
        } = req.body;

        if (!bidangId || !name || !city || !work_mode) {
            return res.status(400).json({
                message: "Data wajib diisi."
            });
        }

        // 1. Cek validitas Bidang (tenant sudah pasti valid karena berasal dari token yang sudah login)
        const bidang = await prisma.bidang.findUnique({ where: { id: bidangId } });
        if (!bidang) return res.status(404).json({ message: "Bidang tidak ditemukan." });

        // 2. Cek apakah nama perusahaan sudah dipakai di tenant tersebut
        const existingCompany = await prisma.companies.findFirst({
            where: { name, tenant_id: tenantId }
        });
        if (existingCompany) {
            return res.status(400).json({ message: "Nama perusahaan sudah terdaftar." });
        }

        const slug = slugify(name, { lower: true, strict: true });
        const companyId = randomUUID();

        // 3. Ambil kriteria milik tenant ini saja
        const criterias = await prisma.criteria.findMany({
            where: { tenant_id: tenantId }
        });

        // 4. Jalankan Transaksi agar konsistensi data terjamin (All or Nothing)
        const newCompany = await prisma.$transaction(async (tx) => {
            const company = await tx.companies.create({
                data: {
                    id: companyId,
                    tenant_id: tenantId,
                    bidang_id: bidangId,
                    name,
                    slug,
                    city,
                    address,
                    work_mode,
                    kuota,
                    description,
                    logo
                }
            });

            if (criterias.length > 0) {
                const companyCriteria = criterias.map((criteria) => ({
                    id: randomUUID(),
                    tenant_id: tenantId,
                    company_id: companyId,
                    criteria_id: criteria.id,
                    value: 0
                }));

                await tx.company_criteria_values.createMany({
                    data: companyCriteria
                });
            }

            return company;
        });

        return res.status(201).json({
            message: "Perusahaan berhasil ditambahkan.",
            data: newCompany
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Terjadi kesalahan server."
        });
    }
};

// ===============================
// GET ALL COMPANY
// Sekarang selalu difilter tenant_id milik user yang login.
// super_admin (tenantId null) dikecualikan dan boleh lihat semua,
// karena dia memang pengelola pusat lintas kampus.
// ===============================
export const getCompanies = async (req: AuthRequest, res: Response) => {
    try {
        const { role, tenantId } = req.user!;

        const companies = await prisma.companies.findMany({
            where: role === "super_admin" ? {} : { tenant_id: tenantId ?? "__none__" },
            include: {
                tenants: { select: { id: true, name: true } },
                bidang: { select: { id: true, name: true } }
            },
            orderBy: { created_at: "desc" }
        });

        return res.status(200).json({
            message: "Berhasil mengambil data perusahaan.",
            data: companies
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ===============================
// GET COMPANY BY ID
// Ditambah pengecekan kepemilikan tenant, supaya admin/mahasiswa
// tidak bisa lihat detail company milik kampus lain walau tahu ID-nya.
// ===============================
export const getCompanyById = async (req: AuthRequest, res: Response) => {
    try {
        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!id) return res.status(400).json({ message: "ID perusahaan wajib diisi." });

        const company = await prisma.companies.findUnique({
            where: { id },
            include: { tenants: true, bidang: true }
        });

        if (!company) return res.status(404).json({ message: "Perusahaan tidak ditemukan." });

        const { role, tenantId } = req.user!;
        if (role !== "super_admin" && company.tenant_id !== tenantId) {
            return res.status(403).json({ message: "Kamu tidak punya akses ke perusahaan ini." });
        }

        return res.status(200).json({
            message: "Berhasil mengambil detail perusahaan.",
            data: company
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ===============================
// UPDATE COMPANY
// tenantId company TIDAK bisa diubah lewat body (dihilangkan dari data update)
// supaya company tidak bisa "dipindahkan" ke tenant lain oleh siapapun.
// ===============================
export const updateCompany = async (req: AuthRequest, res: Response) => {
    try {
        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!id) return res.status(400).json({ message: "ID perusahaan wajib diisi." });

        const {
            bidangId,
            name,
            city,
            address,
            work_mode,
            kuota,
            description,
            logo,
            is_active
        } = req.body;

        const company = await prisma.companies.findUnique({ where: { id } });
        if (!company) return res.status(404).json({ message: "Perusahaan tidak ditemukan." });

        const { role, tenantId } = req.user!;
        if (role !== "super_admin" && company.tenant_id !== tenantId) {
            return res.status(403).json({ message: "Kamu tidak punya akses untuk mengubah perusahaan ini." });
        }

        // Cek jika nama diubah, pastikan tidak bentrok dengan nama perusahaan lain di tenant yang sama
        if (name && name !== company.name) {
            const duplicateName = await prisma.companies.findFirst({
                where: { name, tenant_id: company.tenant_id, NOT: { id } }
            });
            if (duplicateName) {
                return res.status(400).json({ message: "Nama perusahaan sudah digunakan." });
            }
        }

        const slug = name ? slugify(name, { lower: true, strict: true }) : company.slug;

        const updatedCompany = await prisma.companies.update({
            where: { id },
            data: {
                // tenant_id sengaja TIDAK di-update, company tetap milik tenant aslinya
                bidang_id: bidangId,
                name,
                slug,
                city,
                address,
                work_mode,
                kuota,
                description,
                logo,
                is_active
            }
        });

        return res.status(200).json({
            message: "Perusahaan berhasil diupdate.",
            data: updatedCompany
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// ===============================
// DELETE COMPANY
// ===============================
export const deleteCompany = async (req: AuthRequest, res: Response) => {
    try {
        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;

        if (!id) return res.status(400).json({ message: "ID perusahaan wajib diisi." });

        const company = await prisma.companies.findUnique({ where: { id } });
        if (!company) return res.status(404).json({ message: "Perusahaan tidak ditemukan." });

        const { role, tenantId } = req.user!;
        if (role !== "super_admin" && company.tenant_id !== tenantId) {
            return res.status(403).json({ message: "Kamu tidak punya akses untuk menghapus perusahaan ini." });
        }

        // Catatan: Jika company_criteria_values tidak diatur ON DELETE CASCADE di skema Prisma,
        // Anda harus menghapus data kriterianya dulu di sini sebelum menghapus company.
        await prisma.companies.delete({ where: { id } });

        return res.status(200).json({ message: "Perusahaan berhasil dihapus." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};
// ===============================
// UPLOAD COMPANY LOGO
// Terima 1 file gambar (field name: "logo") lewat multipart/form-data,
// simpan ke disk, dan balikin URL absolut yang siap dipakai langsung
// sebagai <img src> ataupun disimpan ke kolom `logo` companies.
// ===============================
export const uploadCompanyLogoHandler = async (req: AuthRequest, res: Response) => {
    try {
        const file = (req as any).file as Express.Multer.File | undefined;

        if (!file) {
            return res.status(400).json({ message: "File gambar wajib diunggah (field: logo)." });
        }

        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/companies/${file.filename}`;

        return res.status(201).json({
            message: "Logo berhasil diunggah.",
            data: { url: fileUrl },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server saat mengunggah logo." });
    }
};