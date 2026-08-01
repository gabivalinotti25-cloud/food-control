import { Router } from "express";
import {
  procesarMensaje,
  listarPropuestas,
  aprobarPropuesta,
  rechazarPropuesta,
  webhookWhatsApp,
  verificarWebhook,
} from "../controllers/sebastianController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Webhook de WhatsApp (sin auth para Twilio)
router.post("/webhook", webhookWhatsApp);
router.get("/webhook", verificarWebhook);

// Procesar mensaje de WhatsApp (sin auth para webhook de Twilio)
router.post("/mensaje", procesarMensaje);

// Listar propuestas (requiere auth)
router.get("/propuestas", authMiddleware, listarPropuestas);

// Aprobar propuesta (requiere auth)
router.post("/propuestas/:id/aprobar", authMiddleware, aprobarPropuesta);

// Rechazar propuesta (requiere auth)
router.post("/propuestas/:id/rechazar", authMiddleware, rechazarPropuesta);

export default router;
