import prisma from "../prisma.js";

const PLANES = {
  GRATIS: { precio: 0, maxUsuarios: 3, maxClientes: 50, maxPedidosMes: 100, maxSebastianMsg: 20 },
  BASICO: { precio: 29, maxUsuarios: 5, maxClientes: 200, maxPedidosMes: 500, maxSebastianMsg: 100 },
  PRO: { precio: 79, maxUsuarios: 15, maxClientes: 1000, maxPedidosMes: 2000, maxSebastianMsg: 500 },
  ENTERPRISE: { precio: 199, maxUsuarios: -1, maxClientes: -1, maxPedidosMes: -1, maxSebastianMsg: -1 },
};

// Crear o cambiar suscripción del negocio
export async function crearSuscripcion(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { plan, metodoPago } = req.body;

    if (!plan || !PLANES[plan]) {
      return res.status(400).json({ error: "Plan inválido" });
    }

    // Cancelar suscripciones activas anteriores
    await prisma.suscripcion.updateMany({
      where: { negocioId, estado: { in: ["ACTIVA", "PRUEBA"] } },
      data: { estado: "CANCELADA", fechaCancelacion: new Date() },
    });

    const config = PLANES[plan];
    const esPago = config.precio > 0;

    const suscripcion = await prisma.suscripcion.create({
      data: {
        negocioId,
        plan,
        estado: esPago ? "ACTIVA" : "PRUEBA",
        metodoPago: metodoPago || null,
        precioMensual: config.precio,
        fechaVencimiento: esPago
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
      },
    });

    // Actualizar plan y límites del negocio
    await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        plan,
        maxUsuarios: config.maxUsuarios,
        maxClientes: config.maxClientes,
        maxPedidosMes: config.maxPedidosMes,
        maxSebastianMsg: config.maxSebastianMsg,
      },
    });

    res.status(201).json({
      mensaje: "Suscripción creada exitosamente",
      suscripcion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear suscripción" });
  }
}

export async function obtenerSuscripcion(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const suscripcion = await prisma.suscripcion.findFirst({
      where: { negocioId, estado: { in: ["ACTIVA", "PRUEBA"] } },
      orderBy: { createdAt: "desc" },
      include: { facturas: { orderBy: { createdAt: "desc" }, take: 5 } },
    });

    if (!suscripcion) {
      return res.json({ suscripcion: null, mensaje: "Sin suscripción activa" });
    }

    res.json({ suscripcion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener suscripción" });
  }
}

export async function cancelarSuscripcion(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const suscripcion = await prisma.suscripcion.findFirst({
      where: { negocioId, estado: { in: ["ACTIVA", "PRUEBA"] } },
    });

    if (!suscripcion) {
      return res.status(404).json({ error: "No hay suscripción activa" });
    }

    await prisma.suscripcion.update({
      where: { id: suscripcion.id },
      data: { estado: "CANCELADA", fechaCancelacion: new Date() },
    });

    // Volver al plan gratis
    const config = PLANES.GRATIS;
    await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        plan: "GRATIS",
        maxUsuarios: config.maxUsuarios,
        maxClientes: config.maxClientes,
        maxPedidosMes: config.maxPedidosMes,
        maxSebastianMsg: config.maxSebastianMsg,
      },
    });

    res.json({ mensaje: "Suscripción cancelada. El negocio vuelve al plan gratuito." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cancelar suscripción" });
  }
}

export async function historialSuscripciones(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const historial = await prisma.suscripcion.findMany({
      where: { negocioId },
      orderBy: { createdAt: "desc" },
    });

    res.json(historial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
}

// Verificar estado de suscripción y trial del negocio
export async function verificarEstado(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: { plan: true, estado: true, trialEndsAt: true },
    });

    if (!negocio) {
      return res.status(404).json({ error: "Negocio no encontrado" });
    }

    const ahora = new Date();
    const enTrial = negocio.trialEndsAt && negocio.trialEndsAt > ahora;
    const diasTrialRestantes = enTrial
      ? Math.ceil((negocio.trialEndsAt - ahora) / (1000 * 60 * 60 * 24))
      : 0;

    res.json({
      plan: negocio.plan,
      estado: negocio.estado,
      enTrial,
      diasTrialRestantes,
      trialEndsAt: negocio.trialEndsAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al verificar estado" });
  }
}
