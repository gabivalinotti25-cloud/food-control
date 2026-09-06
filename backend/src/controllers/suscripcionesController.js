import prisma from "../prisma.js";

// Precios de los planes en centavos
const PRECIOS_PLANES = {
  GRATIS: 0,
  BASICO: 2900, // $29 USD
  PRO: 7900, // $79 USD
  ENTERPRISE: 19900, // $199 USD
};

// Límites de los planes
const LIMITES_PLANES = {
  GRATIS: {
    maxUsuarios: 3,
    maxClientes: 50,
    maxPedidosMes: 100,
    maxSebastianMsg: 20,
  },
  BASICO: {
    maxUsuarios: 5,
    maxClientes: 200,
    maxPedidosMes: 500,
    maxSebastianMsg: 100,
  },
  PRO: {
    maxUsuarios: 15,
    maxClientes: 1000,
    maxPedidosMes: 2000,
    maxSebastianMsg: 500,
  },
  ENTERPRISE: {
    maxUsuarios: -1, // Ilimitado
    maxClientes: -1,
    maxPedidosMes: -1,
    maxSebastianMsg: -1,
  },
};

export async function crearSuscripcion(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { plan, metodoPago, paymentProviderId, paymentProvider } = req.body;

    // Validar que el plan sea válido
    if (!["GRATIS", "BASICO", "PRO", "ENTERPRISE"].includes(plan)) {
      return res.status(400).json({
        error: "Plan inválido",
      });
    }

    // Validar método de pago
    if (!["TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA", "MERCADO_PAGO", "STRIPE"].includes(metodoPago)) {
      return res.status(400).json({
        error: "Método de pago inválido",
      });
    }

    // Verificar si ya existe una suscripción activa
    const suscripcionExistente = await prisma.suscripcion.findFirst({
      where: {
        negocioId,
        estado: "ACTIVA",
      },
    });

    if (suscripcionExistente) {
      return res.status(400).json({
        error: "Ya existe una suscripción activa para este negocio",
      });
    }

    // Calcular fecha de fin (1 mes desde ahora)
    const periodoFin = new Date();
    periodoFin.setMonth(periodoFin.getMonth() + 1);

    // Crear suscripción
    const suscripcion = await prisma.suscripcion.create({
      data: {
        negocioId,
        plan,
        metodoPago,
        precio: PRECIOS_PLANES[plan],
        periodoInicio: new Date(),
        periodoFin,
        paymentProviderId,
        paymentProvider,
      },
    });

    // Actualizar el plan del negocio
    const negocioActualizado = await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        plan,
        ...LIMITES_PLANES[plan],
      },
    });

    res.status(201).json({
      mensaje: "Suscripción creada exitosamente",
      suscripcion,
      negocio: negocioActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al crear suscripción",
    });
  }
}

export async function obtenerSuscripcionActual(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const suscripcion = await prisma.suscripcion.findFirst({
      where: {
        negocioId,
        estado: "ACTIVA",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!suscripcion) {
      return res.json(null);
    }

    res.json(suscripcion);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener suscripción",
    });
  }
}

export async function actualizarSuscripcion(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { plan, metodoPago, paymentProviderId, paymentProvider } = req.body;

    // Validar que el plan sea válido
    if (!["GRATIS", "BASICO", "PRO", "ENTERPRISE"].includes(plan)) {
      return res.status(400).json({
        error: "Plan inválido",
      });
    }

    // Obtener suscripción actual
    const suscripcionActual = await prisma.suscripcion.findFirst({
      where: {
        negocioId,
        estado: "ACTIVA",
      },
    });

    if (!suscripcionActual) {
      return res.status(404).json({
        error: "No hay suscripción activa",
      });
    }

    // Cancelar suscripción actual
    await prisma.suscripcion.update({
      where: { id: suscripcionActual.id },
      data: {
        estado: "CANCELADA",
      },
    });

    // Calcular fecha de fin (1 mes desde ahora)
    const periodoFin = new Date();
    periodoFin.setMonth(periodoFin.getMonth() + 1);

    // Crear nueva suscripción
    const nuevaSuscripcion = await prisma.suscripcion.create({
      data: {
        negocioId,
        plan,
        metodoPago,
        precio: PRECIOS_PLANES[plan],
        periodoInicio: new Date(),
        periodoFin,
        paymentProviderId,
        paymentProvider,
      },
    });

    // Actualizar el plan del negocio
    const negocioActualizado = await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        plan,
        ...LIMITES_PLANES[plan],
      },
    });

    res.json({
      mensaje: "Suscripción actualizada exitosamente",
      suscripcion: nuevaSuscripcion,
      negocio: negocioActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al actualizar suscripción",
    });
  }
}

