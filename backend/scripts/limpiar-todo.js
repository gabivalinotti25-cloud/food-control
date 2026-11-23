import prisma from "../src/prisma.js";

const EMAIL_DUENO = "gabivalinotti25@gmail.com";
const NEGOCIO_DUENO = 1;

console.log("🧹 Limpiando suscripciones, usuarios y negocios...\n");

// 1. Eliminar suscripciones de otros negocios
const suscripcionesBorradas = await prisma.suscripcion.deleteMany({
  where: { negocioId: { not: NEGOCIO_DUENO } }
});
console.log(`🗑️  Suscripciones eliminadas: ${suscripcionesBorradas.count}`);

// 2. Eliminar facturas de otros negocios
const facturasBorradas = await prisma.factura.deleteMany({
  where: { negocioId: { not: NEGOCIO_DUENO } }
});
console.log(`🗑️  Facturas eliminadas: ${facturasBorradas.count}`);

// 3. Eliminar onboarding de otros negocios
const onboardingBorrados = await prisma.onboarding.deleteMany({
  where: { negocioId: { not: NEGOCIO_DUENO } }
});
console.log(`🗑️  Onboardings eliminados: ${onboardingBorrados.count}`);

// 4. Eliminar usuarios de otros negocios
const usuariosBorrados = await prisma.usuario.deleteMany({
  where: { negocioId: { not: NEGOCIO_DUENO } }
});
console.log(`🗑️  Usuarios de otros negocios eliminados: ${usuariosBorrados.count}`);

// 5. Eliminar usuarios del negocio 1 que no sean el dueño
const otrosUsuarios = await prisma.usuario.findMany({
  where: { negocioId: NEGOCIO_DUENO, email: { not: EMAIL_DUENO } },
  select: { id: true, email: true }
});
for (const u of otrosUsuarios) {
  try {
    await prisma.usuario.delete({ where: { id: u.id } });
    console.log(`🗑️  Usuario eliminado: ${u.email}`);
  } catch {
    await prisma.usuario.update({ where: { id: u.id }, data: { activo: false } });
    console.log(`⚠️  ${u.email} desactivado (tiene datos asociados)`);
  }
}

// 6. Eliminar negocios excepto el del dueño
const negociosBorrados = await prisma.negocio.deleteMany({
  where: { id: { not: NEGOCIO_DUENO } }
});
console.log(`🗑️  Negocios eliminados: ${negociosBorrados.count}`);

// 7. Eliminar suscripción del negocio 1 (opcional, si querés limpiar también la tuya)
const suscripcionDueno = await prisma.suscripcion.deleteMany({
  where: { negocioId: NEGOCIO_DUENO }
});
console.log(`🗑️  Suscripción del negocio 1 eliminada: ${suscripcionDueno.count}`);

console.log("\n--- Estado final ---");
console.table(await prisma.negocio.findMany({ select: { id: true, nombre: true, email: true } }));
console.table(await prisma.usuario.findMany({ select: { id: true, email: true, rol: true, negocioId: true } }));

await prisma.$disconnect();
console.log("\n✅ Limpieza completada");
