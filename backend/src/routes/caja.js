import { Router } from "express";
import { crearOCrearCajaDiaria, obtenerCajaHoy, actualizarMontosReales, cerrarCaja, listarCajas, obtenerResumenCaja } from "../controllers/cajaController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, crearOCrearCajaDiaria);
router.get("/hoy", authMiddleware, obtenerCajaHoy);
router.get("/resumen", authMiddleware, obtenerResumenCaja);
router.get("/", authMiddleware, listarCajas);
router.put("/:id", authMiddleware, actualizarMontosReales);
router.patch("/:id/cerrar", authMiddleware, cerrarCaja);

export default router;
