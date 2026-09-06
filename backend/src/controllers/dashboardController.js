import prisma from "../prisma.js";

export async function obtenerDashboard(req, res) {
  try {
    const negocioId = req.negocioId;
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
      usuarios,
      productos,
    ] = await Promise.all([
      prisma.cliente.count({
        where: { negocioId }
      }),

      prisma.pedido.count({
        where: { negocioId }
      }),

      prisma.pedido.count({
        where: {
          negocioId,
          estado: {
            not: "ENTREGADO",
          },
        },
      }),

      prisma.pedido.aggregate({
        where: { negocioId },
        _sum: {
          total: true,
        },
      }),

      prisma.pedido.aggregate({
        where: {
          negocioId,
          fecha: {
            gte: hoy,
          },
        },
        _sum: {
          total: true,
        },
      }),

      prisma.movimientoCuenta.findMany({
        where: { negocioId }
      }),

      prisma.pedido.findMany({
        where: { negocioId },
        include: {
          cliente: true,
          pago: true,
        },
        orderBy: {
          fecha: "desc",
        },
        take: 10,
      }),

      prisma.usuario.count({
        where: { negocioId }
      }),

      prisma.producto.count({
        where: { negocioId }
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

    // Obtener información del negocio y sus límites
    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: {
        plan: true,
        maxUsuarios: true,
        maxClientes: true,
        maxPedidosMes: true,
        maxSebastianMsg: true,
        trialEndsAt: true,
      },
    });

    // Calcular pedidos del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const pedidosMes = await prisma.pedido.count({
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

    res.json({
      clientes,
      pedidos,
      pedidosPendientes,
      ventasTotales: ventas._sum.total || 0,
      ventasHoy: ventasHoy._sum.total || 0,
      clientesConDeuda: clientesConDeuda.length,
      montoAdeudado,
      ultimosPedidos,
      usuarios,
      productos,
      negocio: {
        plan: negocio.plan,
        estaEnTrial,
        diasRestantesTrial,
        limites: {
          usuarios: negocio.maxUsuarios,
          clientes: negocio.maxClientes,
          pedidosMes: negocio.maxPedidosMes,
          sebastianMsg: negocio.maxSebastianMsg,
        },
        usoActual: {
          usuarios,
          clientes,
          pedidosMes,
        },
        excedeLimites: {
          usuarios: negocio.maxUsuarios !== -1 && usuarios >= negocio.maxUsuarios,
          clientes: negocio.maxClientes !== -1 && clientes >= negocio.maxClientes,
          pedidosMes: negocio.maxPedidosMes !== -1 && pedidosMes >= negocio.maxPedidosMes,
        },
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener dashboard",
    });
  }
}