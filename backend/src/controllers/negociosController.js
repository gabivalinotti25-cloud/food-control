import prisma from "../prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está configurado en las variables de entorno");
}

// Generar slug único a partir del nombre
function generarSlug(nombre) {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function generarSlugUnico(nombre) {
  const slug = generarSlug(nombre);
  let contador = 1;
  let slugUnico = slug || "negocio";

  while (true) {
    const existente = await prisma.negocio.findUnique({
      where: { slug: slugUnico },
    });
    if (!existente) return slugUnico;
    slugUnico = `${slug}-${contador}`;
    contador++;
  }
}

// Registro público de un nuevo negocio con su usuario administrador
export async function registrarNegocio(req, res) {
  try {
    const {
      nombre,
      email,
      telefono,
      direccion,
      adminNombre,
      adminEmail,
      adminPassword,
    } = req.body;

    if (!nombre?.trim() || !email?.trim() || !adminNombre?.trim() || !adminEmail?.trim() || !adminPassword?.trim()) {
      return res.status(400).json({
        error: "Nombre del negocio, email, nombre del admin, email del admin y contraseña son obligatorios",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: "Email del negocio inválido" });
    }
    if (!emailRegex.test(adminEmail.trim())) {
      return res.status(400).json({ error: "Email del administrador inválido" });
    }

    if (adminPassword.length < 8) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    const tieneMayuscula = /[A-Z]/.test(adminPassword);
    const tieneMinuscula = /[a-z]/.test(adminPassword);
    const tieneNumero = /[0-9]/.test(adminPassword);
    const tieneSimbolo = /[^a-zA-Z0-9]/.test(adminPassword);

    if (!tieneMayuscula || !tieneMinuscula || !tieneNumero || !tieneSimbolo) {
      return res.status(400).json({
        error: "La contraseña debe incluir mayúscula, minúscula, número y símbolo",
      });
    }

    const negocioExistente = await prisma.negocio.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (negocioExistente) {
      return res.status(400).json({ error: "El email del negocio ya está registrado" });
    }

    const adminExistente = await prisma.usuario.findUnique({
      where: { email: adminEmail.trim().toLowerCase() },
    });
    if (adminExistente) {
      return res.status(400).json({ error: "El email del administrador ya está registrado" });
    }

    const slug = await generarSlugUnico(nombre);

    const negocio = await prisma.negocio.create({
      data: {
        nombre: nombre.trim(),
        slug,
        email: email.trim().toLowerCase(),
        telefono: telefono?.trim() || null,
        direccion: direccion?.trim() || null,
        plan: "GRATIS",
        estado: "ACTIVO",
        maxUsuarios: 3,
        maxClientes: 50,
        maxPedidosMes: 100,
        maxSebastianMsg: 20,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const admin = await prisma.usuario.create({
      data: {
        email: adminEmail.trim().toLowerCase(),
        password: passwordHash,
        nombre: adminNombre.trim(),
        rol: "ADMIN",
        negocioId: negocio.id,
      },
    });

    // Crear onboarding inicial
    await prisma.onboarding.create({
      data: { negocioId: negocio.id },
    });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, rol: admin.rol, negocioId: admin.negocioId },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      mensaje: "Negocio registrado exitosamente",
      negocio: {
        id: negocio.id,
        nombre: negocio.nombre,
        slug: negocio.slug,
        email: negocio.email,
        plan: negocio.plan,
        trialEndsAt: negocio.trialEndsAt,
      },
      admin: {
        id: admin.id,
        email: admin.email,
        nombre: admin.nombre,
        rol: admin.rol,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar negocio" });
  }
}

export async function obtenerNegocio(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      include: {
        _count: {
          select: {
            usuarios: true,
            clientes: true,
            productos: true,
            pedidos: true,
          },
        },
      },
    });

    if (!negocio) {
      return res.status(404).json({ error: "Negocio no encontrado" });
    }

    res.json(negocio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener negocio" });
  }
}

export async function actualizarNegocio(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { nombre, telefono, direccion, whatsappNumero, logoUrl, colorPrimario, colorSecundario } = req.body;

    const negocioActualizado = await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        nombre: nombre?.trim(),
        telefono: telefono?.trim(),
        direccion: direccion?.trim(),
        whatsappNumero: whatsappNumero?.trim(),
        logoUrl,
        colorPrimario,
        colorSecundario,
      },
    });

    res.json(negocioActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar negocio" });
  }
}

export async function obtenerPlanes(req, res) {
  try {
    const planes = [
      {
        codigo: "GRATIS",
        nombre: "Plan Gratuito",
        descripcion: "Ideal para comenzar",
        precio: 0,
        maxUsuarios: 3,
        maxClientes: 50,
        maxPedidosMes: 100,
        maxSebastianMsg: 20,
        caracteristicas: ["3 usuarios", "50 clientes", "100 pedidos/mes", "20 mensajes de Sebastian/mes", "Soporte por email"],
      },
      {
        codigo: "BASICO",
        nombre: "Plan Básico",
        descripcion: "Para negocios pequeños",
        precio: 29,
        maxUsuarios: 5,
        maxClientes: 200,
        maxPedidosMes: 500,
        maxSebastianMsg: 100,
        caracteristicas: ["5 usuarios", "200 clientes", "500 pedidos/mes", "100 mensajes de Sebastian/mes", "Soporte prioritario", "Exportación de datos"],
      },
      {
        codigo: "PRO",
        nombre: "Plan Pro",
        descripcion: "Para negocios en crecimiento",
        precio: 79,
        maxUsuarios: 15,
        maxClientes: 1000,
        maxPedidosMes: 2000,
        maxSebastianMsg: 500,
        caracteristicas: ["15 usuarios", "1000 clientes", "2000 pedidos/mes", "500 mensajes de Sebastian/mes", "Soporte 24/7", "API access", "Integración WhatsApp", "Reportes avanzados"],
      },
      {
        codigo: "ENTERPRISE",
        nombre: "Plan Enterprise",
        descripcion: "Para grandes operaciones",
        precio: 199,
        maxUsuarios: -1,
        maxClientes: -1,
        maxPedidosMes: -1,
        maxSebastianMsg: -1,
        caracteristicas: ["Usuarios ilimitados", "Clientes ilimitados", "Pedidos ilimitados", "Sebastian ilimitado", "Soporte dedicado", "API completa", "Integraciones personalizadas", "White-label", "SLA garantizado"],
      },
    ];

    res.json(planes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener planes" });
  }
}
