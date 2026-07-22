import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

export default function Estadisticas() {
  const [periodo, setPeriodo] = useState("hoy");
  const [estadisticas, setEstadisticas] = useState(null);
  const [generales, setGenerales] = useState(null);
  const [productosTop, setProductosTop] = useState([]);
  const [clientesTop, setClientesTop] = useState([]);
  const [tendencias, setTendencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  async function cargarDatos() {
    try {
      const [estResponse, genResponse, prodResponse, cliResponse, tendResponse] =
        await Promise.all([
          api.get(`/estadisticas/ventas?periodo=${periodo}`),
          api.get("/estadisticas/generales"),
          api.get(`/estadisticas/productos-mas-vendidos?periodo=${periodo}`),
          api.get(`/estadisticas/clientes-frecuentes?periodo=${periodo}`),
          api.get("/estadisticas/tendencias?dias=30"),
        ]);

      setEstadisticas(estResponse.data);
      setGenerales(genResponse.data);
      setProductosTop(prodResponse.data);
      setClientesTop(cliResponse.data);
      setTendencias(tendResponse.data);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatoGs = (valor) => {
    return new Intl.NumberFormat("es-PY").format(valor || 0);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Cargando estadísticas...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Estadísticas</h1>
        <p className="text-gray-500 mt-2">Análisis y reportes del negocio</p>
      </div>

      {/* Selector de periodo */}
      <div className="mb-6">
        <div className="flex gap-2">
          {["hoy", "semana", "mes", "anio"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-lg capitalize ${
                periodo === p
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas generales */}
      {generales && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Total Clientes</h3>
            <p className="text-2xl font-bold">{generales.totalClientes}</p>
            <p className="text-sm text-green-600">
              {generales.clientesActivos} activos este mes
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Total Productos</h3>
            <p className="text-2xl font-bold">{generales.totalProductos}</p>
            <p className="text-sm text-green-600">
              {generales.productosActivos} activos
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Total Pedidos</h3>
            <p className="text-2xl font-bold">{generales.totalPedidos}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Ventas Totales</h3>
            <p className="text-2xl font-bold text-green-600">
              Gs. {formatoGs(estadisticas?.totales?.ventasTotales || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Ventas por periodo */}
      {estadisticas && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Ventas por Método</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Efectivo</p>
                <p className="text-xl font-bold text-green-600">
                  Gs. {formatoGs(estadisticas.totales.efectivoTotal)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Transferencia</p>
                <p className="text-xl font-bold text-blue-600">
                  Gs. {formatoGs(estadisticas.totales.transferenciaTotal)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pendiente de Cobro</p>
                <p className="text-xl font-bold text-red-600">
                  Gs. {formatoGs(estadisticas.totales.pendienteCobrar)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Pedidos</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Total Pedidos</p>
                <p className="text-xl font-bold">{estadisticas.pedidos.total}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Monto Total Pedidos</p>
                <p className="text-xl font-bold">
                  Gs. {formatoGs(estadisticas.pedidos.totalMonto)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Ventas Anónimas</p>
                <p className="text-xl font-bold">
                  {estadisticas.ventasAnonimas.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Resumen</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">
                  Gs. {formatoGs(estadisticas.totales.ventasTotales)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Por Cobrar</p>
                <p className="text-xl font-bold text-orange-600">
                  Gs. {formatoGs(estadisticas.totales.pendienteCobrar)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Productos más vendidos */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
        <div className="space-y-3">
          {productosTop.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay datos disponibles
            </p>
          ) : (
            productosTop.map((item, index) => (
              <div
                key={item.producto.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{item.producto.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {item.cantidadTotal} vendidos
                    </p>
                  </div>
                </div>
                <p className="font-bold text-green-600">
                  Gs. {formatoGs(item.montoTotal)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clientes frecuentes */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Clientes Frecuentes</h3>
        <div className="space-y-3">
          {clientesTop.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay datos disponibles
            </p>
          ) : (
            clientesTop.map((item, index) => (
              <div
                key={item.cliente.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{item.cliente.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {item.cantidadPedidos} pedidos
                    </p>
                  </div>
                </div>
                <p className="font-bold text-blue-600">
                  Gs. {formatoGs(item.montoTotal)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tendencias */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tendencias de Ventas (30 días)</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tendencias.map((item) => (
            <div
              key={item.fecha}
              className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
            >
              <span className="text-sm text-gray-600">{item.fecha}</span>
              <div className="flex gap-4">
                <span className="text-sm">{item.pedidos} pedidos</span>
                <span className="font-semibold text-green-600">
                  Gs. {formatoGs(item.ventas)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
