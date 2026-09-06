import { Router } from "express";

import {
  crearPedido,
  listarPedidos,
} from "../controllers/pedidosController.js";
import { tenantMiddleware } from "../middleware/tenant.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, crearPedido);

router.get("/", authMiddleware, tenantMiddleware, listarPedidos);

export default router;