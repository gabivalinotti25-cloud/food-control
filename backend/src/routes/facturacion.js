import { Router } from "express";
import {
  crearFactura,
  obtenerFacturas,
  obtenerFactura,
  marcarPagada,
  anularFactura,
  verificarVencidas,
  generarFacturasMensuales,
} from "../controllers/facturacionController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = Router();

// Rutas protegidas
router.get("/", authMiddleware, obtenerFacturas);
router.get("/:id", authMiddleware, obtenerFactura);
router.post("/", authMiddleware, adminMiddleware, crearFactura);
router.post("/:id/pagar", authMiddleware, adminMiddleware, marcarPagada);
router.post("/:id/anular", authMiddleware, adminMiddleware, anularFactura);

// Rutas para cron jobs (proteger con secret en producción)
router.post("/cron/verificar-vencidas", verificarVencidas);
router.post("/cron/generar-mensuales", generarFacturasMensuales);

export default router;
