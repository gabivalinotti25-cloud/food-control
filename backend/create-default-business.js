import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createDefaultBusiness() {
  try {
    // Verificar si ya existe un negocio
    const existingBusiness = await prisma.negocio.findFirst();
    
    if (existingBusiness) {
      console.log('Ya existe un negocio:', existingBusiness.nombre);
      return;
    }

    // Crear negocio por defecto
    const business = await prisma.negocio.create({
      data: {
        nombre: "Food Control Demo",
        slug: "food-control-demo",
        email: "demo@foodcontrol.com",
        telefono: "+595999999999",
        direccion: "Demo Address",
        plan: "GRATIS",
        estado: "ACTIVO",
        maxUsuarios: 3,
        maxClientes: 50,
        maxPedidosMes: 100,
        maxSebastianMsg: 20,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días de trial
      }
    });

    console.log('Negocio por defecto creado:', business);
    console.log('ID del negocio:', business.id);
  } catch (error) {
    console.error('Error al crear negocio por defecto:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultBusiness();
