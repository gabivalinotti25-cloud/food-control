import { Router } from "express";
import {
  crearCliente,
  listarClientes,
  editarCliente,
  eliminarCliente,
} from "../controllers/clientesController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, crearCliente);
router.get("/", authMiddleware, listarClientes);
router.put("/:id", authMiddleware, editarCliente);
router.delete("/:id", authMiddleware, eliminarCliente);

export default router;