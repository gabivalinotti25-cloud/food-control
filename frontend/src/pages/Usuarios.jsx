import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

const ROLES = ["ADMIN", "EMPLEADO"];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState(null);
  const [formEdicion, setFormEdicion] = useState({ nombre: "", rol: "", activo: true });

  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    setLoading(true);
    try {
      const res = await api.get("/auth/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  function iniciarEdicion(u) {
    setEditando(u.id);
    setFormEdicion({ nombre: u.nombre, rol: u.rol, activo: u.activo });
    setError("");
    setMensaje("");
  }

  async function guardarEdicion(id) {
    try {
      await api.put(`/auth/usuarios/${id}`, formEdicion);
      setMensaje("Usuario actualizado");
      setEditando(null);
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar usuario");
    }
  }

  async function toggleActivo(u) {
    try {
      await api.put(`/auth/usuarios/${u.id}`, { activo: !u.activo });
      setMensaje(`Usuario ${u.activo ? "desactivado" : "activado"}`);
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar estado");
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-500">Gestión de usuarios de tu negocio</p>
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

        <div className="bg-white rounded-xl shadow p-6">
          {loading ? (
            <p className="text-gray-500">Cargando usuarios...</p>
          ) : usuarios.length === 0 ? (
            <p className="text-gray-500">No hay usuarios registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Nombre</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Rol</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Registrado</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    {editando === u.id ? (
                      <>
                        <td className="py-2">
                          <input
                            value={formEdicion.nombre}
                            onChange={(e) =>
                              setFormEdicion({ ...formEdicion, nombre: e.target.value })
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                          />
                        </td>
                        <td className="py-2 text-gray-500">{u.email}</td>
                        <td className="py-2">
                          <select
                            value={formEdicion.rol}
                            onChange={(e) =>
                              setFormEdicion({ ...formEdicion, rol: e.target.value })
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2">
                          <input
                            type="checkbox"
                            checked={formEdicion.activo}
                            onChange={(e) =>
                              setFormEdicion({ ...formEdicion, activo: e.target.checked })
                            }
                          />
                        </td>
                        <td className="py-2 text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2 text-right space-x-2">
                          <button
                            onClick={() => guardarEdicion(u.id)}
                            className="text-green-600 hover:text-green-800 text-xs font-medium"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditando(null)}
                            className="text-gray-500 text-xs"
                          >
                            Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 font-medium">{u.nombre}</td>
                        <td className="py-2 text-gray-600">{u.email}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              u.rol === "ADMIN"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {u.rol}
                          </span>
                        </td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              u.activo
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="py-2 text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2 text-right space-x-2">
                          <button
                            onClick={() => iniciarEdicion(u)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Editar
                          </button>
                          {u.id !== usuarioActual.id && (
                            <button
                              onClick={() => toggleActivo(u)}
                              className={`text-xs font-medium ${
                                u.activo
                                  ? "text-red-600 hover:text-red-800"
                                  : "text-green-600 hover:text-green-800"
                              }`}
                            >
                              {u.activo ? "Desactivar" : "Activar"}
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

        <p className="text-sm text-gray-500">
          Para agregar usuarios nuevos, compartí el enlace de registro:{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">/registro</code>
        </p>
      </div>
    </MainLayout>
  );
}
