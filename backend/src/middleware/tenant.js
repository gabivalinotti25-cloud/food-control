import prisma from "../prisma.js";

// Middleware para identificar el tenant (negocio) del usuario autenticado
// Debe usarse DESPUÉS de authMiddleware
export async function tenantMiddleware(req, res, next) {
  try {
    if (req.usuario && req.usuario.negocioId) {
      const negocioId = req.usuario.negocioId;

      const negocio = await prisma.negocio.findUnique({
        where: { id: negocioId },
        select: { id: true, estado: true, plan: true },
      });

      if (!negocio) {
        return res.status(404).json({ error: "Negocio no encontrado" });
      }

      if (negocio.estado !== "ACTIVO") {
        return res.status(403).json({
          error: "Negocio suspendido o cancelado",
          estado: negocio.estado,
        });
      }

      req.negocioId = negocioId;
      req.negocio = negocio;
    }

    next();
  } catch (error) {
    console.error("Error en tenant middleware:", error);
    res.status(500).json({ error: "Error al verificar tenant" });
  }
}

// Middleware para rutas públicas que identifican el negocio por slug
// (ej: menú público, página de pedidos de un negocio)
export async function tenantBySlugMiddleware(req, res, next) {
  try {
    const slug = req.params.slug || req.query.slug || req.headers["x-negocio-slug"];

    if (!slug) {
      return res.status(400).json({ error: "Se requiere identificador de negocio" });
    }

    const negocio = await prisma.negocio.findUnique({
      where: { slug },
      select: { id: true, estado: true, plan: true, nombre: true },
    });

    if (!negocio) {
      return res.status(404).json({ error: "Negocio no encontrado" });
    }

    if (negocio.estado !== "ACTIVO") {
      return res.status(403).json({ error: "Negocio no disponible" });
    }

    req.negocioId = negocio.id;
    req.negocio = negocio;
    next();
  } catch (error) {
    console.error("Error en tenant by slug middleware:", error);
    res.status(500).json({ error: "Error al verificar negocio" });
  }
}
