import { Router } from "express";
import {
  crearCliente,
  listarClientes,
} from "../controllers/clientesController.js";
import { tenantMiddleware } from "../middleware/tenant.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, crearCliente);
router.get("/", authMiddleware, tenantMiddleware, listarClientes);

export default router;