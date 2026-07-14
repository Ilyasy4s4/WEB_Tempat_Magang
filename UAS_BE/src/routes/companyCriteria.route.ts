import { Router } from "express"; // 1. Ubah bagian ini
import {
    getCompanyCriteria,
    updateCompanyCriteria
} from "../controllers/companyCriteria.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router(); // 2. Buat instance router baru khusus untuk file ini

router.get(
    "/company/:id/criteria",
    authenticate,
    authorize("admin", "super_admin"),
    getCompanyCriteria
);

router.put(
    "/company/:id/criteria",
    authenticate,
    authorize("admin", "super_admin"),
    updateCompanyCriteria
);

export default router; // 3. WAJIB tambahkan ini di paling bawah agar bisa dibaca oleh index.ts