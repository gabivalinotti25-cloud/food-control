import prisma from "../prisma.js";

// Obtener la cuenta corriente de un cliente
export async function obtenerCuenta(req, res) {
  try {
    const clienteId = Number(req.params.clienteId);

    const cliente = await prisma.cliente.findUnique({
      where: {
        id: clienteId,
      },
      include: {
        movimientos: {
          orderBy: {
            fecha: "desc",
          },
        },
      },
    });

    if (!cliente) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    res.json(cliente);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener la cuenta corriente",
    });
  }
}

// Crear movimiento de cuenta manualmente (para agregar deudas viejas)
export async function crearMovimiento(req, res) {
  try {
    const { clienteId, tipo, concepto, monto, formaPago } = req.body;

    const movimiento = await prisma.movimientoCuenta.create({
      data: {
        clienteId: Number(clienteId),
        tipo,
        concepto,
        monto: Number(monto),
        formaPago,
        fecha: new Date(),
      },
    });

    // Actualizar saldo del cliente
    if (tipo === "CARGO") {
      await prisma.cliente.update({
        where: { id: Number(clienteId) },
        data: { saldo: { increment: Number(monto) } },
      });
    } else if (tipo === "ABONO") {
      await prisma.cliente.update({
        where: { id: Number(clienteId) },
        data: { saldo: { decrement: Number(monto) } },
      });
    }

    res.json(movimiento);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al crear movimiento",
    });
  }
}