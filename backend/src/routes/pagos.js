import { Router } from "express";
import { registrarPago } from "../controllers/pagosController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, registrarPago);

export default router;