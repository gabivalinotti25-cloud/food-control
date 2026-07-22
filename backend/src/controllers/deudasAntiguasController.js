import prisma from "../prisma.js";

export async function registrarDeudaAntigua(req, res) {
  try {
    const { clienteId, monto, concepto, fecha } = req.body;

    await prisma.movimientoCuenta.create({
      data: {
        clienteId: Number(clienteId),
        tipo: "CARGO",
        concepto,
        monto: Number(monto),
        fecha: new Date(fecha),
      },
    });

    await prisma.cliente.update({
      where: {
        id: Number(clienteId),
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