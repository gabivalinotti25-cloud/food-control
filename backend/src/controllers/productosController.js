import prisma from "../prisma.js";

// Listar productos
export async function listarProductos(req, res) {
  try {
    const negocioId = req.negocioId;

    const productos = await prisma.producto.findMany({
      where: { negocioId },
      orderBy: [
        { orden: "asc" },
        { nombre: "asc" }
      ]
    });

    res.json(productos);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al listar productos"
    });
  }
}

// Crear producto
export async function crearProducto(req, res) {
  try {
    const negocioId = req.negocioId;

    const {
      nombre,
      precio,
      esLibre = false
    } = req.body;

    const producto = await prisma.producto.create({
      data: {
        nombre,
        precio: Number(precio),
        esLibre,
        negocioId
      }
    });

    res.status(201).json(producto);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al crear producto"
    });
  }
}

// Editar producto
export async function editarProducto(req, res) {

  try {
    const negocioId = req.negocioId;
    const id = Number(req.params.id);

    const {
      nombre,
      precio
    } = req.body;

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        nombre,
        precio: Number(precio)
      }
    });

    res.json(producto);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al editar producto"
    });

  }

}

// Activar / desactivar
export async function cambiarEstadoProducto(req, res) {

  try {
    const negocioId = req.negocioId;
    const id = Number(req.params.id);

    const producto = await prisma.producto.findUnique({
      where: { id }
    });

    const actualizado = await prisma.producto.update({
      where: { id },
      data: {
        activo: !producto.activo
      }
    });

    res.json(actualizado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al actualizar producto"
    });

  }

}