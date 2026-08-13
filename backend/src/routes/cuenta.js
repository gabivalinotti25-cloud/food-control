import { Router } from "express";
import { obtenerCuenta, crearMovimiento } from "../controllers/cuentaController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/:clienteId", authMiddleware, obtenerCuenta);
router.post("/", authMiddleware, crearMovimiento);

export default router;