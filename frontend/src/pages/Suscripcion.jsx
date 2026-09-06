import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

const METODOS_PAGO = [
  { value: "TARJETA", label: "Tarjeta" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "MERCADOPAGO", label: "MercadoPago" },
];

const ESTADO_FACTURA = {
  PENDIENTE: { label: "Pendiente", clase: "bg-yellow-100 text-yellow-800" },
  PAGADA: { label: "Pagada", clase: "bg-green-100 text-green-800" },
  VENCIDA: { label: "Vencida", clase: "bg-red-100 text-red-800" },
  ANULADA: { label: "Anulada", clase: "bg-gray-100 text-gray-600" },
};

export default function Suscripcion() {
  const [estado, setEstado] = useState(null);
  const [suscripcion, setSuscripcion] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [metodoPago, setMetodoPago] = useState("TRANSFERENCIA");
  const [procesando, setProcesando] = useState(false);
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esAdmin = usuario.rol === "ADMIN";

  useEffect(() => {
    cargarDatos();
    // Mostrar mensaje si fuimos redirigidos por límite de plan
    const upgradeMsg = sessionStorage.getItem("upgradeMensaje");
    if (upgradeMsg) {
      setError(upgradeMsg);
      sessionStorage.removeItem("upgradeMensaje");
    }
  }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [estadoRes, susRes, planesRes, facturasRes] = await Promise.all([
        api.get("/suscripciones/estado"),
        api.get("/suscripciones"),
        api.get("/negocios/planes"),
        api.get("/facturacion"),
      ]);
      setEstado(estadoRes.data);
      setSuscripcion(susRes.data.suscripcion);
      setPlanes(planesRes.data);
      setFacturas(facturasRes.data);
    } catch (err) {
      setError("Error al cargar datos de suscripción");
    } finally {
      setLoading(false);
    }
  }

  async function cambiarPlan(plan) {
    if (!esAdmin) return;
    setProcesando(true);
    setError("");
    try {
      await api.post("/suscripciones", { plan, metodoPago });
      setMensaje(`Plan cambiado a ${plan} exitosamente`);
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar de plan");
    } finally {
      setProcesando(false);
    }
  }

  async function cancelar() {
    setProcesando(true);
    try {
      await api.post("/suscripciones/cancelar");
      setMensaje("Suscripción cancelada. Volviste al plan gratuito.");
      setConfirmarCancelar(false);
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cancelar");
    } finally {
      setProcesando(false);
    }
  }

  async function pagarFactura(id) {
    try {
      await api.post(`/facturacion/${id}/pagar`, { metodoPago });
      setMensaje("Factura marcada como pagada");
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al pagar factura");
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <p className="text-gray-500">Cargando suscripción...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Suscripción y Facturación</h1>
          <p className="text-gray-500">Gestioná tu plan y revisá tus facturas</p>
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

        {/* Estado actual */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Estado actual</h2>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="text-xl font-bold text-blue-600">{estado?.plan || "GRATIS"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado del negocio</p>
              <p className="text-xl font-bold">{estado?.estado || "ACTIVO"}</p>
            </div>
            {estado?.enTrial && (
              <div>
                <p className="text-sm text-gray-500">Período de prueba</p>
                <p className="text-xl font-bold text-orange-600">
                  {estado.diasTrialRestantes} días restantes
                </p>
              </div>
            )}
            {suscripcion?.fechaVencimiento && (
              <div>
                <p className="text-sm text-gray-500">Próximo vencimiento</p>
                <p className="text-xl font-bold">
                  {new Date(suscripcion.fechaVencimiento).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {esAdmin && estado?.plan !== "GRATIS" && (
            <div className="mt-4">
              {!confirmarCancelar ? (
                <button
                  onClick={() => setConfirmarCancelar(true)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Cancelar suscripción
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">¿Confirmar cancelación?</span>
                  <button
                    onClick={cancelar}
                    disabled={procesando}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                  >
                    Sí, cancelar
                  </button>
                  <button
                    onClick={() => setConfirmarCancelar(false)}
                    className="text-gray-600 text-sm"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Planes */}
        {esAdmin && (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Cambiar de plan</h2>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                {METODOS_PAGO.map((m) => (
                  <option key={m.value} value={m.value}>
                    Pago: {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {planes.map((plan) => {
                const esActual = estado?.plan === plan.codigo;
                return (
                  <div
                    key={plan.codigo}
                    className={`bg-white rounded-xl shadow p-5 flex flex-col ${
                      esActual ? "ring-2 ring-blue-600" : ""
                    }`}
                  >
                    <h3 className="font-bold text-gray-800">{plan.nombre}</h3>
                    <p className="text-2xl font-bold text-blue-600 my-2">
                      {plan.precio === 0 ? "Gratis" : `$${plan.precio}/mes`}
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 flex-1 mb-4">
                      {plan.caracteristicas.slice(0, 4).map((c) => (
                        <li key={c}>• {c}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => cambiarPlan(plan.codigo)}
                      disabled={esActual || procesando}
                      className={`w-full py-2 rounded-lg text-sm font-medium ${
                        esActual
                          ? "bg-gray-200 text-gray-500 cursor-default"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {esActual ? "Plan actual" : "Elegir"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Facturas */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Facturas</h2>
          {facturas.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay facturas todavía.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Número</th>
                  <th className="pb-2">Concepto</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Vencimiento</th>
                  <th className="pb-2">Estado</th>
                  {esAdmin && <th className="pb-2"></th>}
                </tr>
              </thead>
              <tbody>
                {facturas.map((f) => {
                  const est = ESTADO_FACTURA[f.estado] || ESTADO_FACTURA.PENDIENTE;
                  return (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="py-2 font-mono">{f.numero}</td>
                      <td className="py-2">{f.concepto}</td>
                      <td className="py-2">${f.total.toLocaleString()}</td>
                      <td className="py-2">
                        {new Date(f.fechaVencimiento).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${est.clase}`}>
                          {est.label}
                        </span>
                      </td>
                      {esAdmin && (
                        <td className="py-2 text-right">
                          {f.estado === "PENDIENTE" && (
                            <button
                              onClick={() => pagarFactura(f.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Marcar pagada
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
