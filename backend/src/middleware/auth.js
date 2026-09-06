import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "food-control-secret-key";

export async function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      error: "No se proporcionó token de autenticación",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;

    // Verificar tenant (negocio) del usuario
    const negocioId = decoded.negocioId || 1;
    req.negocioId = negocioId;

    try {
      const negocio = await prisma.negocio.findUnique({
        where: { id: negocioId },
        select: { id: true, estado: true, plan: true },
      });

      if (negocio) {
        if (negocio.estado !== "ACTIVO") {
          return res.status(403).json({
            error: "Negocio suspendido o cancelado",
            estado: negocio.estado,
          });
        }
        req.negocio = negocio;
      }
    } catch (dbError) {
      // Si la tabla Negocio aún no existe en la DB, continuar sin bloquear
      console.error("Advertencia verificando tenant:", dbError.message);
    }

    next();
  } catch (error) {
    res.status(401).json({
      error: "Token inválido o expirado",
    });
  }
}

export function adminMiddleware(req, res, next) {
  if (req.usuario.rol !== "ADMIN") {
    return res.status(403).json({
      error: "Se requiere rol de administrador",
    });
  }
  next();
}
