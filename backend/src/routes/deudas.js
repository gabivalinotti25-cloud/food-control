import { Router } from "express";
import { listarDeudas } from "../controllers/deudasController.js";
import { tenantMiddleware } from "../middleware/tenant.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, tenantMiddleware, listarDeudas);

export default router;