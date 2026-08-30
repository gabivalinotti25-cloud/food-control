import prisma from "../prisma.js";

export async function registrarAuditoria(req, accion, entidad, entidadId, descripcion, datosAntes = null, datosDespues = null) {
  try {
    const usuarioId = req.user?.id || null;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    await prisma.auditoriaAcciones.create({
      data: {
        usuarioId,
        accion,
        entidad,
        entidadId,
        descripcion,
        datosAntes,
        datosDespues,
        ip,
        userAgent
      }
    });

    console.log(`📝 Auditoría registrada: ${accion} - ${descripcion}`);
  } catch (error) {
    console.error('❌ Error al registrar auditoría:', error.message);
    // No fallar la acción principal si la auditoría falla
  }
}

export async function listarAuditoria(req, res) {
  try {
    const { usuarioId, accion, fechaDesde, fechaHasta } = req.query;
    
    const where = {};
    
    if (usuarioId) {
      where.usuarioId = Number(usuarioId);
    }
    
    if (accion) {
      where.accion = accion;
    }
    
    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) {
        where.createdAt.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.createdAt.lte = new Date(fechaHasta);
      }
    }

    const auditorias = await prisma.auditoriaAcciones.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json(auditorias);
  } catch (error) {
    console.error('❌ Error al listar auditoría:', error);
    res.status(500).json({ error: 'Error al listar auditoría' });
  }
}
