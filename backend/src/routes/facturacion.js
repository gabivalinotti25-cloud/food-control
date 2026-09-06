import { Router } from "express";
import {
  crearFactura,
  obtenerFacturas,
  obtenerFactura,
  marcarFacturaPagada,
  anularFactura,
  verificarFacturasVencidas,
  generarFacturaMensual,
} from "../controllers/facturacionController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Rutas protegidas
router.post("/", authMiddleware, crearFactura);
router.get("/", authMiddleware, obtenerFacturas);
router.get("/:id", authMiddleware, obtenerFactura);
router.post("/:id/pagar", authMiddleware, marcarFacturaPagada);
router.post("/:id/anular", authMiddleware, anularFactura);

// Rutas para cron jobs (requieren autenticación de sistema)
router.post("/cron/verificar-vencidas", verificarFacturasVencidas);
router.post("/cron/generar-mensual", generarFacturaMensual);

export default router;
