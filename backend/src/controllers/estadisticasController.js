import prisma from "../prisma.js";

export async function obtenerEstadisticasGenerales(req, res) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const [
      totalClientes,
      totalProductos,
      totalPedidos,
      clientesActivos,
      productosActivos,
    ] = await Promise.all([
      prisma.cliente.count(),
      prisma.producto.count(),
      prisma.pedido.count(),
      prisma.cliente.count({
        where: {
          pedidos: {
            some: {
              fecha: {
                gte: inicioMes,
              },
            },
          },
        },
      }),
      prisma.producto.count({
        where: {
          activo: true,
        },
      }),
    ]);

    res.json({
      totalClientes,
      totalProductos,
      totalPedidos,
      clientesActivos,
      productosActivos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener estadísticas generales",
    });
  }
}

export async function obtenerVentasPorPeriodo(req, res) {
  try {
    const { periodo } = req.query; // hoy, semana, mes, año

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let fechaInicio;
    let fechaFin = new Date();
    fechaFin.setHours(23, 59, 59, 999);

    switch (periodo) {
      case "hoy":
        fechaInicio = new Date(hoy);
        break;
      case "semana":
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      case "mes":
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case "anio":
        fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        break;
      default:
        fechaInicio = new Date(hoy);
    }

    const pedidos = await prisma.pedido.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: {
        pago: true,
      },
    });

    const ventasEfectivo = pedidos.filter(
      (p) => p.pago?.formaPago === "EFECTIVO"
    );
    const ventasTransferencia = pedidos.filter(
      (p) => p.pago?.formaPago === "TRANSFERENCIA"
    );
    const ventasPendientes = pedidos.filter((p) => p.estadoPago === "PENDIENTE");

    const ventasAnonimas = await prisma.ventaAnonima.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
    });

    const ventasAnonimasEfectivo = ventasAnonimas.filter(
      (v) => v.formaPago === "EFECTIVO"
    );
    const ventasAnonimasTransferencia = ventasAnonimas.filter(
      (v) => v.formaPago === "TRANSFERENCIA"
    );

    res.json({
      periodo,
      fechaInicio,
      fechaFin,
      pedidos: {
        total: pedidos.length,
        totalMonto: pedidos.reduce((sum, p) => sum + p.total, 0),
        efectivo: ventasEfectivo.reduce((sum, p) => sum + p.total, 0),
        transferencia: ventasTransferencia.reduce((sum, p) => sum + p.total, 0),
        pendiente: ventasPendientes.reduce((sum, p) => sum + p.total, 0),
      },
      ventasAnonimas: {
        total: ventasAnonimas.length,
        efectivo: ventasAnonimasEfectivo.reduce((sum, v) => sum + v.monto, 0),
        transferencia: ventasAnonimasTransferencia.reduce(
          (sum, v) => sum + v.monto,
          0
        ),
      },
      totales: {
        ventasTotales:
          pedidos.reduce((sum, p) => sum + p.total, 0) +
          ventasAnonimas.reduce((sum, v) => sum + v.monto, 0),
        efectivoTotal:
          ventasEfectivo.reduce((sum, p) => sum + p.total, 0) +
          ventasAnonimasEfectivo.reduce((sum, v) => sum + v.monto, 0),
        transferenciaTotal:
          ventasTransferencia.reduce((sum, p) => sum + p.total, 0) +
          ventasAnonimasTransferencia.reduce((sum, v) => sum + v.monto, 0),
        pendienteCobrar: ventasPendientes.reduce((sum, p) => sum + p.total, 0),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener ventas por periodo",
    });
  }
}

export async function obtenerProductosMasVendidos(req, res) {
  try {
    const { periodo } = req.query;
    const limite = Number(req.query.limite) || 10;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let fechaInicio;
    switch (periodo) {
      case "semana":
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      case "mes":
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      default:
        fechaInicio = new Date(hoy);
    }

    const detalles = await prisma.pedidoDetalle.findMany({
      where: {
        pedido: {
          fecha: {
            gte: fechaInicio,
          },
        },
      },
      include: {
        producto: true,
      },
    });

    const ventasPorProducto = {};

    detalles.forEach((detalle) => {
      if (!ventasPorProducto[detalle.productoId]) {
        ventasPorProducto[detalle.productoId] = {
          producto: detalle.producto,
          cantidadTotal: 0,
          montoTotal: 0,
        };
      }
      ventasPorProducto[detalle.productoId].cantidadTotal +=
        detalle.cantidad;
      ventasPorProducto[detalle.productoId].montoTotal += detalle.subtotal;
    });

    const ordenado = Object.values(ventasPorProducto).sort(
      (a, b) => b.cantidadTotal - a.cantidadTotal
    );

    res.json(ordenado.slice(0, limite));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener productos más vendidos",
    });
  }
}

