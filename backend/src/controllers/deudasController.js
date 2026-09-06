import prisma from "../prisma.js";

export async function listarDeudas(req, res) {
  try {
    const negocioId = req.negocioId;

    const deudas = await prisma.pedido.findMany({
      where: {
        negocioId,
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