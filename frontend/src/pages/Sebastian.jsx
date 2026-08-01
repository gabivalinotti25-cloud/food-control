import { useState, useEffect } from "react";
import api from "../services/api";

export default function Sebastian() {
  const [propuestas, setPropuestas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [editandoPropuesta, setEditandoPropuesta] = useState(null);
  const [datosCorregidos, setDatosCorregidos] = useState({});

  useEffect(() => {
    cargarPropuestas();
    const interval = setInterval(cargarPropuestas, 5000);
    return () => clearInterval(interval);
  }, []);

  async function cargarPropuestas() {
    try {
      const { data } = await api.get("/sebastian/propuestas");
      setPropuestas(data);
    } catch (error) {
      console.error("Error al cargar propuestas:", error);
    }
  }

  async function enviarMensaje() {
    if (!mensaje.trim()) return;

    try {
      const { data } = await api.post("/sebastian/mensaje", {
        mensaje,
        origen: "web",
      });
      setRespuesta(data);
      setMensaje("");
      cargarPropuestas();
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("Error al procesar mensaje con Sebastian");
    }
  }

  async function aprobarPropuesta(id) {
    try {
      await api.post(`/sebastian/propuestas/${id}/aprobar`, {
        corregirDatos: datosCorregidos[id] || null,
      });
      setEditandoPropuesta(null);
      setDatosCorregidos({});
      cargarPropuestas();
      alert("Propuesta ejecutada exitosamente");
    } catch (error) {
      console.error("Error al aprobar propuesta:", error);
      alert(error.response?.data?.error || "Error al ejecutar propuesta");
    }
  }

  async function rechazarPropuesta(id) {
    const motivo = prompt("Motivo del rechazo:");
    if (!motivo) return;

    try {
      await api.post(`/sebastian/propuestas/${id}/rechazar`, { motivo });
      cargarPropuestas();
      alert("Propuesta rechazada");
    } catch (error) {
      console.error("Error al rechazar propuesta:", error);
      alert("Error al rechazar propuesta");
    }
  }

  function iniciarEdicion(propuesta) {
    setEditandoPropuesta(propuesta.id);
    setDatosCorregidos({ ...propuesta.datos });
  }

  function cancelarEdicion() {
    setEditandoPropuesta(null);
    setDatosCorregidos({});
  }

  function actualizarDato(campo, valor) {
    setDatosCorregidos((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  const estadoColors = {
    PENDIENTE: "bg-amber-100 text-amber-900 border-amber-300",
    APROBADA: "bg-emerald-100 text-emerald-900 border-emerald-300",
    RECHAZADA: "bg-rose-100 text-rose-900 border-rose-300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header elegante */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <div className="text-6xl mb-2">🎩</div>
            <div className="absolute -top-2 -right-2 text-2xl">🌹</div>
          </div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2 tracking-wide">
            Sebastian Michaelis
          </h1>
          <p className="text-gray-400 italic font-serif">
            "I am simply one hell of a butler"
          </p>
          <div className="mt-3 text-gray-500 text-sm">
            Mayordomo Demoníaco • Phantomhive Estate
          </div>
        </div>

        {/* Chat con Sebastian */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">🤵</div>
            <h2 className="text-xl font-serif text-gray-200">
              Comunicación con Sebastian
            </h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && enviarMensaje()}
              placeholder="Yes, my lord. ¿Qué desea que haga?"
              className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-serif"
            />
            <button
              onClick={enviarMensaje}
              className="bg-gradient-to-r from-red-800 to-red-900 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-serif border border-red-700"
            >
              Ordenar
            </button>
          </div>

          {respuesta && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-xl">🎩</div>
                <h3 className="font-serif text-gray-200">Respuesta de Sebastian:</h3>
              </div>
              <p className="text-gray-300 italic font-serif">{respuesta.descripcion}</p>
              <div className="mt-3 text-sm text-gray-400 flex gap-4">
                <span><strong className="text-red-400">Acción:</strong> {respuesta.accion}</span>
                <span><strong className="text-red-400">Confianza:</strong> {(respuesta.confianza * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Lista de propuestas */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">📋</div>
            <h2 className="text-xl font-serif text-gray-200">
              Propuestas Pendientes de Aprobación
            </h2>
          </div>

          {propuestas.length === 0 ? (
            <p className="text-gray-500 text-center py-8 font-serif italic">
              No hay propuestas pendientes, my lord
            </p>
          ) : (
            <div className="space-y-4">
              {propuestas.map((propuesta) => (
                <div
                  key={propuesta.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-red-600 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded text-xs font-serif font-semibold border ${
                          estadoColors[propuesta.estado]
                        }`}
                      >
                        {propuesta.estado}
                      </span>
                      <span className="text-sm text-gray-500 font-serif">
                        {new Date(propuesta.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400 font-serif">
                      {propuesta.origen}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="font-serif text-gray-200 italic">
                      "{propuesta.mensajeOriginal}"
                    </p>
                    <p className="text-gray-400 mt-2 font-serif">{propuesta.descripcion}</p>
                  </div>

                  <div className="mb-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                    <p className="text-sm font-serif font-semibold text-gray-300 mb-1">Acción:</p>
                    <p className="text-sm text-gray-400">{propuesta.accion}</p>
                    <p className="text-sm font-serif font-semibold text-gray-300 mt-2 mb-1">Datos:</p>
                    <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto text-gray-400">
                      {JSON.stringify(
                        editandoPropuesta === propuesta.id
                          ? datosCorregidos
                          : propuesta.datos,
                        null,
                        2
                      )}
                    </pre>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-400 font-serif">Confianza:</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-700 to-red-600 h-2 rounded-full"
                        style={{ width: `${propuesta.confianza * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 font-serif">
                      {(propuesta.confianza * 100).toFixed(0)}%
                    </span>
                  </div>

                  {propuesta.estado === "PENDIENTE" && (
                    <div className="flex gap-2">
                      {editandoPropuesta === propuesta.id ? (
                        <>
                          <button
                            onClick={() => aprobarPropuesta(propuesta.id)}
                            className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white px-4 py-2 rounded hover:from-emerald-600 hover:to-emerald-700 transition-all font-serif border border-emerald-600"
                          >
                            ✓ Ejecutar con correcciones
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-all font-serif border border-gray-600"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => aprobarPropuesta(propuesta.id)}
                            className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white px-4 py-2 rounded hover:from-emerald-600 hover:to-emerald-700 transition-all font-serif border border-emerald-600"
                          >
                            ✓ Aprobar
                          </button>
                          <button
                            onClick={() => iniciarEdicion(propuesta)}
                            className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 rounded hover:from-amber-500 hover:to-amber-600 transition-all font-serif border border-amber-500"
                          >
                            ✏️ Corregir
                          </button>
                          <button
                            onClick={() => rechazarPropuesta(propuesta.id)}
                            className="bg-gradient-to-r from-rose-700 to-rose-800 text-white px-4 py-2 rounded hover:from-rose-600 hover:to-rose-700 transition-all font-serif border border-rose-600"
                          >
                            ✗ Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {propuesta.estado === "APROBADA" && propuesta.resultado && (
                    <div className="mt-3 p-3 bg-emerald-900/30 rounded border border-emerald-700">
                      <p className="text-sm font-serif font-semibold text-emerald-400">
                        ✓ Ejecutado exitosamente, my lord
                      </p>
                      <pre className="text-xs mt-1 text-emerald-300">
                        {JSON.stringify(propuesta.resultado, null, 2)}
                      </pre>
                    </div>
                  )}

                  {propuesta.estado === "RECHAZADA" && propuesta.motivoRechazo && (
                    <div className="mt-3 p-3 bg-rose-900/30 rounded border border-rose-700">
                      <p className="text-sm font-serif font-semibold text-rose-400">
                        ✗ Rechazado, my lord
                      </p>
                      <p className="text-sm text-rose-300 font-serif">
                        Motivo: {propuesta.motivoRechazo}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer elegante */}
        <div className="text-center mt-8 text-gray-600 font-serif text-sm">
          <p>Phantomhive Estate • London • 1888</p>
          <p className="mt-1 italic">"Yes, my lord"</p>
        </div>
      </div>
    </div>
  );
}
