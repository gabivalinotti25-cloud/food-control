import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

export default function Calendario() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarPedidosPorFecha(fechaSeleccionada);
  }, [fechaSeleccionada]);

  async function cargarPedidosPorFecha(fecha) {
    setLoading(true);
    try {
      const response = await api.get("/pedidos");
      // Filtrar pedidos por la fecha seleccionada
      const pedidosFiltrados = response.data.filter((pedido) => {
        const fechaPedido = new Date(pedido.fecha).toISOString().split("T")[0];
        return fechaPedido === fecha;
      });
      setPedidos(pedidosFiltrados);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatoGs = (valor) => {
    return new Intl.NumberFormat("es-PY").format(valor || 0);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendario de Pedidos</h1>
        <p className="text-gray-500 mt-2">Consulta pedidos por fecha específica</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <label className="block mb-2 font-semibold text-gray-700">
          Seleccionar día
        </label>
        <input
          type="date"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full md:w-64 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          Pedidos del {new Date(fechaSeleccionada).toLocaleDateString("es-PY")}
        </h2>

        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : pedidos.length === 0 ? (
          <p className="text-gray-500">No hay pedidos para esta fecha</p>
        ) : (
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-gray-800">
                    {pedido.cliente?.nombre || "Cliente"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {pedido.detalles?.length > 0
                      ? pedido.detalles.map((d) => d.producto?.nombre).join(", ")
                      : "Sin detalles"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(pedido.fecha).toLocaleTimeString("es-PY", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="font-bold text-green-600">
                  Gs. {formatoGs(pedido.total)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}