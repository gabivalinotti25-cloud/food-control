import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

const API_URL = import.meta.env.VITE_API_URL;


export default function MenuHoy() {


  const [menu, setMenu] = useState(null);

  const [productos, setProductos] = useState([]);



  useEffect(() => {

    cargarMenu();

    cargarProductos();

  }, []);




  async function cargarMenu() {

    const res = await fetch(
      `${API_URL}/menu`
    );

    const data = await res.json();

    setMenu(data);

  }




  async function cargarProductos() {

    const res = await fetch(
      `${API_URL}/productos`
    );


    const data = await res.json();


    setProductos(data);

  }




  async function copiarMenu() {


    await fetch(
      `${API_URL}/menu/copiar`,
      {
        method: "POST"
      }
    );


    cargarMenu();

  }




  async function agregarProducto(id) {


    await fetch(
      `${API_URL}/menu/agregar`,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          productoId: id
        })

      }
    );


    cargarMenu();

  }




  async function eliminarProducto(id) {


    await fetch(
      `${API_URL}/menu/producto/${id}`,
      {
        method: "DELETE"
      }
    );


    cargarMenu();

  }





  return (

    <MainLayout>


      <div className="flex justify-between items-center mb-6">


        <h1 className="text-3xl font-bold">
          Menú de hoy
        </h1>



        <button

          onClick={copiarMenu}

          className="bg-blue-600 text-white px-4 py-2 rounded-lg"

        >

          Copiar productos fijos

        </button>


      </div>





      <div className="bg-white rounded-xl shadow p-6">



        <h2 className="text-xl font-bold mb-4">

          Productos del menú

        </h2>





        {

          menu?.productos?.length === 0 && (

            <p className="text-gray-500">

              No hay productos cargados.

            </p>

          )

        }





        <div className="space-y-3">


          {

            menu?.productos?.map(item => (


              <div

                key={item.id}

                className="border rounded-lg p-3 flex justify-between items-center"

              >



                <div>


                  <p className="font-semibold">

                    {item.producto.nombre}

                  </p>



                  <p>

                    Gs. {item.producto.precio.toLocaleString("es-PY")}

                  </p>


                </div>




                <button

                  onClick={() =>
                    eliminarProducto(item.id)
                  }

                  className="bg-red-500 text-white px-3 py-1 rounded"

                >

                  ❌

                </button>



              </div>


            ))

          }


        </div>



      </div>







      <div className="bg-white rounded-xl shadow p-6 mt-6">



        <h2 className="text-xl font-bold mb-4">

          Agregar productos al menú

        </h2>





        <div className="grid grid-cols-2 gap-3">


          {


            productos

            .filter(producto =>

              !menu?.productos?.some(

                item => item.producto.id === producto.id

              )

            )


            .map(producto => (


              <div

                key={producto.id}

                className="border rounded-lg p-3 flex justify-between items-center"

              >



                <div>


                  <p className="font-semibold">

                    {producto.nombre}

                  </p>



                  <p className="text-sm">

                    Gs. {producto.precio.toLocaleString("es-PY")}

                  </p>


                </div>




                <button

                  onClick={() =>
                    agregarProducto(producto.id)
                  }

                  className="bg-green-600 text-white px-3 py-1 rounded"

                >

                  +

                </button>



              </div>


            ))


          }


        </div>



      </div>




    </MainLayout>

  );

}
