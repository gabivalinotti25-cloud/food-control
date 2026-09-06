import { Router } from "express";
import { registrarDeudaAntigua } from "../controllers/deudasAntiguasController.js";
import { tenantMiddleware } from "../middleware/tenant.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, registrarDeudaAntigua);

export default router;