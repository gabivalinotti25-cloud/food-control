import prisma from "../prisma.js";

// Listar productos
export async function listarProductos(req, res) {
  try {
    const productos = await prisma.producto.findMany({
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

    const {
      nombre,
      precio,
      esLibre = false,
      esFijo = false,
      esEspecial = false,
    } = req.body;

    const producto = await prisma.producto.create({
      data: {
        nombre,
        precio: Number(precio),
        esLibre,
        esFijo,
        esEspecial,
      },
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

    const id = Number(req.params.id);

    const {
      nombre,
      precio,
      esFijo,
      esEspecial,
    } = req.body;

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        nombre,
        precio: Number(precio),
        ...(esFijo !== undefined && { esFijo }),
        ...(esEspecial !== undefined && { esEspecial }),
      },
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

// Eliminar producto
export async function eliminarProducto(req, res) {
  try {
    const id = Number(req.params.id);

    // Verificar si el producto existe
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        detallesPedido: true,
        menus: true,
        menusDiarios: true,
      },
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Eliminar de menús de plantilla
    await prisma.menuPlantillaDetalle.deleteMany({
      where: { productoId: id },
    });

    // Eliminar menús de plantilla vacíos
    await prisma.menuPlantilla.deleteMany({
      where: {
        productos: {
          none: {},
        },
      },
    });

    // Eliminar de menús diarios
    await prisma.menuDiarioDetalle.deleteMany({
      where: { productoId: id },
    });

    // Eliminar menús diarios vacíos
    await prisma.menuDiario.deleteMany({
      where: {
        productos: {
          none: {},
        },
      },
    });

    // Eliminar detalles de pedidos que contienen este producto
    await prisma.pedidoDetalle.deleteMany({
      where: { productoId: id },
    });

    // Eliminar producto
    await prisma.producto.delete({
      where: { id },
    });

    res.json({ mensaje: "Producto y todas sus referencias eliminadas correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al eliminar producto",
    });
  }
}