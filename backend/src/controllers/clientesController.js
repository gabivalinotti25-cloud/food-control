import prisma from "../prisma.js";

export async function crearCliente(req, res) {
  try {
    const { nombre, telefono, direccion, observacion } = req.body;
    const negocioId = req.negocioId;

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        telefono,
        direccion,
        observacion,
        negocioId,
      },
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al crear el cliente",
    });
  }
}

export async function listarClientes(req, res) {
  try {
    const negocioId = req.negocioId;

    const clientes = await prisma.cliente.findMany({
      where: { negocioId },
      orderBy: {
        nombre: "asc",
      },
    });

    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al listar clientes",
    });
  }
}