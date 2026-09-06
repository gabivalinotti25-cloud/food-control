import { Router } from "express";
import {
  configurarWhatsApp,
  obtenerConfiguracionWhatsApp,
  enviarMensajeWhatsApp,
  enviarMensajeCliente,
  webhookWhatsApp,
  verificarWebhookWhatsApp,
} from "../controllers/whatsappController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Rutas protegidas
router.post("/configurar", authMiddleware, configurarWhatsApp);
router.get("/configuracion", authMiddleware, obtenerConfiguracionWhatsApp);
router.post("/enviar", authMiddleware, enviarMensajeWhatsApp);
router.post("/enviar-cliente", authMiddleware, enviarMensajeCliente);

// Rutas públicas para webhooks de WhatsApp
router.post("/webhook", webhookWhatsApp);
router.get("/webhook", verificarWebhookWhatsApp);

export default router;
