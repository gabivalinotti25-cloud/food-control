import prisma from "../prisma.js";
import bcrypt from "bcryptjs";

async function crearAdmin() {
  try {
    // Verificar si ya existe un admin
    const adminExistente = await prisma.usuario.findFirst({
      where: { rol: "ADMIN" },
    });

    if (adminExistente) {
      console.log("Ya existe un usuario administrador:");
      console.log(`Email: ${adminExistente.email}`);
      console.log(`Nombre: ${adminExistente.nombre}`);
      return;
    }

    // Crear usuario admin
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("admin123", salt);

    const admin = await prisma.usuario.create({
      data: {
        email: "admin@foodcontrol.com",
        password: passwordHash,
        nombre: "Administrador",
        rol: "ADMIN",
        activo: true,
      },
    });

    console.log("Usuario administrador creado exitosamente:");
    console.log(`Email: ${admin.email}`);
    console.log(`Nombre: ${admin.nombre}`);
    console.log(`Contraseña: admin123`);
    console.log("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login");
  } catch (error) {
    console.error("Error creando admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

crearAdmin();
