import { Router } from "express";
import { exportarDatos, exportarClientes, exportarPedidos, exportarReporteExcel, obtenerEstadisticasSistema } from "../controllers/backupController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/exportar-todo", authMiddleware, exportarDatos);
router.get("/exportar-clientes", authMiddleware, exportarClientes);
router.get("/exportar-pedidos", authMiddleware, exportarPedidos);
router.get("/reporte-diario", authMiddleware, exportarReporteExcel);
router.get("/estadisticas-sistema", authMiddleware, obtenerEstadisticasSistema);

export default router;
