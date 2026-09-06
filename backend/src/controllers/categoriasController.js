import prisma from "../prisma.js";

export async function listarCategorias(req, res) {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { negocioId: req.negocioId || 1 },
      orderBy: {
        nombre: "asc",
      },
    });

    res.json(categorias);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al listar categorías",
    });
  }
}

export async function crearCategoria(req, res) {
  try {
    const { nombre } = req.body;

    const categoria = await prisma.categoria.create({
      data: {
        nombre,
        negocioId: req.negocioId || 1,
      },
    });

    res.status(201).json(categoria);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al crear categoría",
    });
  }
}