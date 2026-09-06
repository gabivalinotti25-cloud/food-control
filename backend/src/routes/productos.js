import { Router } from "express";

import {
  listarProductos,
  crearProducto,
  editarProducto,
  cambiarEstadoProducto
} from "../controllers/productosController.js";
import { tenantMiddleware } from "../middleware/tenant.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, tenantMiddleware, listarProductos);

router.post("/", authMiddleware, tenantMiddleware, crearProducto);

router.put("/:id", authMiddleware, tenantMiddleware, editarProducto);

router.patch("/:id/estado", authMiddleware, tenantMiddleware, cambiarEstadoProducto);

export default router;