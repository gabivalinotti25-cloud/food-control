import { Router } from "express";
import { crearVentaAnonima, listarVentasAnonimas, eliminarVentaAnonima, obtenerVentasAnonimasHoy } from "../controllers/ventasAnonimasController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, crearVentaAnonima);
router.get("/", authMiddleware, listarVentasAnonimas);
router.get("/hoy", authMiddleware, obtenerVentasAnonimasHoy);
router.delete("/:id", authMiddleware, eliminarVentaAnonima);

export default router;
