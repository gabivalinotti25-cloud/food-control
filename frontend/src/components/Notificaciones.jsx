import { useState, useEffect } from "react";
import api from "../services/api";

export default function Notificaciones({ onClose }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidasCount, setNoLeidasCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  async function cargarNotificaciones() {
    try {
      const { data } = await api.get("/notificaciones");
      setNotificaciones(data.notificaciones);
      setNoLeidasCount(data.noLeidasCount);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoLeida(id) {
    try {
      await api.patch(`/notificaciones/${id}/leer`);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setNoLeidasCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  }

  async function marcarTodasComoLeidas() {
    try {
      await api.patch("/notificaciones/todas/leer");
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidasCount(0);
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  }

  async function eliminarNotificacion(id) {
    try {
      await api.delete(`/notificaciones/${id}`);
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      if (!notificaciones.find((n) => n.id === id)?.leida) {
        setNoLeidasCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  }

  const tipoIconos = {
    SEBASTIAN_PROPUESTA: "🎩",
    DEUDA_ALTA: "💰",
    PEDIDO_PENDIENTE: "📦",
    GENERAL: "🔔",
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Cargando notificaciones...
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-900">Notificaciones</h3>
        <div className="flex gap-2">
          {noLeidasCount > 0 && (
            <button
              onClick={marcarTodasComoLeidas}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Marcar todas como leídas
            </button>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
      </div>

      {notificaciones.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No hay notificaciones
        </div>
      ) : (
        <div className="overflow-y-auto max-h-80">
          {notificaciones.map((notificacion) => (
            <div
              key={notificacion.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                !notificacion.leida ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {tipoIconos[notificacion.tipo] || tipoIconos.GENERAL}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {notificacion.titulo}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {notificacion.mensaje}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notificacion.createdAt).toLocaleString()}
                  </p>
                  {notificacion.link && (
                    <a
                      href={notificacion.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                    >
                      Ver detalles →
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {!notificacion.leida && (
                    <button
                      onClick={() => marcarComoLeida(notificacion.id)}
                      className="text-xs text-green-600 hover:text-green-800"
                      title="Marcar como leída"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => eliminarNotificacion(notificacion.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
