import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import authRoute from "./routes/auth.route.js";
import { authenticate, AuthRequest } from "./middlewares/auth.middleware.js";
import { authorize } from "./middlewares/role.middleware.js";
import tenantRoutes from "./routes/tenant.route.js";
import bidangRoute from "./routes/bidang.route.js";
import userRoutes from "./routes/user.route.js";
import companyRoutes from "./routes/company.route.js";
import criteriaRoutes from "./routes/criteria.route.js";
import companyCriteriaRoutes from "./routes/companyCriteria.route.js";
import reviewRoutes from "./routes/review.route.js"; // rbaikan 1: Path disesuaikan ke folder 'routes'
import recommendationRoutes from "./routes/recommendation.route.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Sajikan file yang sudah diupload (logo perusahaan, dll) sebagai file statis.
// Contoh hasil: http://localhost:3000/uploads/companies/xxxx.jpg
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/auth", authRoute);
app.use("/tenants", tenantRoutes);
app.use("/bidang", bidangRoute);
app.use("/users", userRoutes);
app.use("/companies", companyRoutes);
app.use("/criteria", criteriaRoutes);
app.use("/company-criteria", companyCriteriaRoutes);
app.use("/reviews", reviewRoutes);
app.use("/recommendations", recommendationRoutes);
app.get("/", (req, res) => {
  res.send("Backend SPK Magang API Berjalan 🚀");
});

app.get(
    "/me",
    authenticate,
    (req, res) => {
        // ✅ Perbaikan 2: Type Assertion di dalam body fungsi agar TypeScript tidak error
        const authReq = req as AuthRequest; 
        return res.json({
            user: authReq.user
        });
    }
);

app.get(
    "/admin-test",
    authenticate,
    authorize("admin"),
    (req, res) => {
        res.json({
            message: "Selamat datang Admin"
        });
    }
);

// Error handler khusus multer (file terlalu besar, format ditolak, dll)
// supaya errornya balik sebagai JSON yang rapi, bukan crash/HTML polos.
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "Ukuran file maksimal 2MB." });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err) {
        return res.status(400).json({ message: err.message || "Terjadi kesalahan." });
    }
    next();
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});