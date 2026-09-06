import { Router } from "express";
import {
  crearSuscripcion,
  obtenerSuscripcionActual,
  actualizarSuscripcion,
  cancelarSuscripcion,
  obtenerHistorialSuscripciones,
  verificarEstadoSuscripcion,
} from "../controllers/suscripcionesController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Rutas protegidas
router.post("/", authMiddleware, crearSuscripcion);
router.get("/actual", authMiddleware, obtenerSuscripcionActual);
router.put("/", authMiddleware, actualizarSuscripcion);
router.delete("/", authMiddleware, cancelarSuscripcion);
router.get("/historial", authMiddleware, obtenerHistorialSuscripciones);
router.get("/estado", authMiddleware, verificarEstadoSuscripcion);

export default router;
