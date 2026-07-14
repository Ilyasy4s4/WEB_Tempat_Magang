import { Router } from "express";
import { 
    createRecommendationRequest, 
    getRecommendationResult,
    getRecommendationHistory
} from "../controllers/recommendation.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// 1. Endpoint untuk membuat request rekomendasi (menyimpan preferensi bobot awal)
// POST http://localhost:3000/recommendations
router.post(
    "/", 
    authenticate, 
    createRecommendationRequest
);

// 2. Endpoint untuk menghitung & mengambil hasil ranking SAW berdasarkan ID request
// GET http://localhost:3000/recommendations/:id/results
router.get(
    "/:id/results", 
    authenticate, 
    getRecommendationResult
);

router.get("/history/:userId", authenticate, getRecommendationHistory);

export default router;