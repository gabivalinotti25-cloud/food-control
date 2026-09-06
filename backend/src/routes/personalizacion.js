import { Router } from "express";
import {
  obtenerPersonalizacion,
  actualizarPersonalizacion,
  subirLogo,
  eliminarLogo,
  obtenerTemas,
  aplicarTema,
  obtenerPersonalizacionPublica,
} from "../controllers/personalizacionController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Rutas protegidas
router.get("/", authMiddleware, obtenerPersonalizacion);
router.put("/", authMiddleware, actualizarPersonalizacion);
router.post("/logo", authMiddleware, subirLogo);
router.delete("/logo", authMiddleware, eliminarLogo);
router.get("/temas", authMiddleware, obtenerTemas);
router.post("/tema", authMiddleware, aplicarTema);

// Rutas públicas (para white-label)
router.get("/publica/:slug", obtenerPersonalizacionPublica);

export default router;
