import prisma from "../prisma.js";

export async function healthCheck(req, res) {
  try {
    const checks = {
      database: false,
      databaseLatency: null,
      openai: !!process.env.OPENAI_API_KEY,
      timestamp: new Date().toISOString()
    };

    // Verificar conexión a base de datos
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
      checks.databaseLatency = Date.now() - dbStart;
    } catch (error) {
      checks.database = false;
      checks.databaseLatency = null;
    }

    const status = checks.database ? 'healthy' : 'unhealthy';
    const statusCode = checks.database ? 200 : 503;

    res.status(statusCode).json({
      status,
      checks,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
}

export async function obtenerEstadisticasSistema(req, res) {
  try {
    const [
      totalUsuarios,
      totalClientes,
      totalPedidos,
      totalProductos,
      clientesConDeuda,
      pedidosPendientes,
      auditoriasRecientes
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.cliente.count(),
      prisma.pedido.count(),
      prisma.producto.count(),
      prisma.cliente.count({ where: { saldo: { gt: 0 } } }),
      prisma.pedido.count({ where: { estado: 'PENDIENTE' } }),
      prisma.auditoriaAcciones.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      })
    ]);

    // Calcular deuda total
    const clientesConDeudaData = await prisma.cliente.findMany({
      where: { saldo: { gt: 0 } },
      select: { saldo: true }
    });
    const deudaTotal = clientesConDeudaData.reduce((sum, c) => sum + c.saldo, 0);

    res.json({
      usuarios: totalUsuarios,
      clientes: totalClientes,
      pedidos: totalPedidos,
      productos: totalProductos,
      clientesConDeuda,
      deudaTotal,
      pedidosPendientes,
      auditoriasUltimas24h: auditoriasRecientes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del sistema:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

export async function obtenerAlertas(req, res) {
  try {
    const alertas = [];

    // Alerta: Clientes con deuda alta (> $50,000)
    const clientesDeudaAlta = await prisma.cliente.findMany({
      where: { saldo: { gt: 50000 } },
      select: { id: true, nombre: true, telefono: true, saldo: true }
    });

    if (clientesDeudaAlta.length > 0) {
      alertas.push({
        tipo: 'DEUDA_ALTA',
        severidad: 'ALTA',
        mensaje: `${clientesDeudaAlta.length} clientes con deuda alta`,
        datos: clientesDeudaAlta
      });
    }

    // Alerta: Pedidos pendientes por más de 1 hora
    const pedidosPendientesAntiguos = await prisma.pedido.findMany({
      where: {
        estado: 'PENDIENTE',
        fecha: { lt: new Date(Date.now() - 60 * 60 * 1000) }
      },
      include: { cliente: true }
    });

    if (pedidosPendientesAntiguos.length > 0) {
      alertas.push({
        tipo: 'PEDIDOS_PENDIENTES',
        severidad: 'MEDIA',
        mensaje: `${pedidosPendientesAntiguos.length} pedidos pendientes por más de 1 hora`,
        datos: pedidosPendientesAntiguos
      });
    }

    // Alerta: Uso excesivo de Sebastian (más de 15 mensajes en última hora)
    const usoSebastianUltimaHora = await prisma.historialConversacion.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
      }
    });

    if (usoSebastianUltimaHora > 15) {
      alertas.push({
        tipo: 'USO_SEBASTIAN_ALTO',
        severidad: 'MEDIA',
        mensaje: `${usoSebastianUltimaHora} mensajes de Sebastian en la última hora`,
        datos: { mensajes: usoSebastianUltimaHora }
      });
    }

    // Alerta: Base de datos lenta (si la latencia > 500ms)
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    if (dbLatency > 500) {
      alertas.push({
        tipo: 'BASE_DE_DATOS_LENTA',
        severidad: 'ALTA',
        mensaje: `Latencia de base de datos alta: ${dbLatency}ms`,
        datos: { latency: dbLatency }
      });
    }

    res.json({
      total: alertas.length,
      alertas,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
}
