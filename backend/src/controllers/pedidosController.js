import prisma from "../prisma.js";
import { parseFechaDia, fechaDiaExacta } from "../utils/fechas.js";

function calcularTotal(detalles, totalDirecto) {
  if (detalles?.length) {
    return detalles.reduce(
      (sum, d) => sum + Number(d.cantidad) * Number(d.precioUnitario),
      0
    );
  }
  return Number(totalDirecto || 0);
}

export async function crearPedido(req, res) {
  try {
    const {
      clienteId,
      total,
      estadoPago,
      formaPago,
      fecha,
      detalles,
      observacion,
    } = req.body;

    if (!clienteId) {
      return res.status(400).json({ error: "Cliente requerido" });
    }

    const totalPedido = calcularTotal(detalles, total);
    if (totalPedido <= 0) {
      return res.status(400).json({ error: "El total debe ser mayor a 0" });
    }

    const fechaPedido = fecha ? fechaDiaExacta(fecha) : new Date();

    const pedido = await prisma.pedido.create({
      data: {
        total: totalPedido,
        clienteId: Number(clienteId),
        estado: "ENTREGADO",
        estadoPago: estadoPago || "PAGADO",
        fecha: fechaPedido,
        pago:
          estadoPago === "PAGADO"
            ? {
                create: {
                  monto: totalPedido,
                  forma: formaPago || "EFECTIVO",
                },
              }
            : undefined,
        detalles: detalles?.length
          ? {
              create: detalles.map((d) => ({
                productoId: d.productoId ? Number(d.productoId) : null,
                descripcion: d.descripcion || null,
                cantidad: Number(d.cantidad) || 1,
                precioUnitario: Number(d.precioUnitario),
                subtotal:
                  Number(d.cantidad || 1) * Number(d.precioUnitario),
              })),
            }
          : {
              create: [
                {
                  descripcion: observacion || "Pedido",
                  cantidad: 1,
                  precioUnitario: totalPedido,
                  subtotal: totalPedido,
                },
              ],
            },
      },
      include: {
        cliente: true,
        pago: true,
        detalles: { include: { producto: true } },
      },
    });

    if (estadoPago === "PENDIENTE") {
      await prisma.movimientoCuenta.create({
        data: {
          clienteId: Number(clienteId),
          tipo: "CARGO",
          concepto: `Pedido #${pedido.id}${observacion ? ` - ${observacion}` : ""}`,
          monto: totalPedido,
          fecha: fechaPedido,
        },
      });

      await prisma.cliente.update({
        where: { id: Number(clienteId) },
        data: { saldo: { increment: totalPedido } },
      });
    }

    res.status(201).json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el pedido" });
  }
}

export async function listarPedidos(req, res) {
  try {
    const { fecha } = req.query;
    const where = {};

    if (fecha) {
      const { inicio, fin } = parseFechaDia(fecha);
      where.fecha = { gte: inicio, lt: fin };
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        cliente: true,
        pago: true,
        detalles: { include: { producto: true } },
      },
      orderBy: { fecha: "desc" },
    });

    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar pedidos" });
  }
}

export async function eliminarPedido(req, res) {
  try {
    const { id } = req.params;
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(id) },
      include: { pago: true },
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (pedido.estadoPago === "PENDIENTE") {
      await prisma.movimientoCuenta.deleteMany({
        where: {
          clienteId: pedido.clienteId,
          concepto: { contains: `#${pedido.id}` },
          tipo: "CARGO",
        },
      });

      await prisma.cliente.update({
        where: { id: pedido.clienteId },
        data: { saldo: { decrement: pedido.total } },
      });
    }

    await prisma.pedido.delete({ where: { id: Number(id) } });
    res.json({ mensaje: "Pedido eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar pedido" });
  }
}
