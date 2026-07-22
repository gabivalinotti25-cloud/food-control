import prisma from "../prisma.js";


// Obtener menú del día
export async function obtenerMenuHoy(req, res) {

  try {

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);


    const menu = await prisma.menuDiario.findUnique({

      where: {
        fecha: hoy,
      },

      include: {

        productos: {

          include: {
            producto: true,
          },

        },

      },

    });


    res.json(menu);


  } catch (error) {

    console.error(error);

    res.status(500).json({

      error: "Error al obtener el menú",

    });

  }

}



// Copiar todos los productos fijos al menú de hoy
export async function copiarProductosFijos(req, res) {

  try {

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);



    let menu = await prisma.menuDiario.findUnique({

      where: {
        fecha: hoy,
      },

    });



    if (!menu) {

      menu = await prisma.menuDiario.create({

        data: {

          fecha: hoy,

        },

      });

    }



    // Borra el menú actual
    await prisma.menuDiarioDetalle.deleteMany({

      where: {

        menuId: menu.id,

      },

    });



    // Busca productos fijos activos
    const productos = await prisma.producto.findMany({

      where: {

        activo: true,

        esFijo: true,

      },

      orderBy: [

        {

          orden: "asc",

        },

        {

          nombre: "asc",

        },

      ],

    });



    // Los agrega al menú
    await prisma.menuDiarioDetalle.createMany({

      data: productos.map((producto) => ({

        menuId: menu.id,

        productoId: producto.id,

      })),

    });



    res.json({

      mensaje: "Menú generado correctamente",

    });



  } catch (error) {


    console.error(error);


    res.status(500).json({

      error: "Error al generar el menú",

    });


  }

}




// Agregar un producto manualmente al menú
export async function agregarProductoMenu(req, res) {


  try {


    const { productoId } = req.body;


    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);



    let menu = await prisma.menuDiario.findUnique({

      where: {

        fecha: hoy,

      },

    });



    if (!menu) {


      menu = await prisma.menuDiario.create({

        data: {

          fecha: hoy,

        },

      });


    }



    const existe = await prisma.menuDiarioDetalle.findFirst({

      where: {

        menuId: menu.id,

        productoId: Number(productoId),

      },

    });



    if (existe) {


      return res.json({

        mensaje: "Ese producto ya está en el menú.",

      });


    }



    await prisma.menuDiarioDetalle.create({

      data: {

        menuId: menu.id,

        productoId: Number(productoId),

      },

    });



    res.json({

      mensaje: "Producto agregado correctamente.",

    });



  } catch (error) {


    console.error(error);


    res.status(500).json({

      error: "Error al agregar producto",

    });


  }

}





// Eliminar un producto del menú de hoy
export async function eliminarProductoMenu(req, res) {


  try {


    const id = Number(req.params.id);



    await prisma.menuDiarioDetalle.delete({

      where: {

        id,

      },

    });



    res.json({

      mensaje: "Producto eliminado del menú",

    });



  } catch (error) {


    console.error(error);



    res.status(500).json({

      error: "Error al eliminar producto del menú",

    });


  }

}