import { Router } from "express";
import { crearConfiguracion, obtenerConfiguraciones, obtenerConfiguracionDia, actualizarConfiguracion, eliminarConfiguracion, inicializarConfiguraciones } from "../controllers/configuracionMenuController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, crearConfiguracion);
router.get("/", authMiddleware, obtenerConfiguraciones);
router.get("/dia/:diaSemana", authMiddleware, obtenerConfiguracionDia);
router.get("/inicializar", authMiddleware, inicializarConfiguraciones);
router.put("/:id", authMiddleware, actualizarConfiguracion);
router.delete("/:id", authMiddleware, eliminarConfiguracion);

export default router;
