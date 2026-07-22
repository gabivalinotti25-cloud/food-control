import prisma from "../prisma.js";

export async function listarDeudas(req, res) {
  try {
    const deudas = await prisma.pedido.findMany({
      where: {
        estadoPago: "PENDIENTE",
      },
      include: {
        cliente: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });

    res.json(deudas);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener las deudas",
    });
  }
}

export async function listarDeudasPorCliente(req, res) {
  try {
    const { clienteId } = req.params;

    const deudas = await prisma.pedido.findMany({
      where: {
        clienteId: Number(clienteId),
        estadoPago: "PENDIENTE",
      },
      include: {
        cliente: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });

    res.json(deudas);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener las deudas del cliente",
    });
  }
}

export async function marcarPedidoPagado(req, res) {
  try {
    const { pedidoId, formaPago } = req.body;

    const pedido = await prisma.pedido.update({
      where: {
        id: Number(pedidoId),
      },
      data: {
        estadoPago: "PAGADO",
        pago: {
          create: {
            monto: req.body.monto,
            forma: formaPago,
          },
        },
      },
      include: {
        cliente: true,
      },
    });

    // Actualizar saldo del cliente
    await prisma.cliente.update({
      where: {
        id: pedido.clienteId,
      },
      data: {
        saldo: {
          decrement: pedido.total,
        },
      },
    });

    // Registrar movimiento
    await prisma.movimientoCuenta.create({
      data: {
        clienteId: pedido.clienteId,
        tipo: "ABONO",
        concepto: `Pago pedido #${pedidoId}`,
        monto: pedido.total,
        formaPago,
      },
    });

    res.json(pedido);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al marcar pedido como pagado",
    });
  }
}

export async function obtenerResumenDeudas(req, res) {
  try {
    const clientes = await prisma.cliente.findMany({
      where: {
        saldo: {
          gt: 0,
        },
      },
      orderBy: {
        saldo: "desc",
      },
    });

    const totalDeuda = clientes.reduce((sum, c) => sum + c.saldo, 0);

    res.json({
      clientesConDeuda: clientes.length,
      totalDeuda,
      clientes,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener resumen de deudas",
    });
  }
}