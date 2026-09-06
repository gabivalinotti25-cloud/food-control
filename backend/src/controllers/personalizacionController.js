import prisma from "../prisma.js";

const TEMAS = [
  { id: "default", nombre: "Food Control (Default)", colorPrimario: "#3B82F6", colorSecundario: "#1E40AF" },
  { id: "naranja", nombre: "Naranja Vibrante", colorPrimario: "#F97316", colorSecundario: "#C2410C" },
  { id: "verde", nombre: "Verde Fresco", colorPrimario: "#10B981", colorSecundario: "#047857" },
  { id: "morado", nombre: "Morado Elegante", colorPrimario: "#8B5CF6", colorSecundario: "#6D28D9" },
  { id: "rosa", nombre: "Rosa Suave", colorPrimario: "#EC4899", colorSecundario: "#BE185D" },
  { id: "gris", nombre: "Gris Profesional", colorPrimario: "#6B7280", colorSecundario: "#374151" },
];

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
      return res.status(404).json({ error: "Negocio no encontrado" });
    }

    res.json({ negocio, personalizacion: {
      logoUrl: negocio.logoUrl,
      colorPrimario: negocio.colorPrimario,
      colorSecundario: negocio.colorSecundario,
      dominioCustom: negocio.dominioCustom,
    }});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener personalización" });
  }
}

export async function actualizarPersonalizacion(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { logoUrl, colorPrimario, colorSecundario, dominioCustom } = req.body;

    if (colorPrimario && !/^#[0-9A-Fa-f]{6}$/.test(colorPrimario)) {
      return res.status(400).json({ error: "Color primario inválido. Formato HEX (ej: #3B82F6)" });
    }
    if (colorSecundario && !/^#[0-9A-Fa-f]{6}$/.test(colorSecundario)) {
      return res.status(400).json({ error: "Color secundario inválido. Formato HEX (ej: #1E40AF)" });
    }

    if (dominioCustom) {
      const dominioRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!dominioRegex.test(dominioCustom)) {
        return res.status(400).json({ error: "Dominio custom inválido" });
      }
      const dominioExistente = await prisma.negocio.findFirst({
        where: { dominioCustom, id: { not: negocioId } },
      });
      if (dominioExistente) {
        return res.status(400).json({ error: "El dominio ya está en uso por otro negocio" });
      }
    }

    const negocio = await prisma.negocio.update({
      where: { id: negocioId },
      data: {
        ...(logoUrl !== undefined && { logoUrl }),
        ...(colorPrimario !== undefined && { colorPrimario }),
        ...(colorSecundario !== undefined && { colorSecundario }),
        ...(dominioCustom !== undefined && { dominioCustom }),
      },
      select: {
        id: true, nombre: true, slug: true,
        logoUrl: true, colorPrimario: true, colorSecundario: true, dominioCustom: true,
      },
    });

    res.json({ mensaje: "Personalización actualizada", negocio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar personalización" });
  }
}

export async function eliminarLogo(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const negocio = await prisma.negocio.update({
      where: { id: negocioId },
      data: { logoUrl: null },
      select: { id: true, nombre: true, logoUrl: true },
    });

    res.json({ mensaje: "Logo eliminado", negocio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar logo" });
  }
}

export async function obtenerTemas(req, res) {
  res.json(TEMAS);
}

export async function aplicarTema(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { temaId } = req.body;

    const tema = TEMAS.find((t) => t.id === temaId);
    if (!tema) {
      return res.status(400).json({ error: "Tema no encontrado" });
    }

    const negocio = await prisma.negocio.update({
      where: { id: negocioId },
      data: { colorPrimario: tema.colorPrimario, colorSecundario: tema.colorSecundario },
      select: { id: true, nombre: true, colorPrimario: true, colorSecundario: true },
    });

    res.json({ mensaje: "Tema aplicado", negocio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al aplicar tema" });
  }
}

// Endpoint público: personalización por slug (para páginas white-label)
export async function obtenerPersonalizacionPublica(req, res) {
  try {
    const { slug } = req.params;

    const negocio = await prisma.negocio.findUnique({
      where: { slug },
      select: {
        id: true, nombre: true, slug: true, estado: true,
        logoUrl: true, colorPrimario: true, colorSecundario: true, dominioCustom: true,
      },
    });

    if (!negocio || negocio.estado !== "ACTIVO") {
      return res.status(404).json({ error: "Negocio no disponible" });
    }

    res.json({
      negocio: { id: negocio.id, nombre: negocio.nombre, slug: negocio.slug },
      personalizacion: {
        logoUrl: negocio.logoUrl,
        colorPrimario: negocio.colorPrimario,
        colorSecundario: negocio.colorSecundario,
        dominioCustom: negocio.dominioCustom,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener personalización pública" });
  }
}
