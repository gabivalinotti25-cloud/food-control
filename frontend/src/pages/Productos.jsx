import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

export default function Productos() {

  const [productos, setProductos] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [editandoId, setEditandoId] = useState(null);

  const [editandoProducto, setEditandoProducto] = useState({
    nombre: "",
    precio: ""
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {

    const { data } = await api.get("/productos");

    setProductos(Array.isArray(data) ? data : []);

  }

  async function guardarProducto(e) {

    e.preventDefault();

    await api.post("/productos", {
      nombre,
      precio
    });

    setNombre("");
    setPrecio("");

    setMostrarFormulario(false);

    cargarProductos();

  }

  function iniciarEdicion(producto) {

    setEditandoId(producto.id);

    setEditandoProducto({
      nombre: producto.nombre,
      precio: producto.precio
    });

  }

  async function guardarEdicion() {

    await api.put(`/productos/${editandoId}`, editandoProducto);

    setEditandoId(null);

    cargarProductos();

  }

  async function cambiarEstado(id) {

    await api.patch(`/productos/${id}/estado`);

    cargarProductos();

  }

  return (

    <MainLayout>

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Productos
        </h1>

        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          + Nuevo producto
        </button>

      </div>

      {mostrarFormulario && (

        <form
          onSubmit={guardarProducto}
          className="bg-white rounded-xl shadow p-6 mb-6"
        >

          <h2 className="text-xl font-bold mb-4">
            Nuevo producto
          </h2>

          <input
            className="border rounded-lg p-2 w-full mb-3"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            className="border rounded-lg p-2 w-full mb-4"
            placeholder="Precio"
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Guardar
          </button>

        </form>

      )}

      <div className="mb-4">

        <input
          className="border rounded-lg p-2 w-full"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">
                Producto
              </th>

              <th className="p-3 text-left">
                Precio
              </th>

              <th className="p-3 text-left">
                Estado
              </th>

              <th className="p-3 text-left">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {
              productos

                .filter(producto =>
                  producto.nombre
                    .toLowerCase()
                    .includes(busqueda.toLowerCase())
                )

                .map(producto => (

                  <tr
                    key={producto.id}
                    className="border-t"
                  >

                    <td className="p-3">

                      {
                        editandoId === producto.id ?

                          <input
                            className="border rounded p-2 w-full"
                            value={editandoProducto.nombre}
                            onChange={(e) =>
                              setEditandoProducto({
                                ...editandoProducto,
                                nombre: e.target.value
                              })
                            }
                          />

                          :

                          producto.nombre
                      }

                    </td>

                    <td className="p-3">

                      {
                        editandoId === producto.id ?

                          <input
                            type="number"
                            className="border rounded p-2 w-32"
                            value={editandoProducto.precio}
                            onChange={(e) =>
                              setEditandoProducto({
                                ...editandoProducto,
                                precio: e.target.value
                              })
                            }
                          />

                          :

                          `Gs. ${producto.precio.toLocaleString("es-PY")}`
                      }

                    </td>

                    <td className="p-3">

                      {
                        producto.activo ?

                          <span className="text-green-600 font-semibold">
                            Activo
                          </span>

                          :

                          <span className="text-red-600 font-semibold">
                            Inactivo
                          </span>
                      }

                    </td>

                    <td className="p-3 flex gap-2">

                      {
                        editandoId === producto.id ?

                          <button
                            onClick={guardarEdicion}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                          >
                            Guardar
                          </button>

                          :

                          <button
                            onClick={() => iniciarEdicion(producto)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                          >
                            Editar
                          </button>

                      }

                      <button
                        onClick={() => cambiarEstado(producto.id)}
                        className={
                          producto.activo
                            ? "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                            : "bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        }
                      >
                        {
                          producto.activo
                            ? "Desactivar"
                            : "Activar"
                        }
                      </button>

                    </td>

                  </tr>

                ))
            }

          </tbody>

        </table>

      </div>

    </MainLayout>

  );

}
