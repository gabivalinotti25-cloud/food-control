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

router.use(authMiddleware);

router.post("/iniciar", iniciarOnboarding);
router.get("/estado", obtenerEstadoOnboarding);
router.put("/paso", actualizarPasoOnboarding);
router.post("/accion", marcarAccionCompletada);
router.post("/omitir", omitirOnboarding);
router.post("/reiniciar", reiniciarOnboarding);
router.get("/pasos", obtenerPasosOnboarding);

export default router;
