import prisma from "../prisma.js";

export async function registrarPago(req, res) {
  try {
    const { clienteId, monto, formaPago } = req.body;

    const cliente = await prisma.cliente.findUnique({
      where: {
        id: Number(clienteId),
      },
    });

    if (!cliente) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    // Registrar movimiento
    await prisma.movimientoCuenta.create({
      data: {
        clienteId: Number(clienteId),
        tipo: "ABONO",
        concepto: "Pago de cuenta corriente",
        monto: Number(monto),
        formaPago,
      },
    });

    // Descontar del saldo
    await prisma.cliente.update({
      where: {
        id: Number(clienteId),
      },
      data: {
        saldo: {
          decrement: Number(monto),
        },
      },
    });

    res.json({
      mensaje: "Pago registrado correctamente",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al registrar el pago",
    });
  }
}