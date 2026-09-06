import { Router } from "express";
import {
  registrarNegocio,
  obtenerNegocio,
  actualizarNegocio,
  obtenerPlanes,
} from "../controllers/negociosController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = Router();

// Rutas públicas
router.post("/registrar", registrarNegocio);
router.get("/planes", obtenerPlanes);

// Rutas protegidas
router.get("/", authMiddleware, obtenerNegocio);
router.put("/", authMiddleware, adminMiddleware, actualizarNegocio);

export default router;
