import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { obtenerDia } from "../controllers/diaController.js";

const router = Router();

router.get("/:fecha", authMiddleware, obtenerDia);

export default router;
