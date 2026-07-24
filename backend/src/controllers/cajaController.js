import prisma from "../prisma.js";
import { parseFechaDia } from "../utils/fechas.js";

export async function obtenerResumenCaja(req, res) {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ error: "Fecha requerida" });
    }

    const { inicio, fin } = parseFechaDia(fecha);

    const [pedidos, caja] = await Promise.all([
      prisma.pedido.findMany({
        where: { fecha: { gte: inicio, lt: fin } },
        include: { cliente: true, pago: true, detalles: true },
      }),
      prisma.cajaDiaria.findUnique({ where: { fecha: inicio } }),
    ]);

    const pagados = pedidos.filter((p) => p.estadoPago === "PAGADO");
    const pendientes = pedidos.filter((p) => p.estadoPago === "PENDIENTE");

    res.json({
      fecha,
      pedidos,
      caja,
      totales: {
        efectivo: pagados
          .filter((p) => p.pago?.forma === "EFECTIVO")
          .reduce((s, p) => s + p.total, 0),
        transferencia: pagados
          .filter((p) => p.pago?.forma === "TRANSFERENCIA")
          .reduce((s, p) => s + p.total, 0),
        fiado: pendientes.reduce((s, p) => s + p.total, 0),
        total: pedidos.reduce((s, p) => s + p.total, 0),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener resumen de caja" });
  }
}

export async function obtenerCajaHoy(req, res) {
  return obtenerResumenCaja(req, res);
}

export async function crearOCrearCajaDiaria(req, res) {
  try {
    const fechaStr = req.body.fecha || req.query.fecha;
    const { inicio } = fechaStr
      ? parseFechaDia(fechaStr)
      : parseFechaDia(new Date().toISOString().split("T")[0]);

    let caja = await prisma.cajaDiaria.findUnique({ where: { fecha: inicio } });

    if (!caja) {
      caja = await prisma.cajaDiaria.create({ data: { fecha: inicio } });
    }

    res.json(caja);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear/obtener caja diaria" });
  }
}

export async function actualizarMontosReales(req, res) {
  try {
    const { id } = req.params;
    const { montoEfectivoReal, montoTransferenciaReal, observacion } = req.body;

    const caja = await prisma.cajaDiaria.update({
      where: { id: Number(id) },
      data: {
        montoEfectivoReal: Number(montoEfectivoReal),
        montoTransferenciaReal: Number(montoTransferenciaReal),
        observacion,
      },
    });

    res.json(caja);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar montos reales" });
  }
}

export async function cerrarCaja(req, res) {
  try {
    const caja = await prisma.cajaDiaria.update({
      where: { id: Number(req.params.id) },
      data: { cerrada: true, fechaCierre: new Date() },
    });
    res.json(caja);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cerrar caja" });
  }
}

export async function listarCajas(req, res) {
  try {
    const cajas = await prisma.cajaDiaria.findMany({
      orderBy: { fecha: "desc" },
      take: 30,
    });
    res.json(cajas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar cajas" });
  }
}
