import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testPersistence() {
  try {
    console.log("🧪 Prueba de persistencia de datos completa");
    console.log("=" .repeat(50));
    
    // 1. Crear un cliente de prueba
    console.log("\n1️⃣ Creando cliente de prueba...");
    const telefonoUnico = `TEST_${Date.now()}`;
    const cliente = await prisma.cliente.create({
      data: {
        nombre: "Cliente Persistencia Test",
        telefono: telefonoUnico,
        direccion: "Dirección de prueba",
        observacion: "Cliente para probar persistencia",
      },
    });
    console.log(`✅ Cliente creado: ${cliente.nombre} (ID: ${cliente.id})`);
    
    // 2. Crear un producto de prueba
    console.log("\n2️⃣ Creando producto de prueba...");
    const producto = await prisma.producto.create({
      data: {
        nombre: "Producto Test Persistencia",
        precio: 15000,
        esFijo: false,
        esLibre: false,
        esEspecial: false,
        activo: true,
      },
    });
    console.log(`✅ Producto creado: ${producto.nombre} (ID: ${producto.id})`);
    
    // 3. Crear un pedido de prueba
    console.log("\n3️⃣ Creando pedido de prueba...");
    const pedido = await prisma.pedido.create({
      data: {
        total: 15000,
        clienteId: cliente.id,
        estado: "ENTREGADO",
        estadoPago: "PAGADO",
        fecha: new Date(),
        pago: {
          create: {
            monto: 15000,
            forma: "EFECTIVO",
          },
        },
        detalles: {
          create: [
            {
              productoId: producto.id,
              cantidad: 1,
              precioUnitario: 15000,
              subtotal: 15000,
            },
          ],
        },
      },
      include: {
        cliente: true,
        pago: true,
        detalles: { include: { producto: true } },
      },
    });
    console.log(`✅ Pedido creado: #${pedido.id} - Total: ${pedido.total}`);
    
    // 4. Verificar que los datos existen
    console.log("\n4️⃣ Verificando persistencia de datos...");
    const clienteVerificado = await prisma.cliente.findUnique({
      where: { id: cliente.id },
    });
    const productoVerificado = await prisma.producto.findUnique({
      where: { id: producto.id },
    });
    const pedidoVerificado = await prisma.pedido.findUnique({
      where: { id: pedido.id },
      include: { cliente: true, pago: true },
    });
    
    console.log(`✅ Cliente persistido: ${clienteVerificado.nombre}`);
    console.log(`✅ Producto persistido: ${productoVerificado.nombre}`);
    console.log(`✅ Pedido persistido: #${pedidoVerificado.id}`);
    
    // 5. Contar todos los datos
    console.log("\n5️⃣ Conteo total de datos en base de datos:");
    const totalClientes = await prisma.cliente.count();
    const totalProductos = await prisma.producto.count();
    const totalPedidos = await prisma.pedido.count();
    
    console.log(`📊 Total clientes: ${totalClientes}`);
    console.log(`📊 Total productos: ${totalProductos}`);
    console.log(`📊 Total pedidos: ${totalPedidos}`);
    
    // 6. Dejar datos para verificación manual
    console.log("\n6️⃣ Datos de prueba dejados en base de datos para verificación:");
    console.log(`📝 Cliente: ${cliente.nombre} (ID: ${cliente.id})`);
    console.log(`📝 Producto: ${producto.nombre} (ID: ${producto.id})`);
    console.log(`📝 Pedido: #${pedido.id}`);
    console.log("⚠️  Estos datos permanecerán en la base de datos para verificar persistencia");
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ Prueba de persistencia completada exitosamente");
    console.log("📁 Base de datos: backend/prisma/dev.db");
    console.log("💾 Los datos se guardan permanentemente en SQLite");
    console.log("🔄 Reinicia la aplicación y verifica que estos datos aún existen");
    
  } catch (error) {
    console.error("❌ Error en la prueba de persistencia:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testPersistence();
