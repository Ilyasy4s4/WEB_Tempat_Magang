import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";


export const register = async (
  req: Request,
  res: Response
) => {
  try {

    const {
      name,
      email,
      password,
      nim,
      jurusan,
      tenantId,
    } = req.body;

    // ===========================
    // Validasi
    // ===========================

    if (
      !name ||
      !email ||
      !password ||
      !nim ||
      !jurusan ||
      !tenantId
    ) {
      return res.status(400).json({
        message: "Semua data wajib diisi.",
      });
    }

    // ===========================
    // Cek tenant
    // ===========================

    const tenant = await prisma.tenants.findUnique({
      where: {
        id: tenantId,
      },
    });

    if (!tenant) {
      return res.status(404).json({
        message: "Kampus tidak ditemukan.",
      });
    }

    // ===========================
    // Email sudah ada?
    // ===========================

    const existingUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email sudah digunakan.",
      });
    }

    // ===========================
    // Hash Password
    // ===========================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ===========================
    // Simpan User
    // ===========================

    const user = await prisma.users.create({
      data: {
        id: uuidv4(),
        tenant_id: tenantId,
        name,
        email,
        password: hashedPassword,
        nim,
        jurusan,
        role: "mahasiswa",
      },
    });

    return res.status(201).json({
      message: "Register berhasil.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Terjadi kesalahan server.",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {

    const { email, password } = req.body;

    // =====================
    // Validasi
    // =====================

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi.",
      });
    }

    // =====================
    // Cari user
    // =====================

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Email tidak ditemukan.",
      });
    }

    // =====================
    // Cek Password
    // =====================

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Password salah.",
      });
    }

    // =====================
    // Generate JWT
    // =====================

    const token = jwt.sign(
      {
        id: user.id,
        tenantId: user.tenant_id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    // =====================
    // Response
    // =====================

    return res.status(200).json({
      message: "Login berhasil.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
      },
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Terjadi kesalahan server.",
    });

  }
};