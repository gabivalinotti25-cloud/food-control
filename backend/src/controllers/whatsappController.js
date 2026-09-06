import prisma from "../prisma.js";

export async function configurarWhatsApp(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { numero, apiKey, webhookUrl } = req.body;

    // Validar que el número de WhatsApp esté en formato correcto
    const whatsappRegex = /^\+[1-9]\d{1,14}$/;
    if (!whatsappRegex.test(numero)) {
      return res.status(400).json({
        error: "Número de WhatsApp inválido. Debe incluir código de país (ej: +5491112345678)",
      });
    }

    // Actualizar configuración de WhatsApp del negocio
    const negocio = await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        whatsappNumero: numero,
        whatsappApiKey: apiKey,
      },
      select: {
        id: true,
        nombre: true,
        whatsappNumero: true,
      },
    });

    res.json({
      mensaje: "WhatsApp configurado exitosamente",
      negocio,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al configurar WhatsApp",
    });
  }
}

export async function obtenerConfiguracionWhatsApp(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: {
        id: true,
        nombre: true,
        whatsappNumero: true,
        whatsappApiKey: true,
      },
    });

    if (!negocio) {
      return res.status(404).json({
        error: "Negocio no encontrado",
      });
    }

    // No devolver la API key por seguridad
    const { whatsappApiKey, ...configuracion } = negocio;

    res.json({
      ...configuracion,
      configurado: !!negocio.whatsappNumero && !!negocio.whatsappApiKey,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener configuración de WhatsApp",
    });
  }
}

export async function enviarMensajeWhatsApp(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { telefono, mensaje } = req.body;

    // Validar que el negocio tenga WhatsApp configurado
    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: {
        whatsappNumero: true,
        whatsappApiKey: true,
      },
    });

    if (!negocio.whatsappNumero || !negocio.whatsappApiKey) {
      return res.status(400).json({
        error: "WhatsApp no configurado para este negocio",
      });
    }

    // Validar formato del teléfono
    const telefonoRegex = /^\+[1-9]\d{1,14}$/;
    if (!telefonoRegex.test(telefono)) {
      return res.status(400).json({
        error: "Número de teléfono inválido. Debe incluir código de país",
      });
    }

    if (!mensaje || mensaje.trim().length === 0) {
      return res.status(400).json({
        error: "El mensaje no puede estar vacío",
      });
    }

    // Aquí iría la integración real con WhatsApp Business API
    // Por ahora, simulamos el envío
    console.log(`Enviando mensaje a ${telefono}: ${mensaje}`);
    console.log(`Desde: ${negocio.whatsappNumero}`);
    console.log(`API Key: ${negocio.whatsappApiKey.substring(0, 10)}...`);

    // Simular respuesta exitosa
    res.json({
      mensaje: "Mensaje enviado exitosamente",
      telefono,
      mensajeEnviado: mensaje,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al enviar mensaje de WhatsApp",
    });
  }
}

export async function enviarMensajeCliente(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { clienteId, mensaje } = req.body;

    // Obtener información del cliente
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: Number(clienteId),
        negocioId,
      },
      select: {
        id: true,
        nombre: true,
        telefono: true,
      },
    });

    if (!cliente) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    if (!cliente.telefono) {
      return res.status(400).json({
        error: "El cliente no tiene teléfono registrado",
      });
    }

    // Validar que el negocio tenga WhatsApp configurado
    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: {
        whatsappNumero: true,
        whatsappApiKey: true,
      },
    });

    if (!negocio.whatsappNumero || !negocio.whatsappApiKey) {
      return res.status(400).json({
        error: "WhatsApp no configurado para este negocio",
      });
    }

    // Validar formato del teléfono del cliente
    const telefonoRegex = /^\+[1-9]\d{1,14}$/;
    if (!telefonoRegex.test(cliente.telefono)) {
      return res.status(400).json({
        error: "Número de teléfono del cliente inválido",
      });
    }

    if (!mensaje || mensaje.trim().length === 0) {
      return res.status(400).json({
        error: "El mensaje no puede estar vacío",
      });
    }

    // Aquí iría la integración real con WhatsApp Business API
    console.log(`Enviando mensaje a cliente ${cliente.nombre} (${cliente.telefono}): ${mensaje}`);
    console.log(`Desde: ${negocio.whatsappNumero}`);

    // Simular respuesta exitosa
    res.json({
      mensaje: "Mensaje enviado exitosamente al cliente",
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
      },
      mensajeEnviado: mensaje,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al enviar mensaje al cliente",
    });
  }
}

export async function webhookWhatsApp(req, res) {
  try {
    const { From, Body, To } = req.body;

    // Extraer el número de WhatsApp del negocio
    const negocioNumero = To.replace('whatsapp:', '');

    // Buscar el negocio por su número de WhatsApp
    const negocio = await prisma.negocio.findFirst({
      where: {
        whatsappNumero: negocioNumero,
      },
      select: {
        id: true,
        nombre: true,
      },
    });

    if (!negocio) {
      return res.status(404).json({
        error: "Negocio no encontrado para este número de WhatsApp",
      });
    }

    // Extraer el número del cliente
    const clienteTelefono = From.replace('whatsapp:', '');

    // Buscar o crear el cliente
    let cliente = await prisma.cliente.findFirst({
      where: {
        telefono: clienteTelefono,
        negocioId: negocio.id,
      },
    });

    if (!cliente) {
      // Crear cliente nuevo si no existe
      cliente = await prisma.cliente.create({
        data: {
          nombre: `Cliente WhatsApp ${clienteTelefono}`,
          telefono: clienteTelefono,
          negocioId: negocio.id,
        },
      });
    }

    // Guardar el mensaje en el historial de conversación
    await prisma.historialConversacion.create({
      data: {
        clienteId: cliente.id,
        negocioId: negocio.id,
        mensaje: Body,
        tipo: "RECIBIDO",
        origen: "WHATSAPP",
      },
    });

    // Aquí podrías procesar el mensaje con Sebastian si el plan lo permite
    // Por ahora, solo guardamos el mensaje

    res.json({
      mensaje: "Webhook procesado exitosamente",
      negocio: negocio.nombre,
      cliente: cliente.nombre,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al procesar webhook de WhatsApp",
    });
  }
}

export async function verificarWebhookWhatsApp(req, res) {
  try {
    // Para verificar el webhook con WhatsApp Business API
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'food-control-whatsapp-verify';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}
