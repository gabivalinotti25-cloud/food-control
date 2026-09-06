import { Router } from "express";
import { registrarPago } from "../controllers/pagosController.js";
import { tenantMiddleware } from "../middleware/tenant.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, registrarPago);

export default router;