import prisma from "../src/prisma.js";

const emailDueno = "gabivalinotti25@gmail.com";

// 1. Poner al dueño como ADMIN
const dueno = await prisma.usuario.update({
  where: { email: emailDueno },
  data: { rol: "ADMIN" },
});
console.log(`✅ ${dueno.email} ahora es ADMIN`);

// 2. Eliminar los demás usuarios del negocio 1
const otros = await prisma.usuario.findMany({
  where: { email: { not: emailDueno } },
  select: { id: true, email: true },
});

for (const u of otros) {
  try {
    await prisma.usuario.delete({ where: { id: u.id } });
    console.log(`🗑️  Eliminado: ${u.email}`);
  } catch (e) {
    // Si tiene registros asociados (FK), desactivar en vez de eliminar
    await prisma.usuario.update({ where: { id: u.id }, data: { activo: false } });
    console.log(`⚠️  No se pudo eliminar ${u.email} (tiene datos asociados) → desactivado`);
  }
}

await prisma.$disconnect();
