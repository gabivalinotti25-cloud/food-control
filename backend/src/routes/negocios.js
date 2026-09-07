import { Router } from "express";
import {
  registrarNegocio,
  obtenerNegocio,
  actualizarNegocio,
  obtenerPlanes,
  listarNegocios,
  actualizarNegocioAdmin,
  resumenPlataforma,
} from "../controllers/negociosController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { validar, schemaRegistrarNegocio } from "../middleware/validar.js";

const router = Router();

// Rutas públicas
router.post("/registrar", validar(schemaRegistrarNegocio), registrarNegocio);
router.get("/planes", obtenerPlanes);

// Rutas protegidas
router.get("/", authMiddleware, obtenerNegocio);
router.put("/", authMiddleware, adminMiddleware, actualizarNegocio);

// Super-admin (dueño de la plataforma)
router.get("/admin/todos", authMiddleware, adminMiddleware, listarNegocios);
router.get("/admin/resumen", authMiddleware, adminMiddleware, resumenPlataforma);
router.put("/admin/:id", authMiddleware, adminMiddleware, actualizarNegocioAdmin);

export default router;
