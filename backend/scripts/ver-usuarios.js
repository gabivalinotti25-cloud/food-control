import prisma from "../src/prisma.js";

const usuarios = await prisma.usuario.findMany({
  select: { id: true, email: true, nombre: true, rol: true, negocioId: true, activo: true },
});

console.table(usuarios);
await prisma.$disconnect();
