import prisma from "../prisma.js";

export async function crearOCrearCajaDiaria(req, res) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let caja = await prisma.cajaDiaria.findUnique({
      where: {
        fecha: hoy,
      },
    });

    if (!caja) {
      caja = await prisma.cajaDiaria.create({
        data: {
          fecha: hoy,
        },
      });
    }

    res.json(caja);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al crear/obtener caja diaria",
    });
  }
}

export async function obtenerCajaHoy(req, res) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const caja = await prisma.cajaDiaria.findUnique({
      where: {
        fecha: hoy,
      },
    });

    if (!caja) {
      return res.json({
        mensaje: "No existe caja para hoy",
        caja: null,
      });
    }

    // Calcular montos esperados del día
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [pedidosPagados, ventasAnonimas] = await Promise.all([
      prisma.pedido.findMany({
        where: {
          fecha: {
            gte: hoy,
            lt: manana,
          },
          estadoPago: "PAGADO",
          pago: {
            formaPago: "EFECTIVO",
          },
        },
        include: {
          pago: true,
        },
      }),
      prisma.ventaAnonima.findMany({
        where: {
          fecha: {
            gte: hoy,
            lt: manana,
          },
          formaPago: "EFECTIVO",
        },
      }),
    ]);

    const efectivoEsperado =
      pedidosPagados.reduce((sum, p) => sum + p.total, 0) +
      ventasAnonimas.reduce((sum, v) => sum + v.monto, 0);

    const [pedidosTransferencia, ventasAnonimasTransferencia] =
      await Promise.all([
        prisma.pedido.findMany({
          where: {
            fecha: {
              gte: hoy,
              lt: manana,
            },
            estadoPago: "PAGADO",
            pago: {
              formaPago: "TRANSFERENCIA",
            },
          },
          include: {
            pago: true,
          },
        }),
        prisma.ventaAnonima.findMany({
          where: {
            fecha: {
              gte: hoy,
              lt: manana,
            },
            formaPago: "TRANSFERENCIA",
          },
        }),
      ]);

    const transferenciaEsperada =
      pedidosTransferencia.reduce((sum, p) => sum + p.total, 0) +
      ventasAnonimasTransferencia.reduce((sum, v) => sum + v.monto, 0);

    // Actualizar montos esperados
    caja = await prisma.cajaDiaria.update({
      where: {
        id: caja.id,
      },
      data: {
        montoEfectivoEsperado: efectivoEsperado,
        montoTransferenciaEsperado: transferenciaEsperada,
      },
    });

    res.json(caja);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener caja de hoy",
    });
  }
}

export async function actualizarMontosReales(req, res) {
  try {
    const { id } = req.params;
    const { montoEfectivoReal, montoTransferenciaReal, observacion } =
      req.body;

    const caja = await prisma.cajaDiaria.update({
      where: {
        id: Number(id),
      },
      data: {
        montoEfectivoReal: Number(montoEfectivoReal),
        montoTransferenciaReal: Number(montoTransferenciaReal),
        observacion,
      },
    });

    res.json(caja);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al actualizar montos reales",
    });
  }
}

export async function cerrarCaja(req, res) {
  try {
    const { id } = req.params;

    const caja = await prisma.cajaDiaria.update({
      where: {
        id: Number(id),
      },
      data: {
        cerrada: true,
        fechaCierre: new Date(),
      },
    });

    res.json(caja);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al cerrar caja",
    });
  }
}

export async function listarCajas(req, res) {
  try {
    const cajas = await prisma.cajaDiaria.findMany({
      orderBy: {
        fecha: "desc",
      },
      take: 30,
    });

    res.json(cajas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al listar cajas",
    });
  }
}

export async function obtenerResumenCaja(req, res) {
  try {
    const { fecha } = req.query;
    const fechaBusqueda = fecha ? new Date(fecha) : new Date();
    fechaBusqueda.setHours(0, 0, 0, 0);

    const manana = new Date(fechaBusqueda);
    manana.setDate(manana.getDate() + 1);

    const [pedidos, ventasAnonimas, caja] = await Promise.all([
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
      prisma.cajaDiaria.findUnique({
        where: {
          fecha: fechaBusqueda,
        },
      }),
    ]);

    const pedidosEfectivo = pedidos.filter(
      (p) => p.pago?.formaPago === "EFECTIVO"
    );
    const pedidosTransferencia = pedidos.filter(
      (p) => p.pago?.formaPago === "TRANSFERENCIA"
    );
    const pedidosPendientes = pedidos.filter(
      (p) => p.estadoPago === "PENDIENTE"
    );

    const ventasEfectivo = ventasAnonimas.filter(
      (v) => v.formaPago === "EFECTIVO"
    );
    const ventasTransferencia = ventasAnonimas.filter(
      (v) => v.formaPago === "TRANSFERENCIA"
    );

    const resumen = {
      fecha: fechaBusqueda,
      pedidos: {
        total: pedidos.length,
        efectivo: pedidosEfectivo.reduce((sum, p) => sum + p.total, 0),
        transferencia: pedidosTransferencia.reduce(
          (sum, p) => sum + p.total,
          0
        ),
        pendiente: pedidosPendientes.reduce((sum, p) => sum + p.total, 0),
      },
      ventasAnonimas: {
        efectivo: ventasEfectivo.reduce((sum, v) => sum + v.monto, 0),
        transferencia: ventasTransferencia.reduce(
          (sum, v) => sum + v.monto,
          0
        ),
      },
      caja,
      totales: {
        efectivoEsperado:
          pedidosEfectivo.reduce((sum, p) => sum + p.total, 0) +
          ventasEfectivo.reduce((sum, v) => sum + v.monto, 0),
        transferenciaEsperada:
          pedidosTransferencia.reduce((sum, p) => sum + p.total, 0) +
          ventasTransferencia.reduce((sum, v) => sum + v.monto, 0),
        pendienteCobrar: pedidosPendientes.reduce(
          (sum, p) => sum + p.total,
          0
        ),
      },
    };

    res.json(resumen);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener resumen de caja",
    });
  }
}
