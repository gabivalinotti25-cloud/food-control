import prisma from "../prisma.js";

export async function crearPedido(req, res) {
  try {
    const {
      clienteId,
      total,
      estadoPago,
      formaPago,
    } = req.body;

    // Crear el pedido
    const pedido = await prisma.pedido.create({
      data: {
        total: Number(total),
        clienteId: Number(clienteId),
        estado: "ENTREGADO",
        estadoPago,

        pago:
          estadoPago === "PAGADO"
            ? {
                create: {
                  monto: Number(total),
                  forma: formaPago,
                },
              }
            : undefined,
      },
      include: {
        cliente: true,
        pago: true,
      },
    });

    // Registrar movimiento en la cuenta corriente
    await prisma.movimientoCuenta.create({
      data: {
        clienteId: Number(clienteId),
        tipo: "CARGO",
        concepto: `Pedido #${pedido.id}`,
        monto: Number(total),
      },
    });

    // Si el pedido quedó pendiente, aumenta el saldo del cliente
    if (estadoPago === "PENDIENTE") {
      await prisma.cliente.update({
        where: {
          id: Number(clienteId),
        },
        data: {
          saldo: {
            increment: Number(total),
          },
        },
      });
    }

    res.status(201).json(pedido);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al crear el pedido",
    });
  }
}

export async function listarPedidos(req, res) {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: true,
        pago: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });

    res.json(pedidos);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al listar pedidos",
    });
  }
}