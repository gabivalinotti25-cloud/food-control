// Script de sincronización de base de datos para deploy
// 1. Crea la tabla Negocio y el negocio por defecto (id=1) si no existen
// 2. Ejecuta prisma db push para aplicar el resto del schema
import { execSync } from "child_process";
import pg from "pg";

const { Client } = pg;

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log("🔌 Conectado a la base de datos");

    // Crear tabla Negocio si no existe (estructura mínima compatible con el schema)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Negocio" (
        "id" SERIAL PRIMARY KEY,
        "nombre" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "telefono" TEXT,
        "direccion" TEXT,
        "plan" TEXT NOT NULL DEFAULT 'GRATIS',
        "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
        "maxUsuarios" INTEGER NOT NULL DEFAULT 3,
        "maxClientes" INTEGER NOT NULL DEFAULT 50,
        "maxPedidosMes" INTEGER NOT NULL DEFAULT 100,
        "maxSebastianMsg" INTEGER NOT NULL DEFAULT 20,
        "whatsappNumero" TEXT,
        "whatsappApiKey" TEXT,
        "logoUrl" TEXT,
        "colorPrimario" TEXT NOT NULL DEFAULT '#3B82F6',
        "colorSecundario" TEXT NOT NULL DEFAULT '#1E40AF',
        "dominioCustom" TEXT,
        "trialEndsAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Negocio_slug_key" ON "Negocio"("slug");
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Negocio_email_key" ON "Negocio"("email");
    `);

    // Insertar negocio por defecto si no existe
    const { rows } = await client.query(`SELECT id FROM "Negocio" WHERE id = 1`);
    if (rows.length === 0) {
      await client.query(`
        INSERT INTO "Negocio" (id, nombre, slug, email, plan, estado)
        VALUES (1, 'Mi Negocio', 'mi-negocio', 'admin@foodcontrol.local', 'GRATIS', 'ACTIVO')
        ON CONFLICT (id) DO NOTHING;
      `);
      // Ajustar la secuencia por si el id fue insertado manualmente
      await client.query(`
        SELECT setval(pg_get_serial_sequence('"Negocio"', 'id'), COALESCE((SELECT MAX(id) FROM "Negocio"), 1));
      `);
      console.log("✅ Negocio por defecto creado (id=1)");
    } else {
      console.log("ℹ️ Negocio por defecto ya existe");
    }
  } catch (error) {
    console.error("⚠️ Error preparando tabla Negocio:", error.message);
    // Continuar igual: prisma db push intentará aplicar el schema completo
  } finally {
    await client.end().catch(() => {});
  }

  // Aplicar el schema completo
  console.log("📦 Ejecutando prisma db push...");
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
  console.log("✅ Schema sincronizado");
}

main().catch((error) => {
  console.error("❌ Error en sincronización de DB:", error);
  process.exit(1);
});
