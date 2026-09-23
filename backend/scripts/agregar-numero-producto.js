import prisma from "../src/prisma.js";

// Agregar columna numero a Producto (si no existe)
await prisma.$executeRawUnsafe(`
  ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "numero" INTEGER;
`);
console.log("✅ Columna numero agregada");

// Índice único por negocio (permite múltiples NULL)
await prisma.$executeRawUnsafe(`
  CREATE UNIQUE INDEX IF NOT EXISTS "Producto_negocioId_numero_key"
  ON "Producto" ("negocioId", "numero");
`);
console.log("✅ Índice único creado");

await prisma.$disconnect();
