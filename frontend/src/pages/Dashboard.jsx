import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

import api from "../services/api";

import StatCard from "../components/dashboard/StatCard";
import RecentOrders from "../components/dashboard/RecentOrders";


export default function Dashboard() {

  const [datos, setDatos] = useState({
    ventasHoy: 0,
    ventasTotales: 0,
    pedidosPendientes: 0,
    clientesConDeuda: 0,
    montoAdeudado: 0,
    ultimosPedidos: [],
  });


  const [deudas, setDeudas] = useState([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    cargarDashboard();
  }, []);



  async function cargarDashboard() {

    try {

      const [
        dashboardResponse,
        deudasResponse
      ] = await Promise.all([

        api.get("/dashboard"),

        api.get("/deudas")

      ]);


      setDatos(dashboardResponse.data);

      setDeudas(deudasResponse.data);


    } catch (error) {

      console.error(
        "Error cargando dashboard:",
        error
      );

    } finally {

      setLoading(false);

    }

  }



  const formatoGs = (valor) => {

    return new Intl.NumberFormat(
      "es-PY"
    ).format(valor || 0);

  };



  if (loading) {

    return (

      <MainLayout>

        <div className="flex justify-center items-center h-64">

          <p className="text-gray-500">
            Cargando dashboard...
          </p>

        </div>

      </MainLayout>

    );

  }



  return (

    <MainLayout>


      <div className="mb-8">

        <h1 className="text-3xl font-bold">

          Dashboard

        </h1>


        <p className="text-gray-500 mt-2">

          Resumen general del negocio

        </p>

      </div>



      {/* TARJETAS PRINCIPALES */}

      <div className="
        grid 
        grid-cols-1 
        md:grid-cols-2 
        xl:grid-cols-4 
        gap-5 
        mb-8
      ">


        <StatCard

          title="Ventas hoy"

          value={`Gs. ${formatoGs(datos.ventasHoy)}`}

          icon="💰"

          color="green"

        />



        <StatCard

          title="Ventas totales"

          value={`Gs. ${formatoGs(datos.ventasTotales)}`}

          icon="📈"

          color="blue"

        />



        <StatCard

          title="Pedidos pendientes"

          value={datos.pedidosPendientes}

          icon="📦"

          color="orange"

        />



        <StatCard

          title="Clientes con deuda"

          value={datos.clientesConDeuda}

          icon="👥"

          color="red"

        />


      </div>




      {/* CONTENIDO PRINCIPAL */}

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-6
      ">



        <RecentOrders

          pedidos={datos.ultimosPedidos}

        />




        <div className="
          bg-white
          rounded-xl
          shadow
        ">


          <div className="
            border-b
            px-6
            py-4
          ">

            <h2 className="
              text-xl
              font-semibold
            ">

              Clientes con deuda

            </h2>


          </div>




          <table className="w-full">


            <thead className="bg-gray-100">


              <tr>


                <th className="p-3 text-left">

                  Cliente

                </th>


                <th className="p-3 text-left">

                  Monto

                </th>


                <th className="p-3 text-left">

                  Fecha

                </th>


              </tr>


            </thead>




            <tbody>


              {
                deudas.length === 0 ? (

                  <tr>

                    <td
                      colSpan="3"
                      className="
                        text-center
                        p-6
                        text-gray-500
                      "
                    >

                      No existen clientes con deuda.

                    </td>

                  </tr>


                ) : (


                  deudas.map((pedido) => (


                    <tr

                      key={pedido.id}

                      className="
                        border-t
                        hover:bg-gray-50
                      "

                    >


                      <td className="p-3">

                        {pedido.cliente?.nombre}

                      </td>



                      <td className="
                        p-3
                        font-semibold
                        text-red-600
                      ">

                        Gs. {formatoGs(pedido.total)}

                      </td>



                      <td className="p-3">

                        {
                          new Date(
                            pedido.fecha
                          ).toLocaleDateString("es-PY")
                        }

                      </td>



                    </tr>


                  ))


                )

              }


            </tbody>



          </table>



        </div>



      </div>


    </MainLayout>

  );

}