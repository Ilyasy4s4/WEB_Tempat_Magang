import { Router } from "express";
import {
    createBidang,
    getBidang,
    getBidangById,
    updateBidang,
    deleteBidang
} from "../controllers/bidang.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
const router = Router();

// SUPER ADMIN ONLY
// bidang bersifat global/shared untuk semua kampus, jadi hanya
// pengelola pusat yang boleh menambah/ubah/hapus daftar bidang.
// Admin kampus tetap bisa lihat (GET) untuk keperluan CRUD company.
router.post(
    "/",
    authenticate,
    authorize("super_admin"),
    createBidang
);

router.put(
    "/:id",
    authenticate,
    authorize("super_admin"),
    updateBidang
);

router.delete(
    "/:id",
    authenticate,
    authorize("super_admin"),
    deleteBidang
);

// PUBLIC (siapapun yang login boleh lihat daftar bidang)
router.get("/", getBidang);

router.get("/:id", getBidangById);

export default router;