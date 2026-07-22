import prisma from "../prisma.js";

export async function obtenerDashboard(req, res) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [
      clientes,
      pedidos,
      pedidosPendientes,
      ventas,
      ventasHoy,
      movimientos,
      ultimosPedidos,
    ] = await Promise.all([
      prisma.cliente.count(),

      prisma.pedido.count(),

      prisma.pedido.count({
        where: {
          estado: {
            not: "ENTREGADO",
          },
        },
      }),

      prisma.pedido.aggregate({
        _sum: {
          total: true,
        },
      }),

      prisma.pedido.aggregate({
        where: {
          fecha: {
            gte: hoy,
          },
        },
        _sum: {
          total: true,
        },
      }),

      prisma.movimientoCuenta.findMany(),

      prisma.pedido.findMany({
        include: {
          cliente: true,
          pago: true,
        },
        orderBy: {
          fecha: "desc",
        },
        take: 10,
      }),
    ]);

    const saldoPorCliente = {};

    movimientos.forEach((m) => {
      if (!saldoPorCliente[m.clienteId]) {
        saldoPorCliente[m.clienteId] = 0;
      }

      if (m.tipo === "CARGO") {
        saldoPorCliente[m.clienteId] += m.monto;
      } else {
        saldoPorCliente[m.clienteId] -= m.monto;
      }
    });

    const clientesConDeuda = Object.values(saldoPorCliente).filter(
      (saldo) => saldo > 0
    );

    const montoAdeudado = clientesConDeuda.reduce(
      (acc, saldo) => acc + saldo,
      0
    );

    res.json({
      clientes,
      pedidos,
      pedidosPendientes,
      ventasTotales: ventas._sum.total || 0,
      ventasHoy: ventasHoy._sum.total || 0,
      clientesConDeuda: clientesConDeuda.length,
      montoAdeudado,
      ultimosPedidos,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener dashboard",
    });
  }
}