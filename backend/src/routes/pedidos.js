import { Router } from "express";

import {
  crearPedido,
  listarPedidos,
} from "../controllers/pedidosController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, crearPedido);

router.get("/", authMiddleware, listarPedidos);

export default router;