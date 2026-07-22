import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

export default function Caja() {
  const [caja, setCaja] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [montosReales, setMontosReales] = useState({
    montoEfectivoReal: 0,
    montoTransferenciaReal: 0,
    observacion: "",
  });

  useEffect(() => {
    cargarCajaHoy();
  }, []);

  async function cargarCajaHoy() {
    try {
      const [cajaResponse, resumenResponse] = await Promise.all([
        api.get("/caja/hoy"),
        api.get("/caja/resumen"),
      ]);
      setCaja(cajaResponse.data);
      setResumen(resumenResponse.data);
      if (cajaResponse.data) {
        setMontosReales({
          montoEfectivoReal: cajaResponse.data.montoEfectivoReal || 0,
          montoTransferenciaReal: cajaResponse.data.montoTransferenciaReal || 0,
          observacion: cajaResponse.data.observacion || "",
        });
      }
    } catch (error) {
      console.error("Error cargando caja:", error);
    } finally {
      setLoading(false);
    }
  }

  async function crearCaja() {
    try {
      await api.post("/caja");
      cargarCajaHoy();
    } catch (error) {
      console.error("Error creando caja:", error);
      alert("Error al crear caja");
    }
  }

  async function guardarMontosReales() {
    if (!caja) return;
    try {
      await api.put(`/caja/${caja.id}`, montosReales);
      cargarCajaHoy();
      setEditando(false);
      alert("Montos actualizados");
    } catch (error) {
      console.error("Error actualizando montos:", error);
      alert("Error al actualizar montos");
    }
  }

  async function cerrarCaja() {
    if (!caja) return;
    if (!confirm("¿Cerrar la caja de hoy?")) return;
    try {
      await api.patch(`/caja/${caja.id}/cerrar`);
      cargarCajaHoy();
      alert("Caja cerrada correctamente");
    } catch (error) {
      console.error("Error cerrando caja:", error);
      alert("Error al cerrar caja");
    }
  }

  const formatoGs = (valor) => {
    return new Intl.NumberFormat("es-PY").format(valor || 0);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Caja Diaria</h1>
        <p className="text-gray-500 mt-2">Control de efectivo y transferencias</p>
      </div>

      {!caja ? (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500 mb-4">No hay caja abierta para hoy</p>
          <button
            onClick={crearCaja}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Abrir Caja
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Estado de la caja */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Caja del {new Date(caja.fecha).toLocaleDateString("es-PY")}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  caja.cerrada
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {caja.cerrada ? "Cerrada" : "Abierta"}
              </span>
            </div>

            {resumen && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Ventas Efectivo</p>
                  <p className="text-xl font-bold text-green-600">
                    Gs. {formatoGs(resumen.totales.efectivoEsperado)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Ventas Transferencia</p>
                  <p className="text-xl font-bold text-blue-600">
                    Gs. {formatoGs(resumen.totales.transferenciaEsperada)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Pendiente de Cobro</p>
                  <p className="text-xl font-bold text-orange-600">
                    Gs. {formatoGs(resumen.totales.pendienteCobrar)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Total Esperado</p>
                  <p className="text-xl font-bold text-purple-600">
                    Gs. {formatoGs(resumen.totales.efectivoEsperado + resumen.totales.transferenciaEsperada)}
                  </p>
                </div>
              </div>
            )}

            {!caja.cerrada && (
              <div className="flex gap-3">
                {!editando && (
                  <button
                    onClick={() => setEditando(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Ingresar Montos Reales
                  </button>
                )}
                <button
                  onClick={cerrarCaja}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Cerrar Caja
                </button>
              </div>
            )}
          </div>

          {/* Formulario de montos reales */}
          {editando && !caja.cerrada && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Montos Reales</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Efectivo Real
                  </label>
                  <input
                    type="number"
                    value={montosReales.montoEfectivoReal}
                    onChange={(e) =>
                      setMontosReales({
                        ...montosReales,
                        montoEfectivoReal: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transferencia Real
                  </label>
                  <input
                    type="number"
                    value={montosReales.montoTransferenciaReal}
                    onChange={(e) =>
                      setMontosReales({
                        ...montosReales,
                        montoTransferenciaReal: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observación
                  </label>
                  <textarea
                    value={montosReales.observacion}
                    onChange={(e) =>
                      setMontosReales({
                        ...montosReales,
                        observacion: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Diferencias, observaciones..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={guardarMontosReales}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditando(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comparación */}
          {caja && (caja.montoEfectivoReal > 0 || caja.montoTransferenciaReal > 0) && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Comparación</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Efectivo</span>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Esperado: Gs. {formatoGs(caja.montoEfectivoEsperado)}
                    </p>
                    <p className="font-semibold">
                      Real: Gs. {formatoGs(caja.montoEfectivoReal)}
                    </p>
                    <p
                      className={`text-sm ${
                        caja.montoEfectivoReal >= caja.montoEfectivoEsperado
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      Diferencia: Gs. {formatoGs(caja.montoEfectivoReal - caja.montoEfectivoEsperado)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Transferencia</span>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Esperado: Gs. {formatoGs(caja.montoTransferenciaEsperado)}
                    </p>
                    <p className="font-semibold">
                      Real: Gs. {formatoGs(caja.montoTransferenciaReal)}
                    </p>
                    <p
                      className={`text-sm ${
                        caja.montoTransferenciaReal >= caja.montoTransferenciaEsperado
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      Diferencia: Gs. {formatoGs(caja.montoTransferenciaReal - caja.montoTransferenciaEsperado)}
                    </p>
                  </div>
                </div>
              </div>
              {caja.observacion && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Observación:</strong> {caja.observacion}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resumen de pedidos del día */}
          {resumen && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Resumen del Día</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">Total Pedidos</p>
                  <p className="text-xl font-bold">{resumen.pedidos.total}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">Ventas Anónimas</p>
                  <p className="text-xl font-bold">{resumen.ventasAnonimas.efectivo + resumen.ventasAnonimas.transferencia > 0 ? "Sí" : "No"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">Ingresos Totales</p>
                  <p className="text-xl font-bold text-green-600">
                    Gs. {formatoGs(resumen.totales.efectivoEsperado + resumen.totales.transferenciaEsperada)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}