export async function obtenerClientesFrecuentes(req, res) {
  try {
    const { periodo } = req.query;
    const limite = Number(req.query.limite) || 10;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let fechaInicio;
    switch (periodo) {
      case "semana":
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      case "mes":
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      default:
        fechaInicio = new Date(hoy);
    }

    const pedidos = await prisma.pedido.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
        },
      },
      include: {
        cliente: true,
      },
    });

    const pedidosPorCliente = {};

    pedidos.forEach((pedido) => {
      if (!pedidosPorCliente[pedido.clienteId]) {
        pedidosPorCliente[pedido.clienteId] = {
          cliente: pedido.cliente,
          cantidadPedidos: 0,
          montoTotal: 0,
        };
      }
      pedidosPorCliente[pedido.clienteId].cantidadPedidos += 1;
      pedidosPorCliente[pedido.clienteId].montoTotal += pedido.total;
    });

    const ordenado = Object.values(pedidosPorCliente).sort(
      (a, b) => b.cantidadPedidos - a.cantidadPedidos
    );

    res.json(ordenado.slice(0, limite));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener clientes frecuentes",
    });
  }
}

export async function obtenerReporteDiario(req, res) {
  try {
    const { fecha } = req.query;
    const fechaBusqueda = fecha ? new Date(fecha) : new Date();
    fechaBusqueda.setHours(0, 0, 0, 0);

    const manana = new Date(fechaBusqueda);
    manana.setDate(manana.getDate() + 1);

    const [pedidos, ventasAnonimas, clientesConDeuda] = await Promise.all([
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
      prisma.cliente.findMany({
        where: {
          saldo: {
            gt: 0,
          },
        },
      }),
    ]);

    const productosVendidos = {};
    pedidos.forEach((pedido) => {
      pedido.detalles.forEach((detalle) => {
        if (!productosVendidos[detalle.productoId]) {
          productosVendidos[detalle.productoId] = {
            producto: detalle.producto,
            cantidad: 0,
            monto: 0,
          };
        }
        productosVendidos[detalle.productoId].cantidad += detalle.cantidad;
        productosVendidos[detalle.productoId].monto += detalle.subtotal;
      });
    });

    res.json({
      fecha: fechaBusqueda,
      resumen: {
        totalPedidos: pedidos.length,
        totalVentasAnonimas: ventasAnonimas.length,
        totalIngresos:
          pedidos.reduce((sum, p) => sum + p.total, 0) +
          ventasAnonimas.reduce((sum, v) => sum + v.monto, 0),
        totalPendiente: pedidos
          .filter((p) => p.estadoPago === "PENDIENTE")
          .reduce((sum, p) => sum + p.total, 0),
      },
      pedidos,
      ventasAnonimas,
      productosVendidos: Object.values(productosVendidos),
      clientesConDeuda,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener reporte diario",
    });
  }
}

export async function obtenerTendenciasVentas(req, res) {
  try {
    const { dias } = req.query;
    const cantidadDias = Number(dias) || 30;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const datos = [];

    for (let i = cantidadDias - 1; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);

      const manana = new Date(fecha);
      manana.setDate(manana.getDate() + 1);

      const [pedidos, ventasAnonimas] = await Promise.all([
        prisma.pedido.findMany({
          where: {
            fecha: {
              gte: fecha,
              lt: manana,
            },
          },
        }),
        prisma.ventaAnonima.findMany({
          where: {
            fecha: {
              gte: fecha,
              lt: manana,
            },
          },
        }),
      ]);

      const totalVentas =
        pedidos.reduce((sum, p) => sum + p.total, 0) +
        ventasAnonimas.reduce((sum, v) => sum + v.monto, 0);

      datos.push({
        fecha: fecha.toISOString().split("T")[0],
        ventas: totalVentas,
        pedidos: pedidos.length,
        ventasAnonimas: ventasAnonimas.length,
      });
    }

    res.json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener tendencias de ventas",
    });
  }
}
