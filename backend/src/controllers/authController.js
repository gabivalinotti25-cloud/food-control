import prisma from "../prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "food-control-secret-key";

export async function registrar(req, res) {
  try {
    const { email, password, nombre, rol } = req.body;

    if (!email?.trim() || !password?.trim() || !nombre?.trim()) {
      return res.status(400).json({
        error: "Email, contraseña y nombre son obligatorios",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (usuarioExistente) {
      return res.status(400).json({
        error: "El email ya está registrado",
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        email: email.trim().toLowerCase(),
        password: passwordHash,
        nombre: nombre.trim(),
        rol: rol || "EMPLEADO",
      },
    });

    // Generar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al registrar usuario",
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        error: "Email y contraseña son obligatorios",
      });
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!usuario) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(401).json({
        error: "Usuario desactivado",
      });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al iniciar sesión",
    });
  }
}

export async function obtenerPerfil(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener perfil",
    });
  }
}

export async function listarUsuarios(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al listar usuarios",
    });
  }
}

export async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, rol, activo } = req.body;

    const usuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        nombre,
        rol,
        activo,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
      },
    });

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al actualizar usuario",
    });
  }
}

export async function cambiarPassword(req, res) {
  try {
    const { passwordActual, passwordNueva } = req.body;

    // Obtener usuario con contraseña
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
    });

    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        error: "Contraseña actual incorrecta",
      });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordNueva, salt);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: req.usuario.id },
      data: {
        password: passwordHash,
      },
    });

    res.json({
      mensaje: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al cambiar contraseña",
    });
  }
}
