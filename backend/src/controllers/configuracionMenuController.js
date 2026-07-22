import prisma from "../prisma.js";

export async function crearConfiguracion(req, res) {
  try {
    const { diaSemana, productosFijos, cantidadMaxEspeciales } = req.body;

    const configuracion = await prisma.configuracionMenu.create({
      data: {
        diaSemana: Number(diaSemana),
        productosFijos,
        cantidadMaxEspeciales: Number(cantidadMaxEspeciales),
      },
    });

    res.status(201).json(configuracion);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al crear configuración",
    });
  }
}

export async function obtenerConfiguraciones(req, res) {
  try {
    const configuraciones = await prisma.configuracionMenu.findMany({
      orderBy: {
        diaSemana: "asc",
      },
    });

    res.json(configuraciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener configuraciones",
    });
  }
}

export async function obtenerConfiguracionDia(req, res) {
  try {
    const { diaSemana } = req.params;

    const configuracion = await prisma.configuracionMenu.findFirst({
      where: {
        diaSemana: Number(diaSemana),
        activo: true,
      },
    });

    if (!configuracion) {
      // Retornar configuración por defecto
      return res.json({
        diaSemana: Number(diaSemana),
        productosFijos: true,
        cantidadMaxEspeciales: 2,
        activo: true,
      });
    }

    res.json(configuracion);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener configuración del día",
    });
  }
}

export async function actualizarConfiguracion(req, res) {
  try {
    const { id } = req.params;
    const { productosFijos, cantidadMaxEspeciales, activo } = req.body;

    const configuracion = await prisma.configuracionMenu.update({
      where: {
        id: Number(id),
      },
      data: {
        productosFijos,
        cantidadMaxEspeciales: Number(cantidadMaxEspeciales),
        activo,
      },
    });

    res.json(configuracion);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al actualizar configuración",
    });
  }
}

export async function eliminarConfiguracion(req, res) {
  try {
    const { id } = req.params;

    await prisma.configuracionMenu.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({
      mensaje: "Configuración eliminada",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al eliminar configuración",
    });
  }
}

export async function inicializarConfiguraciones(req, res) {
  try {
    const dias = [1, 2, 3, 4, 5, 6]; // Lunes a Sábado

    for (const dia of dias) {
      const existe = await prisma.configuracionMenu.findFirst({
        where: {
          diaSemana: dia,
        },
      });

      if (!existe) {
        await prisma.configuracionMenu.create({
          data: {
            diaSemana: dia,
            productosFijos: dia !== 6, // Sábado sin productos fijos por defecto
            cantidadMaxEspeciales: dia === 6 ? 1 : 2, // Sábado 1 especial, otros 2
            activo: true,
          },
        });
      }
    }

    const configuraciones = await prisma.configuracionMenu.findMany({
      orderBy: {
        diaSemana: "asc",
      },
    });

    res.json({
      mensaje: "Configuraciones inicializadas",
      configuraciones,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al inicializar configuraciones",
    });
  }
}
