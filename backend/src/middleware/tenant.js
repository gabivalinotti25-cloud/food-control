import prisma from "../prisma.js";

export async function tenantMiddleware(req, res, next) {
  try {
    // Si el usuario está autenticado, obtener su negocioId
    if (req.usuario && req.usuario.negocioId) {
      const negocioId = req.usuario.negocioId;
      
      // Verificar que el negocio existe y está activo
      const negocio = await prisma.negocio.findUnique({
        where: { id: negocioId },
        select: { id: true, estado: true, plan: true }
      });

      if (!negocio) {
        return res.status(404).json({ error: "Negocio no encontrado" });
      }

      if (negocio.estado !== "ACTIVO") {
        return res.status(403).json({ 
          error: "Negocio suspendido o cancelado",
          estado: negocio.estado 
        });
      }

      // Agregar negocioId al request para uso en controladores
      req.negocioId = negocioId;
      req.negocio = negocio;
    }

    next();
  } catch (error) {
    console.error("Error en tenant middleware:", error);
    res.status(500).json({ error: "Error al verificar tenant" });
  }
}

// Middleware para rutas públicas que usan slug del negocio (para landing pages, etc.)
export async function tenantBySlugMiddleware(req, res, next) {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ error: "Slug de negocio requerido" });
    }

    const negocio = await prisma.negocio.findUnique({
      where: { slug },
      select: { id: true, estado: true, plan: true, nombre: true }
    });

    if (!negocio) {
      return res.status(404).json({ error: "Negocio no encontrado" });
    }

    if (negocio.estado !== "ACTIVO") {
      return res.status(403).json({ 
        error: "Negocio suspendido o cancelado",
        estado: negocio.estado 
      });
    }

    req.negocioId = negocio.id;
    req.negocio = negocio;

    next();
  } catch (error) {
    console.error("Error en tenant by slug middleware:", error);
    res.status(500).json({ error: "Error al verificar tenant" });
  }
}
