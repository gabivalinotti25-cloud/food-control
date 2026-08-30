import { Router } from "express";
import { listarAuditoria } from "../middleware/auditoria.js";
import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/auth.js";

const router = Router();

// Listar auditoría (solo admin puede ver todas las auditorías)
router.get("/", authMiddleware, adminMiddleware, listarAuditoria);

export default router;
