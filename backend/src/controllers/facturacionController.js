import prisma from "../prisma.js";
import { emailFacturaEmitida } from "../services/email.js";

const IVA = 0.21;

async function generarNumeroFactura() {
  const ultima = await prisma.factura.findFirst({
    orderBy: { id: "desc" },
    select: { numero: true },
  });
  const siguiente = ultima ? parseInt(ultima.numero.split("-")[1] || "0") + 1 : 1;
  return `FC-${String(siguiente).padStart(6, "0")}`;
}

export async function crearFactura(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { concepto, monto, suscripcionId, diasVencimiento = 15 } = req.body;

    if (!concepto || !monto || monto <= 0) {
      return res.status(400).json({ error: "Concepto y monto válido son obligatorios" });
    }

    const impuestos = Math.round(monto * IVA);
    const total = monto + impuestos;
    const numero = await generarNumeroFactura();

    const factura = await prisma.factura.create({
      data: {
        numero,
        concepto,
        monto,
        impuestos,
        total,
        negocioId,
        suscripcionId: suscripcionId || null,
        fechaVencimiento: new Date(Date.now() + diasVencimiento * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({ mensaje: "Factura creada", factura });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear factura" });
  }
}

export async function obtenerFacturas(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { estado } = req.query;

    const facturas = await prisma.factura.findMany({
      where: {
        negocioId,
        ...(estado && { estado }),
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener facturas" });
  }
}

export async function obtenerFactura(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { id } = req.params;

    const factura = await prisma.factura.findFirst({
      where: { id: parseInt(id), negocioId },
      include: { suscripcion: true },
    });

    if (!factura) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    res.json(factura);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener factura" });
  }
}

export async function marcarPagada(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { id } = req.params;
    const { metodoPago } = req.body;

    const factura = await prisma.factura.findFirst({
      where: { id: parseInt(id), negocioId },
    });

    if (!factura) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }
    if (factura.estado === "PAGADA") {
      return res.status(400).json({ error: "La factura ya está pagada" });
    }

    const actualizada = await prisma.factura.update({
      where: { id: factura.id },
      data: {
        estado: "PAGADA",
        fechaPago: new Date(),
        metodoPago: metodoPago || null,
      },
    });

    res.json({ mensaje: "Factura marcada como pagada", factura: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al marcar factura" });
  }
}

export async function anularFactura(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { id } = req.params;

    const factura = await prisma.factura.findFirst({
      where: { id: parseInt(id), negocioId },
    });

    if (!factura) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }
    if (factura.estado === "PAGADA") {
      return res.status(400).json({ error: "No se puede anular una factura pagada" });
    }

    const actualizada = await prisma.factura.update({
      where: { id: factura.id },
      data: { estado: "ANULADA" },
    });

    res.json({ mensaje: "Factura anulada", factura: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al anular factura" });
  }
}

// ============ SUPER-ADMIN (solo dueño de la plataforma, negocioId = 1) ============

function esSuperAdmin(req) {
  return req.usuario?.rol === "ADMIN" && req.usuario?.negocioId === 1;
}

// Crear factura para cualquier negocio (super-admin)
export async function crearFacturaAdmin(req, res) {
  try {
    if (!esSuperAdmin(req)) {
      return res.status(403).json({ error: "Acceso solo para el administrador de la plataforma" });
    }

    const { negocioId, concepto, monto, diasVencimiento = 15 } = req.body;

    if (!negocioId || !concepto || !monto || monto <= 0) {
      return res.status(400).json({ error: "negocioId, concepto y monto válido son obligatorios" });
    }

    const negocio = await prisma.negocio.findUnique({ where: { id: Number(negocioId) } });
    if (!negocio) {
      return res.status(404).json({ error: "Negocio no encontrado" });
    }

    const impuestos = Math.round(monto * IVA);
    const total = monto + impuestos;
    const numero = await generarNumeroFactura();

    const factura = await prisma.factura.create({
      data: {
        numero,
        concepto,
        monto,
        impuestos,
        total,
        negocioId: Number(negocioId),
        fechaVencimiento: new Date(Date.now() + diasVencimiento * 24 * 60 * 60 * 1000),
      },
    });

    // Notificar al negocio por email (no bloquea si falla)
    emailFacturaEmitida({
      email: negocio.email,
      nombreNegocio: negocio.nombre,
      numero: factura.numero,
      total: factura.total,
      fechaVencimiento: factura.fechaVencimiento,
    }).catch(() => {});

    res.status(201).json({ mensaje: "Factura creada", factura });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear factura" });
  }
}

// Marcar pagada una factura de cualquier negocio (super-admin)
export async function marcarPagadaAdmin(req, res) {
  try {
    if (!esSuperAdmin(req)) {
      return res.status(403).json({ error: "Acceso solo para el administrador de la plataforma" });
    }

    const { id } = req.params;
    const { metodoPago } = req.body;

    const factura = await prisma.factura.findUnique({ where: { id: Number(id) } });
    if (!factura) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }
    if (factura.estado === "PAGADA") {
      return res.status(400).json({ error: "La factura ya está pagada" });
    }

    const actualizada = await prisma.factura.update({
      where: { id: factura.id },
      data: {
        estado: "PAGADA",
        fechaPago: new Date(),
        metodoPago: metodoPago || "EFECTIVO",
      },
    });

    // Si el negocio estaba suspendido por mora, reactivarlo
    await prisma.negocio.updateMany({
      where: {
        id: factura.negocioId,
        estado: "SUSPENDIDO",
        facturas: { none: { estado: { in: ["PENDIENTE", "VENCIDA"] } } },
      },
      data: { estado: "ACTIVO" },
    });

    res.json({ mensaje: "Factura marcada como pagada", factura: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al marcar factura" });
  }
}

// Listar facturas de un negocio específico (super-admin)
export async function facturasDeNegocio(req, res) {
  try {
    if (!esSuperAdmin(req)) {
      return res.status(403).json({ error: "Acceso solo para el administrador de la plataforma" });
    }

    const facturas = await prisma.factura.findMany({
      where: { negocioId: Number(req.params.negocioId) },
      orderBy: { createdAt: "desc" },
    });

    res.json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener facturas" });
  }
}

// Lógica reutilizable: marcar vencidas y suspender negocios morosos
export async function ejecutarVerificacionVencidas() {
  const ahora = new Date();

  const vencidas = await prisma.factura.updateMany({
    where: { estado: "PENDIENTE", fechaVencimiento: { lt: ahora } },
    data: { estado: "VENCIDA" },
  });

  // Suspender negocios con facturas vencidas hace más de 7 días
  const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
  const facturasAntiguas = await prisma.factura.findMany({
    where: { estado: "VENCIDA", fechaVencimiento: { lt: hace7Dias } },
    select: { negocioId: true },
    distinct: ["negocioId"],
  });

  for (const f of facturasAntiguas) {
    await prisma.negocio.update({
      where: { id: f.negocioId },
      data: { estado: "SUSPENDIDO" },
    });
  }

  return {
    facturasVencidas: vencidas.count,
    negociosSuspendidos: facturasAntiguas.length,
  };
}

// Cron: marcar facturas vencidas y suspender negocios con deuda
export async function verificarVencidas(req, res) {
  try {
    const resultado = await ejecutarVerificacionVencidas();
    res.json({ mensaje: "Verificación completada", ...resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al verificar facturas vencidas" });
  }
}

// Cron: generar facturas mensuales para suscripciones activas
export async function generarFacturasMensuales(req, res) {
  try {
    const suscripciones = await prisma.suscripcion.findMany({
      where: {
        estado: "ACTIVA",
        precioMensual: { gt: 0 },
        OR: [
          { fechaVencimiento: null },
          { fechaVencimiento: { lte: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) } },
        ],
      },
      include: { negocio: { select: { nombre: true } } },
    });

    const creadas = [];

    for (const sub of suscripciones) {
      const impuestos = Math.round(sub.precioMensual * IVA);
      const numero = await generarNumeroFactura();

      const factura = await prisma.factura.create({
        data: {
          numero,
          concepto: `Suscripción ${sub.plan} - ${sub.negocio.nombre}`,
          monto: sub.precioMensual,
          impuestos,
          total: sub.precioMensual + impuestos,
          negocioId: sub.negocioId,
          suscripcionId: sub.id,
          fechaVencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
      });

      // Extender vencimiento de la suscripción
      await prisma.suscripcion.update({
        where: { id: sub.id },
        data: { fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      });

      creadas.push(factura.numero);
    }

    res.json({ mensaje: "Facturación mensual completada", facturasCreadas: creadas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar facturas mensuales" });
  }
}
