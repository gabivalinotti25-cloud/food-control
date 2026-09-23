import prisma from "../src/prisma.js";

const EMAIL_DUENO = "gabivalinotti25@gmail.com";
const NEGOCIO_DUENO = 1;

// Todos los negocios excepto el del dueño
const negociosABorrar = await prisma.negocio.findMany({
  where: { id: { not: NEGOCIO_DUENO } },
  select: { id: true },
});

for (const { id: negocioId } of negociosABorrar) {
  const negocio = await prisma.negocio.findUnique({ where: { id: negocioId } });
  if (!negocio) {
    console.log(`Negocio ${negocioId} no existe, salto`);
    continue;
  }
  console.log(`\n🗑️  Eliminando negocio ${negocioId}: ${negocio.nombre} (${negocio.email})`);

  // Detalles que dependen de registros padre
  await prisma.pedidoDetalle.deleteMany({ where: { pedido: { negocioId } } }).catch(() => {});
  await prisma.menuPlantillaDetalle.deleteMany({ where: { plantilla: { negocioId } } }).catch(() => {});
  await prisma.menuDiarioDetalle.deleteMany({ where: { menuDiario: { negocioId } } }).catch(() => {});

  // Modelos con negocioId directo
  const modelos = [
    "pago", "movimientoCuenta", "ventaAnonima", "pedido",
    "menuDiario", "menuPlantilla", "configuracionMenu", "cajaDiaria",
    "producto", "categoria", "cliente",
    "propuestaSebastian", "notificacion", "historialConversacion", "auditoriaAcciones",
    "factura", "suscripcion", "onboarding", "usuario",
  ];

  for (const modelo of modelos) {
    try {
      const r = await prisma[modelo].deleteMany({ where: { negocioId } });
      if (r.count > 0) console.log(`   ${modelo}: ${r.count} eliminados`);
    } catch (e) {
      console.log(`   ⚠️ ${modelo}: ${e.message.split("\n")[0]}`);
    }
  }

  await prisma.negocio.delete({ where: { id: negocioId } });
  console.log(`   ✅ Negocio ${negocioId} eliminado`);
}

// Eliminar usuarios del negocio 1 que no sean el dueño
const otros = await prisma.usuario.findMany({
  where: { email: { not: EMAIL_DUENO } },
  select: { id: true, email: true },
});
for (const u of otros) {
  try {
    await prisma.usuario.delete({ where: { id: u.id } });
    console.log(`🗑️  Usuario eliminado: ${u.email}`);
  } catch {
    await prisma.usuario.update({ where: { id: u.id }, data: { activo: false } });
    console.log(`⚠️  ${u.email} desactivado (tiene datos asociados)`);
  }
}

console.log("\n--- Estado final ---");
console.table(await prisma.negocio.findMany({ select: { id: true, nombre: true, email: true } }));
console.table(await prisma.usuario.findMany({ select: { id: true, email: true, rol: true, negocioId: true } }));

await prisma.$disconnect();
