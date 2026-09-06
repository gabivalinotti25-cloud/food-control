import { Router } from "express";
import {
  registrarNegocio,
  obtenerNegocio,
  actualizarNegocio,
  obtenerPlanes,
} from "../controllers/negociosController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Rutas públicas
router.post("/registrar", registrarNegocio);
router.get("/planes", obtenerPlanes);

// Rutas protegidas
router.get("/mi-negocio", authMiddleware, obtenerNegocio);
router.put("/mi-negocio", authMiddleware, actualizarNegocio);

export default router;
