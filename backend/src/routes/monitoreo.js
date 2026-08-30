import { Router } from "express";
import { healthCheck, obtenerEstadisticasSistema, obtenerAlertas } from "../controllers/monitoreoController.js";
import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/auth.js";

const router = Router();

// Health check (público para monitoreo externo)
router.get("/health", healthCheck);

// Estadísticas del sistema (requiere auth)
router.get("/estadisticas", authMiddleware, adminMiddleware, obtenerEstadisticasSistema);

// Alertas del sistema (requiere auth)
router.get("/alertas", authMiddleware, adminMiddleware, obtenerAlertas);

export default router;
