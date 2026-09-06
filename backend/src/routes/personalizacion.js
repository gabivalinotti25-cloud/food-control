import { Router } from "express";
import {
  obtenerPersonalizacion,
  actualizarPersonalizacion,
  eliminarLogo,
  obtenerTemas,
  aplicarTema,
  obtenerPersonalizacionPublica,
} from "../controllers/personalizacionController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = Router();

// Ruta pública (white-label)
router.get("/publica/:slug", obtenerPersonalizacionPublica);

// Rutas protegidas
router.get("/", authMiddleware, obtenerPersonalizacion);
router.put("/", authMiddleware, adminMiddleware, actualizarPersonalizacion);
router.delete("/logo", authMiddleware, adminMiddleware, eliminarLogo);
router.get("/temas", authMiddleware, obtenerTemas);
router.post("/tema", authMiddleware, adminMiddleware, aplicarTema);

export default router;
