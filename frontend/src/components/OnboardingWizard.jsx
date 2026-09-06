import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Mapa de paso → ruta de la app donde se realiza la acción
const RUTAS_PASOS = {
  0: "/configuracion",
  1: "/productos",
  2: "/productos",
  3: "/clientes",
  4: "/",
  5: "/sebastian",
  6: "/configuracion",
};

export default function OnboardingWizard({ onCerrar }) {
  const [estado, setEstado] = useState(null);
  const [pasos, setPasos] = useState([]);
  const [progreso, setProgreso] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarEstado();
  }, []);

  async function cargarEstado() {
    try {
      const res = await api.get("/onboarding/estado");
      setEstado(res.data.onboarding);
      setPasos(res.data.pasos);
      setProgreso(res.data.progreso);
    } catch (err) {
      setError("No se pudo cargar el onboarding");
    } finally {
      setLoading(false);
    }
  }

  async function completarPaso(pasoId) {
    try {
      const res = await api.post("/onboarding/accion", { paso: pasoId });
      setEstado(res.data.onboarding);
      if (res.data.completado) {
        setProgreso(100);
      } else {
        await cargarEstado();
      }
    } catch (err) {
      setError("Error al marcar el paso");
    }
  }

  async function omitir() {
    try {
      await api.post("/onboarding/omitir");
      onCerrar?.();
    } catch (err) {
      setError("Error al omitir el onboarding");
    }
  }

  function irAPaso(pasoId) {
    const ruta = RUTAS_PASOS[pasoId];
    if (ruta) {
      onCerrar?.();
      navigate(ruta);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">Cargando...</div>
      </div>
    );
  }

  if (!estado || estado.estado === "COMPLETADO" || estado.estado === "OMITIDO") {
    return null;
  }

  const completados = new Set(estado.pasosCompletados || []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg my-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-2xl font-bold text-gray-800">¡Bienvenido! 👋</h3>
          <button
            onClick={omitir}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Omitir
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Completá estos pasos para configurar tu negocio:
        </p>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progreso}%` }}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <ul className="space-y-3">
          {pasos.map((paso) => {
            const completado = completados.has(paso.id);
            const esActual = paso.id === estado.pasoActual;
            return (
              <li
                key={paso.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  completado
                    ? "bg-green-50 border-green-200"
                    : esActual
                    ? "bg-blue-50 border-blue-300"
                    : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => !completado && completarPaso(paso.id)}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    completado
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 hover:border-blue-500"
                  }`}
                  title={completado ? "Completado" : "Marcar como completado"}
                >
                  {completado && "✓"}
                </button>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      completado ? "text-green-700 line-through" : "text-gray-800"
                    }`}
                  >
                    {paso.nombre}
                  </p>
                  <p className="text-sm text-gray-500">{paso.descripcion}</p>
                </div>
                {!completado && RUTAS_PASOS[paso.id] && (
                  <button
                    onClick={() => irAPaso(paso.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex-shrink-0"
                  >
                    Ir →
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {progreso === 100 && (
          <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">
            🎉 ¡Onboarding completado! Tu negocio está listo.
            <button
              onClick={onCerrar}
              className="block mx-auto mt-2 bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700"
            >
              Comenzar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
