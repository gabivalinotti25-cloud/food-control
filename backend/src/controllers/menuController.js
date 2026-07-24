import prisma from "../prisma.js";
import { parseFechaDia, fechaDiaExacta, hoyISO } from "../utils/fechas.js";

async function obtenerOCrearMenu(fechaStr) {
  const fecha = fechaDiaExacta(fechaStr || hoyISO());

  let menu = await prisma.menuDiario.findUnique({
    where: { fecha },
    include: {
      productos: {
        include: { producto: true },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!menu) {
    menu = await prisma.menuDiario.create({
      data: { fecha },
      include: {
        productos: { include: { producto: true } },
      },
    });
  }

  return menu;
}

export async function obtenerMenu(req, res) {
  try {
    const fecha = req.query.fecha || hoyISO();
    const menu = await obtenerOCrearMenu(fecha);
    res.json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el menú" });
  }
}

export async function copiarProductosFijos(req, res) {
  try {
    const fecha = req.body.fecha || req.query.fecha || hoyISO();
    const menu = await obtenerOCrearMenu(fecha);

    await prisma.menuDiarioDetalle.deleteMany({ where: { menuId: menu.id } });

    const productos = await prisma.producto.findMany({
      where: { activo: true, esFijo: true },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    });

    if (productos.length) {
      await prisma.menuDiarioDetalle.createMany({
        data: productos.map((p) => ({ menuId: menu.id, productoId: p.id })),
      });
    }

    const actualizado = await prisma.menuDiario.findUnique({
      where: { id: menu.id },
      include: { productos: { include: { producto: true } } },
    });

    res.json(actualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar el menú" });
  }
}

export async function agregarProductoMenu(req, res) {
  try {
    const { productoId, fecha } = req.body;
    const menu = await obtenerOCrearMenu(fecha || hoyISO());

    const existe = await prisma.menuDiarioDetalle.findFirst({
      where: { menuId: menu.id, productoId: Number(productoId) },
    });

    if (existe) {
      return res.status(400).json({ error: "Ese producto ya está en el menú" });
    }

    await prisma.menuDiarioDetalle.create({
      data: { menuId: menu.id, productoId: Number(productoId) },
    });

    res.json({ mensaje: "Producto agregado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar producto" });
  }
}

export async function agregarMontoLibreMenu(req, res) {
  try {
    const { nombre, precio, fecha } = req.body;
    const menu = await obtenerOCrearMenu(fecha || hoyISO());

    const producto = await prisma.producto.create({
      data: {
        nombre: nombre || "Monto libre",
        precio: Number(precio),
        esLibre: true,
        esFijo: false,
        esEspecial: false,
        activo: true,
      },
    });

    await prisma.menuDiarioDetalle.create({
      data: { menuId: menu.id, productoId: producto.id },
    });

    res.json({ mensaje: "Monto agregado al menú", producto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar monto libre" });
  }
}

export async function eliminarProductoMenu(req, res) {
  try {
    await prisma.menuDiarioDetalle.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: "Producto eliminado del menú" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar producto del menú" });
  }
}

export async function listarMenusMes(req, res) {
  try {
    const { mes, anio } = req.query;
    const y = Number(anio) || new Date().getFullYear();
    const m = Number(mes) || new Date().getMonth() + 1;
    const inicio = new Date(y, m - 1, 1);
    const fin = new Date(y, m, 1);

    const menus = await prisma.menuDiario.findMany({
      where: { fecha: { gte: inicio, lt: fin } },
      include: {
        productos: true,
        _count: { select: { productos: true } },
      },
    });

    const pedidosPorDia = await prisma.pedido.groupBy({
      by: ["fecha"],
      where: { fecha: { gte: inicio, lt: fin } },
      _count: true,
      _sum: { total: true },
    });

    res.json({ menus, pedidosPorDia });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar calendario" });
  }
}
