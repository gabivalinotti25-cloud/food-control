import { Router } from "express";
import {
  crearCliente,
  listarClientes,
} from "../controllers/clientesController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, crearCliente);
router.get("/", authMiddleware, listarClientes);

export default router;