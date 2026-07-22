import prisma from "../prisma.js";

export async function crearVentaAnonima(req, res) {
  try {
    const { monto, descripcion, formaPago } = req.body;

    const venta = await prisma.ventaAnonima.create({
      data: {
        monto: Number(monto),
        descripcion,
        formaPago,
      },
    });

    res.status(201).json(venta);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al crear venta anónima",
    });
  }
}

export async function listarVentasAnonimas(req, res) {
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

    const ventas = await prisma.ventaAnonima.findMany({
      where,
      orderBy: {
        fecha: "desc",
      },
    });

    res.json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al listar ventas anónimas",
    });
  }
}

export async function eliminarVentaAnonima(req, res) {
  try {
    const id = Number(req.params.id);

    await prisma.ventaAnonima.delete({
      where: { id },
    });

    res.json({
      mensaje: "Venta anónima eliminada",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al eliminar venta anónima",
    });
  }
}

export async function obtenerVentasAnonimasHoy(req, res) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const ventas = await prisma.ventaAnonima.findMany({
      where: {
        fecha: {
          gte: hoy,
          lt: manana,
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    const totalEfectivo = ventas
      .filter((v) => v.formaPago === "EFECTIVO")
      .reduce((sum, v) => sum + v.monto, 0);

    const totalTransferencia = ventas
      .filter((v) => v.formaPago === "TRANSFERENCIA")
      .reduce((sum, v) => sum + v.monto, 0);

    res.json({
      ventas,
      totalEfectivo,
      totalTransferencia,
      total: totalEfectivo + totalTransferencia,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener ventas de hoy",
    });
  }
}
