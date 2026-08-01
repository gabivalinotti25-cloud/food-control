import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function limpiarPrueba() {
  try {
    console.log("🧹 Limpiando datos de prueba...");
    
    // Eliminar en orden correcto para respetar foreign keys
    // Primero detalles de pedido
    await prisma.pedidoDetalle.deleteMany({ where: { pedidoId: 4 } });
    console.log("✅ Detalles de pedido eliminados");
    
    // Luego pago
    await prisma.pago.deleteMany({ where: { pedidoId: 4 } });
    console.log("✅ Pago eliminado");
    
    // Luego pedido
    await prisma.pedido.deleteMany({ where: { id: 4 } });
    console.log("✅ Pedido de prueba eliminado");
    
    // Eliminar producto de prueba
    await prisma.producto.deleteMany({ where: { id: 12 } });
    console.log("✅ Producto de prueba eliminado");
    
    // Eliminar cliente de prueba
    await prisma.cliente.deleteMany({ where: { id: 5 } });
    console.log("✅ Cliente de prueba eliminado");
    
    console.log("✅ Datos de prueba eliminados correctamente");
  } catch (error) {
    console.error("❌ Error al eliminar datos de prueba:", error);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarPrueba();
