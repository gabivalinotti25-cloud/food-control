import { Router } from "express";
import {
  crearCliente,
  listarClientes,
  editarCliente,
  eliminarCliente,
} from "../controllers/clientesController.js";
import { authMiddleware } from "../middleware/auth.js";
import { verificarLimite } from "../middleware/limites.js";

const router = Router();

router.post("/", authMiddleware, verificarLimite("clientes"), crearCliente);
router.get("/", authMiddleware, listarClientes);
router.put("/:id", authMiddleware, editarCliente);
router.delete("/:id", authMiddleware, eliminarCliente);

export default router;