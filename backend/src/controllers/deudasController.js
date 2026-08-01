import prisma from "../prisma.js";

export async function listarDeudas(req, res) {
  try {
    const deudas = await prisma.pedido.findMany({
      where: {
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

export async function listarDeudasPorCliente(req, res) {
  try {
    const { clienteId } = req.params;

    const deudas = await prisma.pedido.findMany({
      where: {
        clienteId: Number(clienteId),
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
      error: "Error al obtener las deudas del cliente",
    });
  }
}

export async function marcarPedidoPagado(req, res) {
  try {
    const { pedidoId, formaPago } = req.body;

    const pedidoExistente = await prisma.pedido.findUnique({
      where: { id: Number(pedidoId) },
    });

    if (!pedidoExistente || pedidoExistente.estadoPago === "PAGADO") {
      return res.status(400).json({ error: "Pedido no válido o ya pagado" });
    }

    const pedido = await prisma.pedido.update({
      where: { id: Number(pedidoId) },
      data: {
        estadoPago: "PAGADO",
        pago: {
          create: {
            monto: pedidoExistente.total,
            forma: formaPago,
          },
        },
      },
      include: { cliente: true, pago: true },
    });

    // Actualizar saldo del cliente
    await prisma.cliente.update({
      where: {
        id: pedido.clienteId,
      },
      data: {
        saldo: {
          decrement: pedido.total,
        },
      },
    });

    // Registrar movimiento
    await prisma.movimientoCuenta.create({
      data: {
        clienteId: pedido.clienteId,
        tipo: "ABONO",
        concepto: `Pago pedido #${pedidoId}`,
        monto: pedido.total,
        formaPago,
      },
    });

    res.json(pedido);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al marcar pedido como pagado",
    });
  }
}

export async function obtenerResumenDeudas(req, res) {
  try {
    const clientes = await prisma.cliente.findMany({
      where: {
        saldo: {
          gt: 0,
        },
      },
      orderBy: {
        saldo: "desc",
      },
    });

    const totalDeuda = clientes.reduce((sum, c) => sum + c.saldo, 0);

    res.json({
      clientesConDeuda: clientes.length,
      totalDeuda,
      clientes,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener resumen de deudas",
    });
  }
}

export async function generarInformeCliente(req, res) {
  try {
    const { clienteId } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(clienteId) },
      include: {
        pedidos: {
          where: { estadoPago: "PENDIENTE" },
          include: {
            detalles: {
              include: {
                producto: true,
              },
            },
          },
          orderBy: { fecha: "desc" },
        },
      },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Generar informe en formato texto
    let informe = `📋 INFORME DE DEUDA - ${cliente.nombre.toUpperCase()}\n`;
    informe += `📱 Teléfono: ${cliente.telefono}\n`;
    informe += `💰 Total adeudado: Gs. ${cliente.saldo.toLocaleString()}\n`;
    informe += `📅 Fecha: ${new Date().toLocaleDateString()}\n\n`;
    informe += `═══════════════════════════════════════════\n\n`;
    informe += `📦 PEDIDOS PENDIENTES:\n\n`;

    if (cliente.pedidos.length === 0) {
      informe += `✅ No hay pedidos pendientes de pago\n`;
    } else {
      cliente.pedidos.forEach((pedido, index) => {
        informe += `${index + 1}. Pedido #${pedido.id}\n`;
        informe += `   📅 Fecha: ${new Date(pedido.fecha).toLocaleDateString()}\n`;
        informe += `   💵 Total: Gs. ${pedido.total.toLocaleString()}\n`;
        informe += `   📝 Detalles:\n`;
        
        pedido.detalles.forEach((detalle) => {
          const nombreProducto = detalle.producto?.nombre || detalle.descripcion || "Sin nombre";
          informe += `      • ${nombreProducto} x${detalle.cantidad} = Gs. ${detalle.precioUnitario.toLocaleString()}\n`;
        });
        
        informe += `\n`;
      });
    }

    informe += `═══════════════════════════════════════════\n`;
    informe += `💳 FORMAS DE PAGO ACEPTADAS:\n`;
    informe += `   • Efectivo\n`;
    informe += `   • Transferencia bancaria\n\n`;
    informe += `🙏 Por favor, regularizar su deuda a la brevedad posible.\n`;
    informe += `📞 Para consultas, contactar al negocio.\n`;

    res.json({
      cliente: cliente.nombre,
      telefono: cliente.telefono,
      totalDeuda: cliente.saldo,
      informe,
      cantidadPedidos: cliente.pedidos.length,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar informe del cliente" });
  }
}