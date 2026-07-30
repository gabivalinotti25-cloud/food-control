import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";
import { formatoGs } from "../utils/format";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    observacion: "",
  });
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    const { data } = await api.get("/clientes");
    setClientes(Array.isArray(data) ? data : []);
  }

  async function guardarCliente(e) {
    e.preventDefault();
    await api.post("/clientes", form);
    setForm({ nombre: "", telefono: "", direccion: "", observacion: "" });
    cargarClientes();
  }

  async function eliminarCliente(id) {
    if (!confirm("⚠️ ATENCIÓN: Esto eliminará el cliente y TODOS sus registros asociados (pedidos, pagos, movimientos de cuenta). ¿Estás seguro de que quieres continuar?")) return;
    try {
      await api.delete(`/clientes/${id}`);
      cargarClientes();
    } catch (error) {
      alert(error.response?.data?.error || "Error al eliminar cliente");
    }
  }

  const filtrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.telefono.includes(busqueda)
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 mt-1">Directorio de clientes del negocio</p>
        </div>

        <form onSubmit={guardarCliente} className="fc-card p-5">
          <h2 className="font-bold mb-4">Nuevo cliente</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="fc-label">Nombre</label>
              <input
                className="fc-input"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="fc-label">Teléfono</label>
              <input
                className="fc-input"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="fc-label">Dirección</label>
              <input
                className="fc-input"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              />
            </div>
            <div>
              <label className="fc-label">Observación</label>
              <input
                className="fc-input"
                value={form.observacion}
                onChange={(e) => setForm({ ...form, observacion: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="fc-btn fc-btn-primary mt-4">
            Guardar cliente
          </button>
        </form>

        <div className="fc-card overflow-hidden">
          <div className="px-5 py-4 border-b flex justify-between items-center gap-4">
            <h2 className="font-bold">{filtrados.length} clientes</h2>
            <input
              className="fc-input max-w-xs"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b bg-slate-50">
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="px-5 py-3 font-semibold">Teléfono</th>
                <th className="px-5 py-3 font-semibold">Dirección</th>
                <th className="px-5 py-3 font-semibold text-right">Saldo</th>
                <th className="px-5 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium">{c.nombre}</td>
                  <td className="px-5 py-3 text-slate-600">{c.telefono}</td>
                  <td className="px-5 py-3 text-slate-600">{c.direccion || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {c.saldo > 0 ? (
                      <span className="font-bold text-red-600">Gs. {formatoGs(c.saldo)}</span>
                    ) : (
                      <span className="text-emerald-600">Al día</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => eliminarCliente(c.id)}
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
      </div>
    </MainLayout>
  );
}
