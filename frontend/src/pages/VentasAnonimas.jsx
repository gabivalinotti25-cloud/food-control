import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

export default function VentasAnonimas() {
  const [ventas, setVentas] = useState([]);
  const [resumen, setResumen] = useState({
    totalEfectivo: 0,
    totalTransferencia: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    monto: "",
    descripcion: "",
    formaPago: "EFECTIVO",
  });

  useEffect(() => {
    cargarVentasHoy();
  }, []);

  async function cargarVentasHoy() {
    try {
      const response = await api.get("/ventas-anonimas/hoy");
      setVentas(response.data.ventas);
      setResumen({
        totalEfectivo: response.data.totalEfectivo,
        totalTransferencia: response.data.totalTransferencia,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Error cargando ventas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/ventas-anonimas", {
        monto: Number(formData.monto),
        descripcion: formData.descripcion,
        formaPago: formData.formaPago,
      });
      setFormData({ monto: "", descripcion: "", formaPago: "EFECTIVO" });
      cargarVentasHoy();
    } catch (error) {
      console.error("Error creando venta:", error);
      alert("Error al registrar venta");
    }
  }

  async function eliminarVenta(id) {
    if (!confirm("⚠️ ATENCIÓN: ¿Estás seguro de que quieres eliminar esta venta anónima?")) return;
    try {
      await api.delete(`/ventas-anonimas/${id}`);
      cargarVentasHoy();
    } catch (error) {
      console.error("Error eliminando venta:", error);
      alert("Error al eliminar venta");
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
        <h1 className="text-3xl font-bold">Ventas Anónimas</h1>
        <p className="text-gray-500 mt-2">
          Registro de montos sin cliente específico
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500 text-sm">Efectivo</h3>
          <p className="text-2xl font-bold text-green-600">
            Gs. {formatoGs(resumen.totalEfectivo)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500 text-sm">Transferencia</h3>
          <p className="text-2xl font-bold text-blue-600">
            Gs. {formatoGs(resumen.totalTransferencia)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500 text-sm">Total Hoy</h3>
          <p className="text-2xl font-bold text-purple-600">
            Gs. {formatoGs(resumen.total)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Nueva Venta Anónima</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto
              </label>
              <input
                type="number"
                value={formData.monto}
                onChange={(e) =>
                  setFormData({ ...formData, monto: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forma de Pago
              </label>
              <select
                value={formData.formaPago}
                onChange={(e) =>
                  setFormData({ ...formData, formaPago: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Venta mostrador"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Registrar Venta
            </button>
          </form>
        </div>

        {/* Lista de ventas */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ventas de Hoy</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {ventas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay ventas registradas hoy
              </p>
            ) : (
              ventas.map((venta) => (
                <div
                  key={venta.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      Gs. {formatoGs(venta.monto)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {venta.formaPago === "EFECTIVO" ? "💵 Efectivo" : "🏦 Transferencia"}
                      {venta.descripcion && ` - ${venta.descripcion}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(venta.fecha).toLocaleTimeString("es-PY", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => eliminarVenta(venta.id)}
                    className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
