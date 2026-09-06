import { Router } from "express";

import {
  obtenerMenuHoy,
  copiarProductosFijos,
  agregarProductoMenu,
  eliminarProductoMenu
} from "../controllers/menuController.js";
import { tenantMiddleware } from "../middleware/tenant.js";
import { authMiddleware } from "../middleware/auth.js";


const router = Router();


// Obtener menú del día
router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  obtenerMenuHoy
);


// Copiar productos fijos al menú de hoy
router.post(
  "/copiar",
  authMiddleware,
  tenantMiddleware,
  copiarProductosFijos
);


// Agregar un producto manualmente al menú
router.post(
  "/agregar",
  authMiddleware,
  tenantMiddleware,
  agregarProductoMenu
);


// Quitar un producto del menú del día
router.delete(
  "/producto/:id",
  authMiddleware,
  tenantMiddleware,
  eliminarProductoMenu
);


export default router;