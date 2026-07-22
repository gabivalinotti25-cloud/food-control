import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "food-control-secret-key";

export function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      error: "No se proporcionó token de autenticación",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
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
