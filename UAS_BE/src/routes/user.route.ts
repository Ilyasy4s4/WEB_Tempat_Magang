import { Router } from "express";

import {
    createAdmin,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getMahasiswaByTenant,
    getMyProfile,
    updateMyProfile,
    changeMyPassword
} from "../controllers/user.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// ===============================
// SELF-SERVICE PROFILE (siapapun yang login: super_admin / admin / mahasiswa)
// Diletakkan sebelum route "/:id" super_admin di bawah supaya jelas terpisah;
// path 2-segmen ini tidak akan pernah "ketangkap" oleh "/:id" yang 1-segmen.
// ===============================

router.get(
    "/me/profile",
    authenticate,
    getMyProfile
);

router.put(
    "/me/profile",
    authenticate,
    updateMyProfile
);

router.put(
    "/me/password",
    authenticate,
    changeMyPassword
);

// ===============================
// SUPER ADMIN
// ===============================

// Tambah Admin
router.post(
    "/admin",
    authenticate,
    authorize("super_admin"),
    createAdmin
);

// Lihat semua user (lintas tenant)
router.get(
    "/",
    authenticate,
    authorize("super_admin"),
    getUsers
);

// Detail user
router.get(
    "/:id",
    authenticate,
    authorize("super_admin"),
    getUserById
);

// Update user
router.put(
    "/:id",
    authenticate,
    authorize("super_admin"),
    updateUser
);

// Hapus user
router.delete(
    "/:id",
    authenticate,
    authorize("super_admin"),
    deleteUser
);

// ===============================
// ADMIN (read-only, scoped ke kampusnya sendiri)
// ===============================

// Lihat daftar mahasiswa di kampus sendiri
// super_admin juga boleh akses endpoint ini (lihat semua mahasiswa lintas tenant)
router.get(
    "/mahasiswa/list",
    authenticate,
    authorize("admin", "super_admin"),
    getMahasiswaByTenant
);

export default router;