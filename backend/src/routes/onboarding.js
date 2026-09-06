import { Router } from "express";
import {
  iniciarOnboarding,
  obtenerEstadoOnboarding,
  actualizarPasoOnboarding,
  marcarAccionCompletada,
  omitirOnboarding,
  reiniciarOnboarding,
  obtenerPasosOnboarding,
} from "../controllers/onboardingController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Rutas protegidas
router.post("/iniciar", authMiddleware, iniciarOnboarding);
router.get("/estado", authMiddleware, obtenerEstadoOnboarding);
router.put("/paso", authMiddleware, actualizarPasoOnboarding);
router.post("/accion", authMiddleware, marcarAccionCompletada);
router.post("/omitir", authMiddleware, omitirOnboarding);
router.post("/reiniciar", authMiddleware, reiniciarOnboarding);
router.get("/pasos", authMiddleware, obtenerPasosOnboarding);

export default router;
