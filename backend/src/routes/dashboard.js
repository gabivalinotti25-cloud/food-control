import { Router } from "express";
import { obtenerDashboard } from "../controllers/dashboardController.js";
import { tenantMiddleware } from "../middleware/tenant.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, tenantMiddleware, obtenerDashboard);

export default router;