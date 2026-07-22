import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

export default function Configuracion() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  async function cargarEstadisticas() {
    try {
      const response = await api.get("/backup/estadisticas-sistema");
      setEstadisticas(response.data);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function exportarDatos() {
    try {
      const response = await api.get("/backup/exportar-todo");
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `food-control-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exportando datos:", error);
      alert("Error al exportar datos");
    }
  }

  async function exportarClientes() {
    try {
      const response = await api.get("/backup/exportar-clientes");
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clientes-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exportando clientes:", error);
      alert("Error al exportar clientes");
    }
  }

  async function exportarReporteDiario() {
    try {
      const response = await api.get("/backup/reporte-diario");
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-diario-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exportando reporte:", error);
      alert("Error al exportar reporte");
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
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-gray-500 mt-2">Administración del sistema</p>
      </div>

      {/* Estadísticas del sistema */}
      {estadisticas && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estadísticas del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Total Clientes</p>
              <p className="text-xl font-bold">{estadisticas.totalClientes}</p>
              <p className="text-sm text-orange-600">
                {estadisticas.clientesConDeuda} con deuda
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Total Productos</p>
              <p className="text-xl font-bold">{estadisticas.totalProductos}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Total Pedidos</p>
              <p className="text-xl font-bold">{estadisticas.totalPedidos}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Deuda Total</p>
              <p className="text-xl font-bold text-red-600">
                Gs. {formatoGs(estadisticas.totalDeuda)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exportación de datos */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Exportación de Datos</h2>
        <div className="space-y-3">
          <button
            onClick={exportarDatos}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <span>📦</span>
            <span>Exportar Todo (Backup Completo)</span>
          </button>
          <button
            onClick={exportarClientes}
            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <span>👥</span>
            <span>Exportar Clientes</span>
          </button>
          <button
            onClick={exportarReporteDiario}
            className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <span>📊</span>
            <span>Exportar Reporte Diario</span>
          </button>
        </div>
      </div>

      {/* Información del sistema */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Información del Sistema</h2>
        <div className="space-y-2 text-gray-600">
          <p><strong>Versión:</strong> 1.0.0</p>
          <p><strong>Base de datos:</strong> PostgreSQL</p>
          <p><strong>Última actualización:</strong> {new Date().toLocaleDateString("es-PY")}</p>
        </div>
      </div>
    </MainLayout>
  );
}