export async function cancelarSuscripcion(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const suscripcion = await prisma.suscripcion.findFirst({
      where: {
        negocioId,
        estado: "ACTIVA",
      },
    });

    if (!suscripcion) {
      return res.status(404).json({
        error: "No hay suscripción activa",
      });
    }

    // Cancelar suscripción pero mantener activa hasta el fin del período
    await prisma.suscripcion.update({
      where: { id: suscripcion.id },
      data: {
        estado: "CANCELADA",
        renovacionAuto: false,
      },
    });

    res.json({
      mensaje: "Suscripción cancelada exitosamente",
      suscripcion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al cancelar suscripción",
    });
  }
}

export async function obtenerHistorialSuscripciones(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const suscripciones = await prisma.suscripcion.findMany({
      where: { negocioId },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(suscripciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener historial de suscripciones",
    });
  }
}

export async function verificarEstadoSuscripcion(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: {
        id: true,
        plan: true,
        estado: true,
        trialEndsAt: true,
        maxUsuarios: true,
        maxClientes: true,
        maxPedidosMes: true,
        maxSebastianMsg: true,
      },
    });

    if (!negocio) {
      return res.status(404).json({
        error: "Negocio no encontrado",
      });
    }

    // Obtener suscripción activa
    const suscripcion = await prisma.suscripcion.findFirst({
      where: {
        negocioId,
        estado: "ACTIVA",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Contar usuarios actuales
    const usuariosCount = await prisma.usuario.count({
      where: { negocioId },
    });

    // Contar clientes actuales
    const clientesCount = await prisma.cliente.count({
      where: { negocioId },
    });

    // Contar pedidos del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const pedidosMesCount = await prisma.pedido.count({
      where: {
        negocioId,
        fecha: {
          gte: inicioMes,
        },
      },
    });

    // Verificar si está en trial
    const estaEnTrial = negocio.trialEndsAt && new Date() < negocio.trialEndsAt;
    const diasRestantesTrial = estaEnTrial
      ? Math.ceil((negocio.trialEndsAt - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    // Verificar si la suscripción está expirada
    const suscripcionExpirada = suscripcion && new Date() > suscripcion.periodoFin;
    const diasRestantesSuscripcion = suscripcion
      ? Math.ceil((suscripcion.periodoFin - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    res.json({
      negocio,
      suscripcion,
      estaEnTrial,
      diasRestantesTrial,
      suscripcionExpirada,
      diasRestantesSuscripcion,
      usoActual: {
        usuarios: usuariosCount,
        clientes: clientesCount,
        pedidosMes: pedidosMesCount,
      },
      limites: {
        usuarios: negocio.maxUsuarios,
        clientes: negocio.maxClientes,
        pedidosMes: negocio.maxPedidosMes,
      },
      excedeLimites: {
        usuarios: negocio.maxUsuarios !== -1 && usuariosCount >= negocio.maxUsuarios,
        clientes: negocio.maxClientes !== -1 && clientesCount >= negocio.maxClientes,
        pedidosMes: negocio.maxPedidosMes !== -1 && pedidosMesCount >= negocio.maxPedidosMes,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al verificar estado de suscripción",
    });
  }
}
