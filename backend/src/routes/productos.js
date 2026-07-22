import { Router } from "express";

import {
  listarProductos,
  crearProducto,
  editarProducto,
  cambiarEstadoProducto
} from "../controllers/productosController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, listarProductos);

router.post("/", authMiddleware, crearProducto);

router.put("/:id", authMiddleware, editarProducto);

router.patch("/:id/estado", authMiddleware, cambiarEstadoProducto);

export default router;