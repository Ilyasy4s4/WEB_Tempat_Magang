import { Router } from "express";

import {
    createCriteria,
    getCriteria,
    getCriteriaById,
    updateCriteria,
    deleteCriteria
} from "../controllers/criteria.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// ===============================
// CRUD CRITERIA
// ===============================

router.post(
    "/",
    authenticate,
    authorize("admin"),
    createCriteria
);

// GET dibuka untuk admin, mahasiswa, & super_admin (mahasiswa butuh daftar
// kriteria untuk mengatur bobot di halaman Rekomendasi; super_admin perlu
// bisa memantau kriteria semua kampus). Controller sudah otomatis filter
// berdasarkan tenant_id dari token (kecuali super_admin yang lihat semua),
// jadi tetap aman per-kampus.
router.get(
    "/",
    authenticate,
    authorize("admin", "mahasiswa", "super_admin"),
    getCriteria
);

router.get(
    "/:id",
    authenticate,
    authorize("admin", "mahasiswa", "super_admin"),
    getCriteriaById
);

router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    updateCriteria
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteCriteria
);

export default router;