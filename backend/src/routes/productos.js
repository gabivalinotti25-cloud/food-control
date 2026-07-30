import { Router } from "express";

import {
  listarProductos,
  crearProducto,
  editarProducto,
  cambiarEstadoProducto,
  eliminarProducto
} from "../controllers/productosController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, listarProductos);

router.post("/", authMiddleware, crearProducto);

router.put("/:id", authMiddleware, editarProducto);

router.patch("/:id/estado", authMiddleware, cambiarEstadoProducto);

router.delete("/:id", authMiddleware, eliminarProducto);

export default router;