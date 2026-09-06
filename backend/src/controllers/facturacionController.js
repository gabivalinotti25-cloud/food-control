import prisma from "../prisma.js";

// Generar número de factura único
function generarNumeroFactura(negocioId) {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FCT-${negocioId}-${año}${mes}-${random}`;
}

// Calcular impuesto (21% IVA para Argentina)
function calcularImpuesto(subtotal) {
  return Math.round(subtotal * 0.21);
}

export async function crearFactura(req, res) {
  try {
    const { suscripcionId } = req.body;

    // Obtener la suscripción
    const suscripcion = await prisma.suscripcion.findUnique({
      where: { id: suscripcionId },
      include: {
        negocio: true,
      },
    });

    if (!suscripcion) {
      return res.status(404).json({
        error: "Suscripción no encontrada",
      });
    }

    // Verificar si ya existe una factura para este período
    const inicioPeriodo = new Date(suscripcion.periodoInicio);
    inicioPeriodo.setHours(0, 0, 0, 0);

    const finPeriodo = new Date(suscripcion.periodoFin);
    finPeriodo.setHours(23, 59, 59, 999);

    const facturaExistente = await prisma.factura.findFirst({
      where: {
        suscripcionId,
        fechaEmision: {
          gte: inicioPeriodo,
          lte: finPeriodo,
        },
      },
    });

    if (facturaExistente) {
      return res.status(400).json({
        error: "Ya existe una factura para este período de suscripción",
        factura: facturaExistente,
      });
    }

    // Calcular montos
    const subtotal = suscripcion.precio;
    const impuesto = calcularImpuesto(subtotal);
    const total = subtotal + impuesto;

    // Calcular fecha de vencimiento (7 días después de la emisión)
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);

    // Generar número de factura
    const numero = generarNumeroFactura(suscripcion.negocioId);

    // Crear factura
    const factura = await prisma.factura.create({
      data: {
        negocioId: suscripcion.negocioId,
        suscripcionId,
        numero,
        estado: "PENDIENTE",
        subtotal,
        impuesto,
        total,
        moneda: suscripcion.moneda,
        fechaVencimiento,
        metodoPago: suscripcion.metodoPago,
        paymentProviderId: suscripcion.paymentProviderId,
        paymentProvider: suscripcion.paymentProvider,
      },
    });

    res.status(201).json({
      mensaje: "Factura creada exitosamente",
      factura,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al crear factura",
    });
  }
}

export async function obtenerFacturas(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const facturas = await prisma.factura.findMany({
      where: { negocioId },
      include: {
        suscripcion: {
          select: {
            id: true,
            plan: true,
            estado: true,
          },
        },
      },
      orderBy: {
        fechaEmision: "desc",
      },
    });

    res.json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener facturas",
    });
  }
}

export async function obtenerFactura(req, res) {
  try {
    const { id } = req.params;
    const negocioId = req.usuario.negocioId;

    const factura = await prisma.factura.findFirst({
      where: {
        id: Number(id),
        negocioId,
      },
      include: {
        suscripcion: {
          select: {
            id: true,
            plan: true,
            estado: true,
            periodoInicio: true,
            periodoFin: true,
          },
        },
        negocio: {
          select: {
            id: true,
            nombre: true,
            email: true,
            direccion: true,
          },
        },
      },
    });

    if (!factura) {
      return res.status(404).json({
        error: "Factura no encontrada",
      });
    }

    res.json(factura);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener factura",
    });
  }
}

export async function marcarFacturaPagada(req, res) {
  try {
    const { id } = req.params;
    const negocioId = req.usuario.negocioId;
    const { metodoPago, paymentProviderId, paymentProvider } = req.body;

    const factura = await prisma.factura.findFirst({
      where: {
        id: Number(id),
        negocioId,
      },
    });

    if (!factura) {
      return res.status(404).json({
        error: "Factura no encontrada",
      });
    }

    if (factura.estado === "PAGADA") {
      return res.status(400).json({
        error: "La factura ya está marcada como pagada",
      });
    }

    // Actualizar factura
    const facturaActualizada = await prisma.factura.update({
      where: { id: Number(id) },
      data: {
        estado: "PAGADA",
        fechaPago: new Date(),
        metodoPago: metodoPago || factura.metodoPago,
        paymentProviderId: paymentProviderId || factura.paymentProviderId,
        paymentProvider: paymentProvider || factura.paymentProvider,
      },
    });

    // Si la suscripción estaba cancelada, reactivarla
    if (facturaActualizada.estado === "PAGADA") {
      await prisma.suscripcion.update({
        where: { id: factura.suscripcionId },
        data: {
          estado: "ACTIVA",
          renovacionAuto: true,
        },
      });
    }

    res.json({
      mensaje: "Factura marcada como pagada exitosamente",
      factura: facturaActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al marcar factura como pagada",
    });
  }
}

export async function anularFactura(req, res) {
  try {
    const { id } = req.params;
    const negocioId = req.usuario.negocioId;

    const factura = await prisma.factura.findFirst({
      where: {
        id: Number(id),
        negocioId,
      },
    });

    if (!factura) {
      return res.status(404).json({
        error: "Factura no encontrada",
      });
    }

    if (factura.estado === "ANULADA") {
      return res.status(400).json({
        error: "La factura ya está anulada",
      });
    }

    if (factura.estado === "PAGADA") {
      return res.status(400).json({
        error: "No se puede anular una factura ya pagada",
      });
    }

    // Anular factura
    const facturaActualizada = await prisma.factura.update({
      where: { id: Number(id) },
      data: {
        estado: "ANULADA",
      },
    });

    res.json({
      mensaje: "Factura anulada exitosamente",
      factura: facturaActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al anular factura",
    });
  }
}

export async function verificarFacturasVencidas(req, res) {
  try {
    // Esta función debería ser ejecutada por un cron job diario
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar facturas vencidas que aún estén pendientes
    const facturasVencidas = await prisma.factura.findMany({
      where: {
        estado: "PENDIENTE",
        fechaVencimiento: {
          lt: hoy,
        },
      },
      include: {
        negocio: true,
        suscripcion: true,
      },
    });

    // Marcar facturas como vencidas
    const facturasActualizadas = await Promise.all(
      facturasVencidas.map((factura) =>
        prisma.factura.update({
          where: { id: factura.id },
          data: {
            estado: "VENCIDA",
          },
        })
      )
    );

    // Si hay suscripciones con facturas vencidas, suspenderlas
    for (const factura of facturasVencidas) {
      if (factura.suscripcion.renovacionAuto) {
        await prisma.suscripcion.update({
          where: { id: factura.suscripcionId },
          data: {
            estado: "CANCELADA",
            renovacionAuto: false,
          },
        });

        // Suspender el negocio
        await prisma.negocio.update({
          where: { id: factura.negocioId },
          data: {
            estado: "SUSPENDIDO",
          },
        });
      }
    }

    res.json({
      mensaje: "Verificación de facturas vencidas completada",
      facturasVencidas: facturasActualizadas.length,
      facturas: facturasActualizadas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al verificar facturas vencidas",
    });
  }
}

export async function generarFacturaMensual(req, res) {
  try {
    // Esta función debería ser ejecutada por un cron job mensual
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    // Buscar suscripciones activas que terminan este mes
    const suscripcionesARenovar = await prisma.suscripcion.findMany({
      where: {
        estado: "ACTIVA",
        renovacionAuto: true,
        periodoFin: {
          gte: inicioMes,
          lte: finMes,
        },
      },
      include: {
        negocio: true,
      },
    });

    const facturasCreadas = [];

    for (const suscripcion of suscripcionesARenovar) {
      // Verificar si ya existe factura para este período
      const facturaExistente = await prisma.factura.findFirst({
        where: {
          suscripcionId: suscripcion.id,
          fechaEmision: {
            gte: inicioMes,
            lte: finMes,
          },
        },
      });

      if (!facturaExistente) {
        // Calcular montos
        const subtotal = suscripcion.precio;
        const impuesto = calcularImpuesto(subtotal);
        const total = subtotal + impuesto;

        // Calcular fecha de vencimiento (7 días después de la emisión)
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);

        // Generar número de factura
        const numero = generarNumeroFactura(suscripcion.negocioId);

        // Crear factura
        const factura = await prisma.factura.create({
          data: {
            negocioId: suscripcion.negocioId,
            suscripcionId: suscripcion.id,
            numero,
            estado: "PENDIENTE",
            subtotal,
            impuesto,
            total,
            moneda: suscripcion.moneda,
            fechaVencimiento,
            metodoPago: suscripcion.metodoPago,
            paymentProviderId: suscripcion.paymentProviderId,
            paymentProvider: suscripcion.paymentProvider,
          },
        });

        facturasCreadas.push(factura);

        // Extender el período de la suscripción
        const nuevoPeriodoFin = new Date(suscripcion.periodoFin);
        nuevoPeriodoFin.setMonth(nuevoPeriodoFin.getMonth() + 1);

        await prisma.suscripcion.update({
          where: { id: suscripcion.id },
          data: {
            periodoFin: nuevoPeriodoFin,
          },
        });
      }
    }

    res.json({
      mensaje: "Facturación mensual completada",
      suscripcionesProcesadas: suscripcionesARenovar.length,
      facturasCreadas: facturasCreadas.length,
      facturas: facturasCreadas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al generar facturación mensual",
    });
  }
}
