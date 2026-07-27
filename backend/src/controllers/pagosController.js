import prisma from "../prisma.js";

const PIN_VALIDO = "6126256126";

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

export async function eliminarMovimiento(req, res) {
  try {
    const { movimientoId, pin } = req.body;

    // Validar PIN
    if (pin !== PIN_VALIDO) {
      return res.status(403).json({
        error: "PIN incorrecto",
      });
    }

    // Obtener el movimiento
    const movimiento = await prisma.movimientoCuenta.findUnique({
      where: {
        id: Number(movimientoId),
      },
    });

    if (!movimiento) {
      return res.status(404).json({
        error: "Movimiento no encontrado",
      });
    }

    // Si es un ABONO, sumar el monto al saldo del cliente
    if (movimiento.tipo === "ABONO") {
      await prisma.cliente.update({
        where: {
          id: movimiento.clienteId,
        },
        data: {
          saldo: {
            increment: movimiento.monto,
          },
        },
      });
    } else {
      // Si es un CARGO, restar el monto al saldo del cliente
      await prisma.cliente.update({
        where: {
          id: movimiento.clienteId,
        },
        data: {
          saldo: {
            decrement: movimiento.monto,
          },
        },
      });
    }

    // Eliminar el movimiento
    await prisma.movimientoCuenta.delete({
      where: {
        id: Number(movimientoId),
      },
    });

    res.json({
      mensaje: "Movimiento eliminado correctamente",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al eliminar el movimiento",
    });
  }
}