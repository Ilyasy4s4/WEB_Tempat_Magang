import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import type { Request } from "express";

// Folder fisik tempat file disimpan: <project_root>/uploads/companies
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "companies");

// Pastikan foldernya ada sebelum multer nyoba nulis ke situ
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${ext}`);
    },
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Format gambar tidak didukung. Gunakan JPG, PNG, atau WEBP."));
    }
}

export const uploadCompanyLogo = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // maksimal 2MB
});