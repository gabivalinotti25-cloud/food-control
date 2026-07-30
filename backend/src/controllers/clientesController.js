import prisma from "../prisma.js";

export async function crearCliente(req, res) {
  try {
    const { nombre, telefono, direccion, observacion } = req.body;

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        telefono,
        direccion,
        observacion,
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
    const clientes = await prisma.cliente.findMany({
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

export async function eliminarCliente(req, res) {
  try {
    const id = Number(req.params.id);

    // Verificar si el cliente tiene pedidos
    const clienteConPedidos = await prisma.cliente.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pedidos: true },
        },
      },
    });

    if (!clienteConPedidos) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    if (clienteConPedidos._count.pedidos > 0) {
      return res.status(400).json({ 
        error: "No se puede eliminar el cliente porque tiene pedidos asociados" 
      });
    }

    await prisma.cliente.delete({
      where: { id },
    });

    res.json({ mensaje: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al eliminar cliente",
    });
  }
}