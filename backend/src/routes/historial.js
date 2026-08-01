import { Router } from "express";
import {
  obtenerHistorial,
  obtenerEstadisticas,
  obtenerPatrones,
  eliminarHistorial,
  limpiarHistorialAntiguo
} from "../controllers/historialController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, obtenerHistorial);
router.get("/estadisticas", authMiddleware, obtenerEstadisticas);
router.get("/patrones", authMiddleware, obtenerPatrones);
router.delete("/:id", authMiddleware, eliminarHistorial);
router.delete("/limpiar/antiguo", authMiddleware, limpiarHistorialAntiguo);

export default router;
