import prisma from "../prisma.js";

export async function registrarDeudaAntigua(req, res) {
  try {
    const negocioId = req.negocioId;
    const { clienteId, monto, concepto, fecha } = req.body;

    await prisma.movimientoCuenta.create({
      data: {
        clienteId: Number(clienteId),
        negocioId,
        tipo: "CARGO",
        concepto,
        monto: Number(monto),
        fecha: new Date(fecha),
      },
    });

    await prisma.cliente.update({
      where: {
        id: Number(clienteId),
        negocioId,
      },
      data: {
        saldo: {
          increment: Number(monto),
        },
      },
    });

    res.json({
      mensaje: "Deuda registrada correctamente",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al registrar la deuda",
    });
  }
}