import prisma from "../prisma.js";

export async function exportarDatos(req, res) {
  try {
    const [
      clientes,
      productos,
      pedidos,
      movimientos,
      ventasAnonimas,
      cajas,
      configuracionesMenu,
    ] = await Promise.all([
      prisma.cliente.findMany(),
      prisma.producto.findMany(),
      prisma.pedido.findMany({
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
        include: {
          cliente: true,
        },
      }),
      prisma.ventaAnonima.findMany(),
      prisma.cajaDiaria.findMany(),
      prisma.configuracionMenu.findMany(),
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

    const where = {};
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

    const [pedidos, ventasAnonimas] = await Promise.all([
      prisma.pedido.findMany({
        where: {
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
    const [
      totalClientes,
      totalProductos,
      totalPedidos,
      totalVentasAnonimas,
      totalMovimientos,
      totalCajas,
    ] = await Promise.all([
      prisma.cliente.count(),
      prisma.producto.count(),
      prisma.pedido.count(),
      prisma.ventaAnonima.count(),
      prisma.movimientoCuenta.count(),
      prisma.cajaDiaria.count(),
    ]);

    const clientesConDeuda = await prisma.cliente.count({
      where: {
        saldo: {
          gt: 0,
        },
      },
    });

    const sumaDeuda = await prisma.cliente.aggregate({
      where: {
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
