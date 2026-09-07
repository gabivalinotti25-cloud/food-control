import { Router } from "express";
import {
  crearFactura,
  obtenerFacturas,
  obtenerFactura,
  marcarPagada,
  anularFactura,
  verificarVencidas,
  generarFacturasMensuales,
  crearFacturaAdmin,
  marcarPagadaAdmin,
  facturasDeNegocio,
} from "../controllers/facturacionController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = Router();

// Rutas protegidas
router.get("/", authMiddleware, obtenerFacturas);
router.get("/:id", authMiddleware, obtenerFactura);
router.post("/", authMiddleware, adminMiddleware, crearFactura);
router.post("/:id/pagar", authMiddleware, adminMiddleware, marcarPagada);
router.post("/:id/anular", authMiddleware, adminMiddleware, anularFactura);

// Super-admin (dueño de la plataforma)
router.get("/admin/negocio/:negocioId", authMiddleware, adminMiddleware, facturasDeNegocio);
router.post("/admin/crear", authMiddleware, adminMiddleware, crearFacturaAdmin);
router.post("/admin/:id/pagar", authMiddleware, adminMiddleware, marcarPagadaAdmin);

// Rutas para cron jobs (proteger con secret en producción)
router.post("/cron/verificar-vencidas", verificarVencidas);
router.post("/cron/generar-mensuales", generarFacturasMensuales);

export default router;
