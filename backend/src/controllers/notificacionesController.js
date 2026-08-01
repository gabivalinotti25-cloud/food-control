import prisma from "../prisma.js";

export async function obtenerNotificaciones(req, res) {
  try {
    const { soloNoLeidas } = req.query;
    
    const where = soloNoLeidas === 'true' ? { leida: false } : {};
    
    const notificaciones = await prisma.notificacion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    const noLeidasCount = await prisma.notificacion.count({
      where: { leida: false }
    });
    
    res.json({
      notificaciones,
      noLeidasCount
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
}

export async function marcarComoLeida(req, res) {
  try {
    const { id } = req.params;
    
    await prisma.notificacion.update({
      where: { id: Number(id) },
      data: { leida: true }
    });
    
    res.json({ mensaje: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error al marcar notificación como leída' });
  }
}

export async function marcarTodasComoLeidas(req, res) {
  try {
    await prisma.notificacion.updateMany({
      where: { leida: false },
      data: { leida: true }
    });
    
    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    res.status(500).json({ error: 'Error al marcar todas como leídas' });
  }
}

export async function crearNotificacion(req, res) {
  try {
    const { tipo, titulo, mensaje, link, datos } = req.body;
    
    const notificacion = await prisma.notificacion.create({
      data: {
        tipo,
        titulo,
        mensaje,
        link,
        datos
      }
    });
    
    res.status(201).json(notificacion);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ error: 'Error al crear notificación' });
  }
}

export async function eliminarNotificacion(req, res) {
  try {
    const { id } = req.params;
    
    await prisma.notificacion.delete({
      where: { id: Number(id) }
    });
    
    res.json({ mensaje: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
}

// Función auxiliar para crear notificaciones desde otros controladores
export async function notificar(tipo, titulo, mensaje, link = null, datos = null) {
  try {
    await prisma.notificacion.create({
      data: {
        tipo,
        titulo,
        mensaje,
        link,
        datos
      }
    });
    console.log(`✅ Notificación creada: ${titulo}`);
  } catch (error) {
    console.error('❌ Error al crear notificación:', error);
  }
}
