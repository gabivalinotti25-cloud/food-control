import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log("🔍 Probando conexión a la base de datos...");
    
    // Verificar conexión
    await prisma.$connect();
    console.log("✅ Conexión exitosa a la base de datos");
    
    // Contar clientes existentes
    const clientesCount = await prisma.cliente.count();
    console.log(`📊 Clientes en base de datos: ${clientesCount}`);
    
    // Contar productos existentes
    const productosCount = await prisma.producto.count();
    console.log(`📊 Productos en base de datos: ${productosCount}`);
    
    // Contar pedidos existentes
    const pedidosCount = await prisma.pedido.count();
    console.log(`📊 Pedidos en base de datos: ${pedidosCount}`);
    
    // Crear un cliente de prueba
    console.log("\n🧪 Creando cliente de prueba...");
    const testCliente = await prisma.cliente.create({
      data: {
        nombre: "TEST_PERSISTENCE",
        telefono: "999999999",
        direccion: "Test Address",
        observacion: "Cliente de prueba para verificar persistencia",
      },
    });
    console.log(`✅ Cliente creado con ID: ${testCliente.id}`);
    
    // Verificar que el cliente existe
    const foundCliente = await prisma.cliente.findUnique({
      where: { id: testCliente.id },
    });
    console.log(`✅ Cliente encontrado: ${foundCliente.nombre}`);
    
    // Eliminar el cliente de prueba
    await prisma.cliente.delete({
      where: { id: testCliente.id },
    });
    console.log("🗑️ Cliente de prueba eliminado");
    
    console.log("\n✅ Prueba de base de datos completada exitosamente");
    console.log("📁 Base de datos: SQLite (file:./dev.db)");
    console.log("📍 Ubicación: backend/prisma/dev.db");
    
  } catch (error) {
    console.error("❌ Error en la prueba de base de datos:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
