import { Router } from "express";

import {
  obtenerMenuHoy,
  copiarProductosFijos,
  agregarProductoMenu,
  eliminarProductoMenu
} from "../controllers/menuController.js";
import { authMiddleware } from "../middleware/auth.js";


const router = Router();


// Obtener menú del día
router.get(
  "/",
  authMiddleware,
  obtenerMenuHoy
);


// Copiar productos fijos al menú de hoy
router.post(
  "/copiar",
  authMiddleware,
  copiarProductosFijos
);


// Agregar un producto manualmente al menú
router.post(
  "/agregar",
  authMiddleware,
  agregarProductoMenu
);


// Quitar un producto del menú del día
router.delete(
  "/producto/:id",
  authMiddleware,
  eliminarProductoMenu
);


export default router;