import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";
import { formatoGs } from "../utils/format";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [esFijo, setEsFijo] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editandoProducto, setEditandoProducto] = useState({
    nombre: "",
    precio: "",
    esFijo: false,
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
    await api.post("/productos", { nombre, precio, esFijo });
    setNombre("");
    setPrecio("");
    setEsFijo(false);
    setMostrarFormulario(false);
    cargarProductos();
  }

  function iniciarEdicion(producto) {
    setEditandoId(producto.id);
    setEditandoProducto({
      nombre: producto.nombre,
      precio: producto.precio,
      esFijo: producto.esFijo,
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

  async function eliminarProducto(id) {
    if (!confirm("⚠️ ATENCIÓN: Esto eliminará el producto y TODAS sus referencias (menús, detalles de pedidos). ¿Estás seguro de que quieres continuar?")) return;
    try {
      await api.delete(`/productos/${id}`);
      cargarProductos();
    } catch (error) {
      alert(error.response?.data?.error || "Error al eliminar producto");
    }
  }

  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const fijos = filtrados.filter((p) => p.esFijo);
  const variables = filtrados.filter((p) => !p.esFijo && !p.esLibre);
  const libres = filtrados.filter((p) => p.esLibre);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Catálogo de productos</h1>
            <p className="text-slate-500 mt-1">
              Platos fijos (van al menú diario automáticamente) y platos variables
            </p>
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="fc-btn fc-btn-primary"
          >
            + Nuevo producto
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={guardarProducto} className="fc-card p-5">
            <h2 className="font-bold mb-4">Nuevo producto</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="fc-label">Nombre</label>
                <input className="fc-input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div>
                <label className="fc-label">Precio (Gs.)</label>
                <input className="fc-input" type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={esFijo} onChange={(e) => setEsFijo(e.target.checked)} />
                  <span className="text-sm font-medium">Plato fijo (menú diario)</span>
                </label>
              </div>
            </div>
            <button type="submit" className="fc-btn fc-btn-primary mt-4">Guardar</button>
          </form>
        )}

        <input
          className="fc-input max-w-md"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {[{ title: "Platos fijos", items: fijos }, { title: "Platos variables", items: variables }, { title: "Montos libres", items: libres }].map(
          (grupo) =>
            grupo.items.length > 0 && (
              <div key={grupo.title} className="fc-card overflow-hidden">
                <div className="px-5 py-3 border-b bg-slate-50 font-semibold">{grupo.title}</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b">
                      <th className="px-5 py-2">Producto</th>
                      <th className="px-5 py-2">Precio</th>
                      <th className="px-5 py-2">Estado</th>
                      <th className="px-5 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.items.map((producto) => (
                      <tr key={producto.id} className="border-b border-slate-50">
                        <td className="px-5 py-3">
                          {editandoId === producto.id ? (
                            <input
                              className="fc-input"
                              value={editandoProducto.nombre}
                              onChange={(e) =>
                                setEditandoProducto({ ...editandoProducto, nombre: e.target.value })
                              }
                            />
                          ) : (
                            producto.nombre
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {editandoId === producto.id ? (
                            <input
                              type="number"
                              className="fc-input w-28"
                              value={editandoProducto.precio}
                              onChange={(e) =>
                                setEditandoProducto({ ...editandoProducto, precio: e.target.value })
                              }
                            />
                          ) : (
                            `Gs. ${formatoGs(producto.precio)}`
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {producto.activo ? (
                            <span className="fc-badge fc-badge-green">Activo</span>
                          ) : (
                            <span className="fc-badge fc-badge-red">Inactivo</span>
                          )}
                        </td>
                        <td className="px-5 py-3 flex gap-2">
                          {editandoId === producto.id ? (
                            <button onClick={guardarEdicion} className="fc-btn fc-btn-primary text-xs">
                              Guardar
                            </button>
                          ) : (
                            <button onClick={() => iniciarEdicion(producto)} className="fc-btn fc-btn-secondary text-xs">
                              Editar
                            </button>
                          )}
                          <button
                            onClick={() => cambiarEstado(producto.id)}
                            className="fc-btn fc-btn-danger text-xs"
                          >
                            {producto.activo ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            onClick={() => eliminarProducto(producto.id)}
                            className="fc-btn fc-btn-danger text-xs"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        )}
      </div>
    </MainLayout>
  );
}
