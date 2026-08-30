import rateLimit from 'express-rate-limit';

// Rate limiting para Sebastian (evitar abuso de IA que cuesta dinero)
export const sebastianRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 mensajes por usuario cada 15 minutos
  message: {
    error: 'Has excedido el límite de mensajes de Sebastian. Por favor espera unos minutos antes de volver a usarlo.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usar el ID del usuario si está autenticado, sino la IP
    if (req.user && req.user.id) {
      return `user_${req.user.id}`;
    }
    return req.ip;
  }
});

// Rate limiting general para API (evitar abuso general)
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 solicitudes por usuario cada 15 minutos
  message: {
    error: 'Has excedido el límite de solicitudes. Por favor espera unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `user_${req.user.id}`;
    }
    return req.ip;
  }
});
