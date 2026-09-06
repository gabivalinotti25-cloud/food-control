import { Router } from "express";
import {
  crearSuscripcion,
  obtenerSuscripcion,
  cancelarSuscripcion,
  historialSuscripciones,
  verificarEstado,
} from "../controllers/suscripcionesController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.post("/", adminMiddleware, crearSuscripcion);
router.get("/", obtenerSuscripcion);
router.get("/estado", verificarEstado);
router.get("/historial", adminMiddleware, historialSuscripciones);
router.post("/cancelar", adminMiddleware, cancelarSuscripcion);

export default router;
