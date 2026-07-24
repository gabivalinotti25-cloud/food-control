import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  obtenerMenu,
  copiarProductosFijos,
  agregarProductoMenu,
  agregarMontoLibreMenu,
  eliminarProductoMenu,
  listarMenusMes,
} from "../controllers/menuController.js";

const router = Router();

router.get("/", authMiddleware, obtenerMenu);
router.get("/calendario", authMiddleware, listarMenusMes);
router.post("/copiar", authMiddleware, copiarProductosFijos);
router.post("/agregar", authMiddleware, agregarProductoMenu);
router.post("/monto-libre", authMiddleware, agregarMontoLibreMenu);
router.delete("/producto/:id", authMiddleware, eliminarProductoMenu);

export default router;
