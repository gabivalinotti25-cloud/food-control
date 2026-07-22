import { Router } from "express";
import { obtenerEstadisticasGenerales, obtenerVentasPorPeriodo, obtenerProductosMasVendidos, obtenerClientesFrecuentes, obtenerReporteDiario, obtenerTendenciasVentas } from "../controllers/estadisticasController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/generales", authMiddleware, obtenerEstadisticasGenerales);
router.get("/ventas", authMiddleware, obtenerVentasPorPeriodo);
router.get("/productos-mas-vendidos", authMiddleware, obtenerProductosMasVendidos);
router.get("/clientes-frecuentes", authMiddleware, obtenerClientesFrecuentes);
router.get("/reporte-diario", authMiddleware, obtenerReporteDiario);
router.get("/tendencias", authMiddleware, obtenerTendenciasVentas);

export default router;
