import prisma from "../src/prisma.js";

const negocios = await prisma.negocio.findMany({
  select: { id: true, nombre: true, email: true, slug: true, plan: true, estado: true, createdAt: true },
});

console.table(negocios);
await prisma.$disconnect();
