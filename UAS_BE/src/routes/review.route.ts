import { Router } from "express";

import {
    createReview,
    getCompanyReviews,
    getReviews,
    deleteReview
} from "../controllers/review.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// mahasiswa memberikan review
router.post(
    "/",
    authenticate,
    authorize("mahasiswa"),
    createReview
);

// admin/super_admin - halaman moderasi Ulasan (list semua, scoped ke tenant)
router.get(
    "/",
    authenticate,
    authorize("admin", "super_admin"),
    getReviews
);

// admin/super_admin - hapus ulasan yang melanggar (tenant-scoped, lihat controller)
router.delete(
    "/:id",
    authenticate,
    authorize("admin", "super_admin"),
    deleteReview
);

// siapapun yang login boleh lihat daftar ulasan sebuah perusahaan
router.get(
    "/company/:companyId",
    authenticate,
    getCompanyReviews
);

export default router;