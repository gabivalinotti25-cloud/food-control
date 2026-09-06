import prisma from "../prisma.js";

export async function registrarPago(req, res) {
  try {
    const negocioId = req.negocioId;
    const { clienteId, monto, formaPago } = req.body;

    const cliente = await prisma.cliente.findUnique({
      where: {
        id: Number(clienteId),
        negocioId,
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
        negocioId,
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
        negocioId,
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