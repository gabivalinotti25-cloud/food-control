import prisma from "../prisma.js";

// Obtener la cuenta corriente de un cliente
export async function obtenerCuenta(req, res) {
  try {
    const negocioId = req.negocioId;
    const clienteId = Number(req.params.clienteId);

    const cliente = await prisma.cliente.findUnique({
      where: {
        id: clienteId,
        negocioId,
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