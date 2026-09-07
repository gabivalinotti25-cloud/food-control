import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

const PLANES = ["GRATIS", "BASICO", "PRO", "ENTERPRISE"];
const ESTADOS = ["ACTIVO", "SUSPENDIDO", "CANCELADO"];

const badgePlan = {
  GRATIS: "bg-gray-100 text-gray-700",
  BASICO: "bg-blue-100 text-blue-800",
  PRO: "bg-purple-100 text-purple-800",
  ENTERPRISE: "bg-amber-100 text-amber-800",
};

const badgeEstado = {
  ACTIVO: "bg-green-100 text-green-800",
  SUSPENDIDO: "bg-yellow-100 text-yellow-800",
  CANCELADO: "bg-red-100 text-red-800",
};

export default function Negocios() {
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    cargarNegocios();
  }, []);

  async function cargarNegocios() {
    setLoading(true);
    try {
      const res = await api.get("/negocios/admin/todos");
      setNegocios(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar negocios");
    } finally {
      setLoading(false);
    }
  }

  function iniciarEdicion(n) {
    setEditando(n.id);
    setForm({
      plan: n.plan,
      estado: n.estado,
      maxUsuarios: n.maxUsuarios,
      maxClientes: n.maxClientes,
      maxPedidosMes: n.maxPedidosMes,
      maxSebastianMsg: n.maxSebastianMsg,
    });
    setError("");
    setMensaje("");
  }

  async function guardar(id) {
    try {
      await api.put(`/negocios/admin/${id}`, form);
      setMensaje("Negocio actualizado");
      setEditando(null);
      await cargarNegocios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar");
    }
  }

  async function cambiarEstado(n, estado) {
    try {
      await api.put(`/negocios/admin/${n.id}`, { estado });
      setMensaje(`Negocio "${n.nombre}" → ${estado}`);
      await cargarNegocios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar estado");
    }
  }

  const formatoGs = (v) => new Intl.NumberFormat("es-PY").format(v || 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Negocios</h1>
          <p className="text-gray-500">Panel de administración de la plataforma</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {mensaje && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {mensaje}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
          {loading ? (
            <p className="text-gray-500">Cargando negocios...</p>
          ) : negocios.length === 0 ? (
            <p className="text-gray-500">No hay negocios registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Negocio</th>
                  <th className="pb-2">Plan</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Uso</th>
                  <th className="pb-2">Facturas pendientes</th>
                  <th className="pb-2">Registrado</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {negocios.map((n) => (
                  <tr key={n.id} className="border-b last:border-0 align-top">
                    <td className="py-3">
                      <p className="font-medium">{n.nombre}</p>
                      <p className="text-xs text-gray-500">{n.email}</p>
                      <p className="text-xs text-gray-400">/{n.slug}</p>
                    </td>

                    {editando === n.id ? (
                      <>
                        <td className="py-3">
                          <select
                            value={form.plan}
                            onChange={(e) => setForm({ ...form, plan: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {PLANES.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          <select
                            value={form.estado}
                            onChange={(e) => setForm({ ...form, estado: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {ESTADOS.map((e) => (
                              <option key={e} value={e}>{e}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          <div className="space-y-1 text-xs">
                            <label className="flex items-center gap-1">
                              Usuarios:
                              <input type="number" value={form.maxUsuarios}
                                onChange={(e) => setForm({ ...form, maxUsuarios: e.target.value })}
                                className="w-20 px-1 border border-gray-300 rounded" />
                            </label>
                            <label className="flex items-center gap-1">
                              Clientes:
                              <input type="number" value={form.maxClientes}
                                onChange={(e) => setForm({ ...form, maxClientes: e.target.value })}
                                className="w-20 px-1 border border-gray-300 rounded" />
                            </label>
                            <label className="flex items-center gap-1">
                              Pedidos/mes:
                              <input type="number" value={form.maxPedidosMes}
                                onChange={(e) => setForm({ ...form, maxPedidosMes: e.target.value })}
                                className="w-20 px-1 border border-gray-300 rounded" />
                            </label>
                            <label className="flex items-center gap-1">
                              Sebastian/mes:
                              <input type="number" value={form.maxSebastianMsg}
                                onChange={(e) => setForm({ ...form, maxSebastianMsg: e.target.value })}
                                className="w-20 px-1 border border-gray-300 rounded" />
                            </label>
                          </div>
                        </td>
                        <td className="py-3 text-gray-500">—</td>
                        <td className="py-3 text-gray-500">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button onClick={() => guardar(n.id)}
                            className="text-green-600 hover:text-green-800 text-xs font-medium">
                            Guardar
                          </button>
                          <button onClick={() => setEditando(null)}
                            className="text-gray-500 text-xs">
                            Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${badgePlan[n.plan] || ""}`}>
                            {n.plan}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${badgeEstado[n.estado] || ""}`}>
                            {n.estado}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-600">
                          <p>{n._count.usuarios} usuarios</p>
                          <p>{n._count.clientes} clientes</p>
                          <p>{n._count.pedidos} pedidos</p>
                        </td>
                        <td className="py-3 text-xs">
                          {n.facturas.length === 0 ? (
                            <span className="text-green-600">Al día</span>
                          ) : (
                            <span className="text-red-600 font-medium">
                              {n.facturas.length} pendiente(s) · Gs.{" "}
                              {formatoGs(n.facturas.reduce((s, f) => s + f.total, 0))}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-gray-500">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button onClick={() => iniciarEdicion(n)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                            Editar
                          </button>
                          {n.estado === "ACTIVO" ? (
                            <button onClick={() => cambiarEstado(n, "SUSPENDIDO")}
                              className="text-yellow-600 hover:text-yellow-800 text-xs font-medium">
                              Suspender
                            </button>
                          ) : (
                            <button onClick={() => cambiarEstado(n, "ACTIVO")}
                              className="text-green-600 hover:text-green-800 text-xs font-medium">
                              Activar
                            </button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
