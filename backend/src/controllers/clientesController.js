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
        negocioId: req.negocioId || 1,
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
      where: { negocioId: req.negocioId || 1 },
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

export async function editarCliente(req, res) {
  try {
    const id = Number(req.params.id);
    const { nombre, telefono, direccion, observacion } = req.body;

    const cliente = await prisma.cliente.update({
      where: { id, negocioId: req.negocioId || 1 },
      data: {
        nombre,
        telefono,
        direccion,
        observacion,
      },
    });

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al editar cliente",
    });
  }
}

export async function eliminarCliente(req, res) {
  try {
    const id = Number(req.params.id);

    // Verificar si el cliente existe
    const cliente = await prisma.cliente.findFirst({
      where: { id, negocioId: req.negocioId || 1 },
      include: {
        pedidos: {
          include: {
            pago: true,
            detalles: true,
          },
        },
        movimientos: true,
      },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Eliminar movimientos de cuenta
    await prisma.movimientoCuenta.deleteMany({
      where: { clienteId: id },
    });

    // Eliminar pagos de los pedidos
    await prisma.pago.deleteMany({
      where: {
        pedido: {
          clienteId: id,
        },
      },
    });

    // Eliminar detalles de pedidos
    await prisma.pedidoDetalle.deleteMany({
      where: {
        pedido: {
          clienteId: id,
        },
      },
    });

    // Eliminar pedidos
    await prisma.pedido.deleteMany({
      where: { clienteId: id },
    });

    // Eliminar cliente
    await prisma.cliente.delete({
      where: { id },
    });

    res.json({ mensaje: "Cliente y todos sus registros asociados eliminados correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al eliminar cliente",
    });
  }
}