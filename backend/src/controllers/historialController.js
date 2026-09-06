import prisma from "../prisma.js";

export async function obtenerHistorial(req, res) {
  try {
    const { origen, buscar, pagina = 1, limite = 50 } = req.query;
    
    const skip = (Number(pagina) - 1) * Number(limite);
    
    const where = { negocioId: req.negocioId || 1 };
    
    if (origen) {
      where.origen = origen;
    }
    
    if (buscar) {
      where.OR = [
        { mensajeUsuario: { contains: buscar, mode: 'insensitive' } },
        { respuestaIA: { contains: buscar, mode: 'insensitive' } },
        { accionPropuesta: { contains: buscar, mode: 'insensitive' } }
      ];
    }
    
    const [conversaciones, total] = await Promise.all([
      prisma.historialConversacion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limite)
      }),
      prisma.historialConversacion.count({ where })
    ]);
    
    res.json({
      conversaciones,
      total,
      pagina: Number(pagina),
      totalPaginas: Math.ceil(total / Number(limite))
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
}

export async function obtenerEstadisticas(req, res) {
  try {
    const negocioId = req.negocioId || 1;

    const [total, aprobados, rechazados, pendientes, porOrigen] = await Promise.all([
      prisma.historialConversacion.count({ where: { negocioId } }),
      prisma.historialConversacion.count({ where: { aprobado: true, negocioId } }),
      prisma.historialConversacion.count({ where: { aprobado: false, negocioId } }),
      prisma.historialConversacion.count({ where: { aprobado: null, negocioId } }),
      prisma.historialConversacion.groupBy({
        by: ['origen'],
        where: { negocioId },
        _count: true
      })
    ]);
    
    // Calcular patrones de acciones más comunes
    const acciones = await prisma.historialConversacion.groupBy({
      by: ['accionPropuesta'],
      where: { aprobado: true, negocioId },
      _count: true,
      orderBy: { _count: { accionPropuesta: 'desc' } },
      take: 10
    });
    
    res.json({
      total,
      aprobados,
      rechazados,
      pendientes,
      porOrigen,
      accionesComunes: acciones
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

export async function obtenerPatrones(req, res) {
  try {
    // Obtener conversaciones aprobadas para aprendizaje
    const conversaciones = await prisma.historialConversacion.findMany({
      where: { aprobado: true, negocioId: req.negocioId || 1 },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    // Agrupar por tipo de acción
    const patrones = {};
    
    conversaciones.forEach(conv => {
      if (!patrones[conv.accionPropuesta]) {
        patrones[conv.accionPropuesta] = [];
      }
      patrones[conv.accionPropuesta].push({
        mensaje: conv.mensajeUsuario,
        datos: conv.datosPropuesta,
        confianza: conv.confianza
      });
    });
    
    res.json({
      totalPatrones: Object.keys(patrones).length,
      patrones
    });
  } catch (error) {
    console.error('Error al obtener patrones:', error);
    res.status(500).json({ error: 'Error al obtener patrones' });
  }
}

export async function eliminarHistorial(req, res) {
  try {
    const { id } = req.params;
    
    await prisma.historialConversacion.delete({
      where: { id: Number(id) }
    });
    
    res.json({ mensaje: 'Registro eliminado del historial' });
  } catch (error) {
    console.error('Error al eliminar del historial:', error);
    res.status(500).json({ error: 'Error al eliminar del historial' });
  }
}

export async function limpiarHistorialAntiguo(req, res) {
  try {
    const { dias = 30 } = req.query;
    
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - Number(dias));
    
    const resultado = await prisma.historialConversacion.deleteMany({
      where: {
        negocioId: req.negocioId || 1,
        createdAt: {
          lt: fechaLimite
        }
      }
    });
    
    res.json({ 
      mensaje: `Historial antiguo eliminado`,
      registrosEliminados: resultado.count 
    });
  } catch (error) {
    console.error('Error al limpiar historial antiguo:', error);
    res.status(500).json({ error: 'Error al limpiar historial antiguo' });
  }
}
