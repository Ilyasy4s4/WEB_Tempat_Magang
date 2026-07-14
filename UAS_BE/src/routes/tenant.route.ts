import { Router } from "express";
import {
    createTenant,
    getTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
    getPublicTenants
} from "../controllers/tenant.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// PUBLIC - dipakai halaman Register, tidak butuh login.
// Diletakkan di atas "/:id" supaya "/public" tidak ketangkap sebagai id.
router.get("/public", getPublicTenants);

// SUPER ADMIN ONLY
router.post(
    "/",
    authenticate,
    authorize("super_admin"),
    createTenant
);

router.get(
    "/",
    authenticate,
    authorize("super_admin"),
    getTenants
);

router.get(
    "/:id",
    authenticate,
    authorize("super_admin"),
    getTenantById
);

router.put(
    "/:id",
    authenticate,
    authorize("super_admin"),
    updateTenant
);

router.delete(
    "/:id",
    authenticate,
    authorize("super_admin"),
    deleteTenant
);

export default router;