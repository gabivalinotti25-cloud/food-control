import prisma from "../prisma.js";

// Middleware para verificar límites del plan del negocio
// Uso: router.post("/", authMiddleware, verificarLimite("clientes"), crearCliente)
// Tipos: "clientes" | "pedidos" | "usuarios" | "sebastian"
export function verificarLimite(tipo) {
  return async (req, res, next) => {
    try {
      const negocioId = req.negocioId || req.usuario?.negocioId || 1;

      const negocio = await prisma.negocio.findUnique({
        where: { id: negocioId },
        select: {
          plan: true,
          maxClientes: true,
          maxPedidosMes: true,
          maxUsuarios: true,
          maxSebastianMsg: true,
        },
      });

      // Si no hay negocio (datos legacy), no limitar
      if (!negocio) return next();

      let actual = 0;
      let limite = Infinity;
      let recurso = "";

      switch (tipo) {
        case "clientes":
          limite = negocio.maxClientes;
          recurso = "clientes";
          actual = await prisma.cliente.count({ where: { negocioId } });
          break;

        case "pedidos": {
          limite = negocio.maxPedidosMes;
          recurso = "pedidos este mes";
          const inicioMes = new Date();
          inicioMes.setDate(1);
          inicioMes.setHours(0, 0, 0, 0);
          actual = await prisma.pedido.count({
            where: { negocioId, fecha: { gte: inicioMes } },
          });
          break;
        }

        case "usuarios":
          limite = negocio.maxUsuarios;
          recurso = "usuarios";
          actual = await prisma.usuario.count({
            where: { negocioId, activo: true },
          });
          break;

        case "sebastian": {
          limite = negocio.maxSebastianMsg;
          recurso = "mensajes de Sebastian este mes";
          const inicioMes = new Date();
          inicioMes.setDate(1);
          inicioMes.setHours(0, 0, 0, 0);
          actual = await prisma.historialConversacion.count({
            where: { negocioId, createdAt: { gte: inicioMes } },
          });
          break;
        }

        default:
          return next();
      }

      if (actual >= limite) {
        return res.status(403).json({
          error: `Límite del plan ${negocio.plan} alcanzado: máximo ${limite} ${recurso}`,
          limite,
          actual,
          plan: negocio.plan,
          upgrade: true,
        });
      }

      next();
    } catch (error) {
      console.error("Error verificando límite de plan:", error);
      // Fail-closed: si no podemos verificar el límite, no permitir la operación
      res.status(500).json({ error: "Error al verificar límites del plan" });
    }
  };
}
