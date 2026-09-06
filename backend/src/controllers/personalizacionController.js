import prisma from "../prisma.js";

export async function obtenerPersonalizacion(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: {
        id: true,
        nombre: true,
        slug: true,
        logoUrl: true,
        colorPrimario: true,
        colorSecundario: true,
        dominioCustom: true,
      },
    });

    if (!negocio) {
      return res.status(404).json({
        error: "Negocio no encontrado",
      });
    }

    res.json({
      negocio: {
        id: negocio.id,
        nombre: negocio.nombre,
        slug: negocio.slug,
      },
      personalizacion: {
        logoUrl: negocio.logoUrl,
        colorPrimario: negocio.colorPrimario,
        colorSecundario: negocio.colorSecundario,
        dominioCustom: negocio.dominioCustom,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener personalización",
    });
  }
}

export async function actualizarPersonalizacion(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { logoUrl, colorPrimario, colorSecundario, dominioCustom } = req.body;

    // Validar colores si se proporcionan
    if (colorPrimario && !/^#[0-9A-Fa-f]{6}$/.test(colorPrimario)) {
      return res.status(400).json({
        error: "Color primario inválido. Debe ser formato HEX (ej: #3B82F6)",
      });
    }

    if (colorSecundario && !/^#[0-9A-Fa-f]{6}$/.test(colorSecundario)) {
      return res.status(400).json({
        error: "Color secundario inválido. Debe ser formato HEX (ej: #1E40AF)",
      });
    }

    // Validar dominio custom si se proporciona
    if (dominioCustom) {
      const dominioRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!dominioRegex.test(dominioCustom)) {
        return res.status(400).json({
          error: "Dominio custom inválido. Debe ser un dominio válido (ej: mi-negocio.com)",
        });
      }

      // Verificar si el dominio ya está en uso por otro negocio
      const dominioExistente = await prisma.negocio.findFirst({
        where: {
          dominioCustom,
          id: { not: negocioId },
        },
      });

      if (dominioExistente) {
        return res.status(400).json({
          error: "El dominio custom ya está en uso por otro negocio",
        });
      }
    }

    // Actualizar personalización
    const negocioActualizado = await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        colorPrimario: colorPrimario !== undefined ? colorPrimario : undefined,
        colorSecundario: colorSecundario !== undefined ? colorSecundario : undefined,
        dominioCustom: dominioCustom !== undefined ? dominioCustom : undefined,
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        logoUrl: true,
        colorPrimario: true,
        colorSecundario: true,
        dominioCustom: true,
      },
    });

    res.json({
      mensaje: "Personalización actualizada exitosamente",
      negocio: negocioActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al actualizar personalización",
    });
  }
}

export async function subirLogo(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    
    // Aquí iría la lógica para subir el logo a un servicio de almacenamiento
    // como AWS S3, Cloudinary, o similar
    // Por ahora, simulamos que recibimos una URL
    
    const { logoUrl } = req.body;
    
    if (!logoUrl) {
      return res.status(400).json({
        error: "URL del logo es requerida",
      });
    }

    // Validar que sea una URL de imagen válida
    const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i;
    if (!urlRegex.test(logoUrl)) {
      return res.status(400).json({
        error: "URL del logo inválida. Debe ser una imagen válida (jpg, png, gif, webp, svg)",
      });
    }

    // Actualizar logo del negocio
    const negocioActualizado = await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        logoUrl,
      },
      select: {
        id: true,
        nombre: true,
        logoUrl: true,
      },
    });

    res.json({
      mensaje: "Logo actualizado exitosamente",
      negocio: negocioActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al subir logo",
    });
  }
}

export async function eliminarLogo(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    // Eliminar logo del negocio
    const negocioActualizado = await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        logoUrl: null,
      },
      select: {
        id: true,
        nombre: true,
        logoUrl: true,
      },
    });

    res.json({
      mensaje: "Logo eliminado exitosamente",
      negocio: negocioActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al eliminar logo",
    });
  }
}

