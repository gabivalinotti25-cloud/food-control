import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

export default function HistorialSebastian() {
  const [historial, setHistorial] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroOrigen, setFiltroOrigen] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    cargarHistorial();
    cargarEstadisticas();
  }, [pagina, filtroOrigen]);

  async function cargarHistorial() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("pagina", pagina);
      if (filtroOrigen) params.append("origen", filtroOrigen);
      if (busqueda) params.append("buscar", busqueda);

      const { data } = await api.get(`/historial?${params}`);
      setHistorial(data.conversaciones);
      setTotalPaginas(data.totalPaginas);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setLoading(false);
    }
  }

  async function cargarEstadisticas() {
    try {
      const { data } = await api.get("/historial/estadisticas");
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  }

  async function handleBuscar(e) {
    e.preventDefault();
    setPagina(1);
    await cargarHistorial();
  }

  async function eliminarRegistro(id) {
    if (!confirm("¿Eliminar este registro del historial?")) return;
    
    try {
      await api.delete(`/historial/${id}`);
      await cargarHistorial();
      await cargarEstadisticas();
    } catch (error) {
      alert("Error al eliminar registro");
    }
  }

  const estadoBadge = (aprobado) => {
    if (aprobado === true) return "✅ Aprobado";
    if (aprobado === false) return "❌ Rechazado";
    return "⏳ Pendiente";
  };

  const estadoColor = (aprobado) => {
    if (aprobado === true) return "bg-green-100 text-green-800";
    if (aprobado === false) return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🎩 Historial de Sebastian</h1>
          <p className="text-slate-500 mt-1">
            Historial de conversaciones y aprendizaje de patrones
          </p>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="fc-card p-5 bg-blue-50 border-blue-100">
              <p className="text-xs font-semibold uppercase text-blue-600">Total conversaciones</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{estadisticas.total}</p>
            </div>
            <div className="fc-card p-5 bg-green-50 border-green-100">
              <p className="text-xs font-semibold uppercase text-green-600">Aprobadas</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{estadisticas.aprobados}</p>
            </div>
            <div className="fc-card p-5 bg-red-50 border-red-100">
              <p className="text-xs font-semibold uppercase text-red-600">Rechazadas</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{estadisticas.rechazados}</p>
            </div>
            <div className="fc-card p-5 bg-yellow-50 border-yellow-100">
              <p className="text-xs font-semibold uppercase text-yellow-700">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-800 mt-1">{estadisticas.pendientes}</p>
            </div>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="fc-card p-5">
          <form onSubmit={handleBuscar} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="fc-label">Buscar</label>
              <input
                type="text"
                className="fc-input"
                placeholder="Mensaje, respuesta o acción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div>
              <label className="fc-label">Origen</label>
              <select
                className="fc-input"
                value={filtroOrigen}
                onChange={(e) => setFiltroOrigen(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="WEB">Web</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </div>
            <button type="submit" className="fc-btn fc-btn-primary">
              🔍 Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                setFiltroOrigen("");
                setPagina(1);
              }}
              className="fc-btn fc-btn-secondary"
            >
              Limpiar
            </button>
          </form>
        </div>

        {/* Lista de conversaciones */}
        <div className="fc-card overflow-hidden">
          <div className="px-5 py-4 border-b bg-slate-50">
            <h2 className="font-bold text-slate-900">Conversaciones</h2>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Cargando...</p>
          ) : historial.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No hay conversaciones</p>
          ) : (
            <div className="divide-y">
              {historial.map((conv) => (
                <div key={conv.id} className="p-5 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${estadoColor(conv.aprobado)}`}>
                        {estadoBadge(conv.aprobado)}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {conv.origen}
                      </span>
                      {conv.confianza && (
                        <span className="text-xs text-slate-500">
                          Confianza: {(conv.confianza * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {new Date(conv.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => eliminarRegistro(conv.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">👤 Usuario:</p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{conv.mensajeUsuario}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">🤖 Sebastian:</p>
                      <p className="text-sm text-slate-700 bg-blue-50 p-2 rounded">{conv.respuestaIA}</p>
                    </div>

                    {conv.accionPropuesta && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">⚡ Acción propuesta:</p>
                        <p className="text-sm font-medium text-slate-900">{conv.accionPropuesta}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="px-5 py-4 border-t bg-slate-50 flex justify-center gap-2">
              <button
                onClick={() => setPagina(Math.max(1, pagina - 1))}
                disabled={pagina === 1}
                className="fc-btn fc-btn-secondary text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Página {pagina} de {totalPaginas}
              </span>
              <button
                onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                disabled={pagina === totalPaginas}
                className="fc-btn fc-btn-secondary text-sm disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
