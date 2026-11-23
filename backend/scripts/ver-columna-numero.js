import prisma from "../src/prisma.js";

const cols = await prisma.$queryRawUnsafe(`
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'Producto' AND column_name = 'numero'
`);
console.log("Columna numero existe:", cols.length > 0);
await prisma.$disconnect();
