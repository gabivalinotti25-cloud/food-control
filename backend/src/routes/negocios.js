import { Router } from "express";
import {
  registrarNegocio,
  obtenerNegocio,
  actualizarNegocio,
  obtenerPlanes,
  listarNegocios,
  actualizarNegocioAdmin,
} from "../controllers/negociosController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = Router();

// Rutas públicas
router.post("/registrar", registrarNegocio);
router.get("/planes", obtenerPlanes);

// Rutas protegidas
router.get("/", authMiddleware, obtenerNegocio);
router.put("/", authMiddleware, adminMiddleware, actualizarNegocio);

// Super-admin (dueño de la plataforma)
router.get("/admin/todos", authMiddleware, adminMiddleware, listarNegocios);
router.put("/admin/:id", authMiddleware, adminMiddleware, actualizarNegocioAdmin);

export default router;
