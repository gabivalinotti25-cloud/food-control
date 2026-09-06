import prisma from "../prisma.js";

export async function exportarDatos(req, res) {
  try {
    const negocioId = req.negocioId || 1;

    const [
      clientes,
      productos,
      pedidos,
      movimientos,
      ventasAnonimas,
      cajas,
      configuracionesMenu,
    ] = await Promise.all([
      prisma.cliente.findMany({ where: { negocioId } }),
      prisma.producto.findMany({ where: { negocioId } }),
      prisma.pedido.findMany({
        where: { negocioId },
        include: {
          cliente: true,
          pago: true,
          detalles: {
            include: {
              producto: true,
            },
          },
        },
      }),
      prisma.movimientoCuenta.findMany({
        where: { negocioId },
        include: {
          cliente: true,
        },
      }),
      prisma.ventaAnonima.findMany({ where: { negocioId } }),
      prisma.cajaDiaria.findMany({ where: { negocioId } }),
      prisma.configuracionMenu.findMany({ where: { negocioId } }),
    ]);

    const datos = {
      fechaExportacion: new Date().toISOString(),
      clientes,
      productos,
      pedidos,
      movimientos,
      ventasAnonimas,
      cajas,
      configuracionesMenu,
    };

    res.json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al exportar datos",
    });
  }
}

export async function exportarClientes(req, res) {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { negocioId: req.negocioId || 1 },
      include: {
        pedidos: true,
        movimientos: true,
      },
    });

    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al exportar clientes",
    });
  }
}

export async function exportarPedidos(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const where = { negocioId: req.negocioId || 1 };
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) {
        where.fecha.gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        where.fecha.lte = new Date(fechaFin);
      }
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        cliente: true,
        pago: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al exportar pedidos",
    });
  }
}

export async function exportarReporteExcel(req, res) {
  try {
    const { fecha } = req.query;
    const fechaBusqueda = fecha ? new Date(fecha) : new Date();
    fechaBusqueda.setHours(0, 0, 0, 0);

    const manana = new Date(fechaBusqueda);
    manana.setDate(manana.getDate() + 1);

    const negocioId = req.negocioId || 1;

    const [pedidos, ventasAnonimas] = await Promise.all([
      prisma.pedido.findMany({
        where: {
          negocioId,
          fecha: {
            gte: fechaBusqueda,
            lt: manana,
          },
        },
        include: {
          cliente: true,
          pago: true,
          detalles: {
            include: {
              producto: true,
            },
          },
        },
      }),
      prisma.ventaAnonima.findMany({
        where: {
          negocioId,
          fecha: {
            gte: fechaBusqueda,
            lt: manana,
          },
        },
      }),
    ]);

    const reporte = {
      fecha: fechaBusqueda,
      resumen: {
        totalPedidos: pedidos.length,
        totalVentasAnonimas: ventasAnonimas.length,
        totalIngresos:
          pedidos.reduce((sum, p) => sum + p.total, 0) +
          ventasAnonimas.reduce((sum, v) => sum + v.monto, 0),
        totalEfectivo:
          pedidos.filter((p) => p.pago?.formaPago === "EFECTIVO").reduce(
            (sum, p) => sum + p.total,
            0
          ) +
          ventasAnonimas
            .filter((v) => v.formaPago === "EFECTIVO")
            .reduce((sum, v) => sum + v.monto, 0),
        totalTransferencia:
          pedidos.filter((p) => p.pago?.formaPago === "TRANSFERENCIA").reduce(
            (sum, p) => sum + p.total,
            0
          ) +
          ventasAnonimas
            .filter((v) => v.formaPago === "TRANSFERENCIA")
            .reduce((sum, v) => sum + v.monto, 0),
        totalPendiente: pedidos
          .filter((p) => p.estadoPago === "PENDIENTE")
          .reduce((sum, p) => sum + p.total, 0),
      },
      pedidos: pedidos.map((p) => ({
        id: p.id,
        fecha: p.fecha,
        cliente: p.cliente?.nombre || "N/A",
        total: p.total,
        formaPago: p.pago?.formaPago || "PENDIENTE",
        estadoPago: p.estadoPago,
        detalles: p.detalles.map((d) => ({
          producto: d.producto?.nombre || "N/A",
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal,
        })),
      })),
      ventasAnonimas: ventasAnonimas.map((v) => ({
        id: v.id,
        fecha: v.fecha,
        monto: v.monto,
        descripcion: v.descripcion,
        formaPago: v.formaPago,
      })),
    };

    res.json(reporte);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al generar reporte",
    });
  }
}

export async function obtenerEstadisticasSistema(req, res) {
  try {
    const negocioId = req.negocioId || 1;

    const [
      totalClientes,
      totalProductos,
      totalPedidos,
      totalVentasAnonimas,
      totalMovimientos,
      totalCajas,
    ] = await Promise.all([
      prisma.cliente.count({ where: { negocioId } }),
      prisma.producto.count({ where: { negocioId } }),
      prisma.pedido.count({ where: { negocioId } }),
      prisma.ventaAnonima.count({ where: { negocioId } }),
      prisma.movimientoCuenta.count({ where: { negocioId } }),
      prisma.cajaDiaria.count({ where: { negocioId } }),
    ]);

    const clientesConDeuda = await prisma.cliente.count({
      where: {
        negocioId,
        saldo: {
          gt: 0,
        },
      },
    });

    const sumaDeuda = await prisma.cliente.aggregate({
      where: {
        negocioId,
        saldo: {
          gt: 0,
        },
      },
      _sum: {
        saldo: true,
      },
    });

    res.json({
      totalClientes,
      totalProductos,
      totalPedidos,
      totalVentasAnonimas,
      totalMovimientos,
      totalCajas,
      clientesConDeuda,
      totalDeuda: sumaDeuda._sum.saldo || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener estadísticas del sistema",
    });
  }
}
