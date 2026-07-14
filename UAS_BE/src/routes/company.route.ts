import { Router } from "express";

import {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    uploadCompanyLogoHandler
} from "../controllers/company.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { uploadCompanyLogo } from "../middlewares/upload.middleware.js";

const router = Router();

// Siapa pun yang login (Admin / User / Mahasiswa) bisa melihat daftar & detail perusahaan
router.get(
    "/",
    authenticate,
    getCompanies
);

// Upload logo perusahaan (khusus admin/super_admin).
// Diletakkan SEBELUM "/:id" supaya path literal ini tidak ketangkep oleh "/:id".
router.post(
    "/upload-logo",
    authenticate,
    authorize("admin", "super_admin"),
    uploadCompanyLogo.single("logo"),
    uploadCompanyLogoHandler
);

router.get(
    "/:id",
    authenticate,
    getCompanyById
);

// Hanya Admin yang bisa menambah, mengubah, dan menghapus perusahaan
router.post(
    "/",
    authenticate,
    authorize("admin"),
    createCompany
);

router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    updateCompany
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteCompany
);


export default router;