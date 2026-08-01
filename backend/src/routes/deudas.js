import { Router } from "express";
import { listarDeudas, listarDeudasPorCliente, marcarPedidoPagado, obtenerResumenDeudas, generarInformeCliente } from "../controllers/deudasController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, listarDeudas);
router.get("/resumen", authMiddleware, obtenerResumenDeudas);
router.get("/cliente/:clienteId", authMiddleware, listarDeudasPorCliente);
router.post("/marcar-pagado", authMiddleware, marcarPedidoPagado);
router.get("/informe/:clienteId", authMiddleware, generarInformeCliente);

export default router;