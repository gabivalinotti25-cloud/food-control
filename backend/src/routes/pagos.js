import { Router } from "express";
import { registrarPago, eliminarMovimiento } from "../controllers/pagosController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, registrarPago);
router.delete("/movimiento", authMiddleware, eliminarMovimiento);

export default router;