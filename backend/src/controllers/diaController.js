import prisma from "../prisma.js";
import { parseFechaDia, hoyISO } from "../utils/fechas.js";

export async function obtenerDia(req, res) {
  try {
    const fecha = req.params.fecha || hoyISO();
    const { inicio, fin } = parseFechaDia(fecha);

    const [pedidos, menu, clientesConDeuda] = await Promise.all([
      prisma.pedido.findMany({
        where: { fecha: { gte: inicio, lt: fin } },
        include: {
          cliente: true,
          pago: true,
          detalles: { include: { producto: true } },
        },
        orderBy: { fecha: "asc" },
      }),
      prisma.menuDiario.findUnique({
        where: { fecha: inicio },
        include: {
          productos: { include: { producto: true } },
        },
      }),
      prisma.cliente.findMany({
        where: { saldo: { gt: 0 } },
        orderBy: { saldo: "desc" },
      }),
    ]);

    const pagados = pedidos.filter((p) => p.estadoPago === "PAGADO");
    const fiados = pedidos.filter((p) => p.estadoPago === "PENDIENTE");

    const resumen = {
      totalPedidos: pedidos.length,
      efectivo: pagados
        .filter((p) => p.pago?.forma === "EFECTIVO")
        .reduce((s, p) => s + p.total, 0),
      transferencia: pagados
        .filter((p) => p.pago?.forma === "TRANSFERENCIA")
        .reduce((s, p) => s + p.total, 0),
      fiado: fiados.reduce((s, p) => s + p.total, 0),
      totalVendido: pedidos.reduce((s, p) => s + p.total, 0),
    };

    res.json({
      fecha,
      pedidos,
      menu,
      clientesConDeuda,
      resumen,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener datos del día" });
  }
}
