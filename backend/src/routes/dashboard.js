import { Router } from "express";
import { obtenerDashboard } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, obtenerDashboard);

export default router;