export async function obtenerTemas(req, res) {
  try {
    // Retornar temas predefinidos para personalización
    const temas = [
      {
        id: "default",
        nombre: "Food Control (Default)",
        colorPrimario: "#3B82F6",
        colorSecundario: "#1E40AF",
        descripcion: "Tema por defecto de Food Control",
      },
      {
        id: "naranja",
        nombre: "Naranja Vibrante",
        colorPrimario: "#F97316",
        colorSecundario: "#C2410C",
        descripcion: "Tema cálido y energético",
      },
      {
        id: "verde",
        nombre: "Verde Fresco",
        colorPrimario: "#10B981",
        colorSecundario: "#047857",
        descripcion: "Tema natural y saludable",
      },
      {
        id: "morado",
        nombre: "Morado Elegante",
        colorPrimario: "#8B5CF6",
        colorSecundario: "#6D28D9",
        descripcion: "Tema sofisticado y moderno",
      },
      {
        id: "rosa",
        nombre: "Rosa Suave",
        colorPrimario: "#EC4899",
        colorSecundario: "#BE185D",
        descripcion: "Tema amigable y acogedor",
      },
      {
        id: "gris",
        nombre: "Gris Profesional",
        colorPrimario: "#6B7280",
        colorSecundario: "#374151",
        descripcion: "Tema minimalista y corporativo",
      },
    ];

    res.json(temas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener temas",
    });
  }
}

export async function aplicarTema(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { temaId } = req.body;

    // Obtener temas disponibles
    const temas = [
      {
        id: "default",
        colorPrimario: "#3B82F6",
        colorSecundario: "#1E40AF",
      },
      {
        id: "naranja",
        colorPrimario: "#F97316",
        colorSecundario: "#C2410C",
      },
      {
        id: "verde",
        colorPrimario: "#10B981",
        colorSecundario: "#047857",
      },
      {
        id: "morado",
        colorPrimario: "#8B5CF6",
        colorSecundario: "#6D28D9",
      },
      {
        id: "rosa",
        colorPrimario: "#EC4899",
        colorSecundario: "#BE185D",
      },
      {
        id: "gris",
        colorPrimario: "#6B7280",
        colorSecundario: "#374151",
      },
    ];

    const tema = temas.find((t) => t.id === temaId);

    if (!tema) {
      return res.status(400).json({
        error: "Tema no encontrado",
      });
    }

    // Aplicar tema al negocio
    const negocioActualizado = await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        colorPrimario: tema.colorPrimario,
        colorSecundario: tema.colorSecundario,
      },
      select: {
        id: true,
        nombre: true,
        colorPrimario: true,
        colorSecundario: true,
      },
    });

    res.json({
      mensaje: "Tema aplicado exitosamente",
      negocio: negocioActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al aplicar tema",
    });
  }
}

export async function obtenerPersonalizacionPublica(req, res) {
  try {
    const { slug } = req.params;

    const negocio = await prisma.negocio.findUnique({
      where: { slug },
      select: {
        id: true,
        nombre: true,
        slug: true,
        logoUrl: true,
        colorPrimario: true,
        colorSecundario: true,
        dominioCustom: true,
      },
    });

    if (!negocio) {
      return res.status(404).json({
        error: "Negocio no encontrado",
      });
    }

    // Verificar que el negocio esté activo
    if (negocio.estado !== "ACTIVO") {
      return res.status(403).json({
        error: "Negocio no disponible",
      });
    }

    res.json({
      negocio: {
        id: negocio.id,
        nombre: negocio.nombre,
        slug: negocio.slug,
      },
      personalizacion: {
        logoUrl: negocio.logoUrl,
        colorPrimario: negocio.colorPrimario,
        colorSecundario: negocio.colorSecundario,
        dominioCustom: negocio.dominioCustom,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener personalización pública",
    });
  }
}
