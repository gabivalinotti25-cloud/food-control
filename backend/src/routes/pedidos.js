import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  crearPedido,
  listarPedidos,
  eliminarPedido,
} from "../controllers/pedidosController.js";

const router = Router();

router.post("/", authMiddleware, crearPedido);
router.get("/", authMiddleware, listarPedidos);
router.delete("/:id", authMiddleware, eliminarPedido);

export default router;
