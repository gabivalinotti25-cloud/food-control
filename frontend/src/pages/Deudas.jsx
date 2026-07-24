import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";
import { formatoGs, formatFechaCorta } from "../utils/format";
import { BadgePago } from "../components/CalendarStrip";

export default function Deudas() {
  const [resumen, setResumen] = useState(null);
  const [clienteSel, setClienteSel] = useState(null);
  const [cuenta, setCuenta] = useState(null);
  const [deudasPedidos, setDeudasPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [montoPago, setMontoPago] = useState("");
  const [formaPago, setFormaPago] = useState("EFECTIVO");

  useEffect(() => {
    cargarResumen();
  }, []);

  async function cargarResumen() {
    setLoading(true);
    try {
      const { data } = await api.get("/deudas/resumen");
      setResumen(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function verCliente(cliente) {
    setClienteSel(cliente);
    const [cuentaRes, deudasRes] = await Promise.all([
      api.get(`/cuenta/${cliente.id}`),
      api.get(`/deudas/cliente/${cliente.id}`),
    ]);
    setCuenta(cuentaRes.data);
    setDeudasPedidos(deudasRes.data || []);
    setMontoPago(String(cliente.saldo || ""));
  }

  async function registrarPago(e) {
    e.preventDefault();
    if (!clienteSel || !montoPago) return;

    try {
      await api.post("/pagos", {
        clienteId: clienteSel.id,
        monto: Number(montoPago),
        formaPago,
      });
      await cargarResumen();
      const { data } = await api.get(`/cuenta/${clienteSel.id}`);
      setCuenta(data);
      setClienteSel({ ...clienteSel, saldo: data.saldo });
      setMontoPago(data.saldo > 0 ? String(data.saldo) : "");
    } catch (e) {
      alert(e.response?.data?.error || "Error al registrar pago");
    }
  }

  async function marcarPedidoPagado(pedidoId, forma) {
    try {
      const pedido = deudasPedidos.find((p) => p.id === pedidoId);
      await api.post("/deudas/marcar-pagado", {
        pedidoId,
        formaPago: forma,
        monto: pedido?.total,
      });
      await cargarResumen();
      if (clienteSel) verCliente(clienteSel);
    } catch (e) {
      alert(e.response?.data?.error || "Error al marcar como pagado");
    }
  }

  const clientes = resumen?.clientes || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Control de deudas</h1>
          <p className="text-slate-500 mt-1">
            Lista ordenada de clientes que deben. Hacé clic para ver el detalle y registrar pagos.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="fc-card p-5 bg-red-50 border-red-100">
            <p className="text-xs font-semibold uppercase text-red-600">Total adeudado</p>
            <p className="text-3xl font-bold text-red-700 mt-1">
              Gs. {formatoGs(resumen?.totalDeuda)}
            </p>
          </div>
          <div className="fc-card p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">Clientes con deuda</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {resumen?.clientesConDeuda || 0}
            </p>
          </div>
          <div className="fc-card p-5 bg-amber-50 border-amber-100">
            <p className="text-xs font-semibold uppercase text-amber-700">Promedio por cliente</p>
            <p className="text-3xl font-bold text-amber-800 mt-1">
              Gs.{" "}
              {formatoGs(
                resumen?.clientesConDeuda
                  ? Math.round(resumen.totalDeuda / resumen.clientesConDeuda)
                  : 0
              )}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 fc-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-900">Clientes que deben</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ordenados por monto (mayor a menor)</p>
            </div>

            {loading ? (
              <p className="p-6 text-slate-500">Cargando...</p>
            ) : clientes.length === 0 ? (
              <p className="p-8 text-center text-emerald-600 font-medium">
                No hay clientes con deuda
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[32rem] overflow-y-auto">
                {clientes.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => verCliente(c)}
                    className={`w-full text-left px-5 py-4 hover:bg-slate-50 transition flex items-center gap-4 ${
                      clienteSel?.id === c.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{c.nombre}</p>
                      <p className="text-xs text-slate-500">{c.telefono}</p>
                    </div>
                    <p className="font-bold text-red-600 shrink-0">
                      Gs. {formatoGs(c.saldo)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            {!clienteSel ? (
              <div className="fc-card p-12 text-center text-slate-500">
                <p className="text-lg">Seleccioná un cliente</p>
                <p className="text-sm mt-2">
                  Verás su historial de movimientos y podrás registrar pagos
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="fc-card p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{clienteSel.nombre}</h2>
                      <p className="text-slate-500 text-sm">{clienteSel.telefono}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Saldo actual</p>
                      <p className="text-2xl font-bold text-red-600">
                        Gs. {formatoGs(cuenta?.saldo ?? clienteSel.saldo)}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={registrarPago} className="mt-5 pt-5 border-t flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[120px]">
                      <label className="fc-label">Monto a abonar</label>
                      <input
                        type="number"
                        className="fc-input"
                        value={montoPago}
                        onChange={(e) => setMontoPago(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="fc-label">Forma</label>
                      <select
                        className="fc-input"
                        value={formaPago}
                        onChange={(e) => setFormaPago(e.target.value)}
                      >
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                      </select>
                    </div>
                    <button type="submit" className="fc-btn fc-btn-primary">
                      Registrar pago
                    </button>
                  </form>
                </div>

                {deudasPedidos.length > 0 && (
                  <div className="fc-card overflow-hidden">
                    <div className="px-5 py-3 border-b bg-amber-50">
                      <h3 className="font-semibold text-amber-900">Pedidos pendientes de cobro</h3>
                    </div>
                    <div className="divide-y">
                      {deudasPedidos.map((p) => (
                        <div key={p.id} className="px-5 py-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">Pedido #{p.id}</p>
                            <p className="text-xs text-slate-500">
                              {formatFechaCorta(p.fecha)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">Gs. {formatoGs(p.total)}</span>
                            <button
                              onClick={() => marcarPedidoPagado(p.id, "EFECTIVO")}
                              className="fc-btn fc-btn-secondary text-xs py-1"
                            >
                              Cobrar efectivo
                            </button>
                            <button
                              onClick={() => marcarPedidoPagado(p.id, "TRANSFERENCIA")}
                              className="fc-btn fc-btn-secondary text-xs py-1"
                            >
                              Cobrar transf.
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="fc-card overflow-hidden">
                  <div className="px-5 py-3 border-b bg-slate-50">
                    <h3 className="font-semibold">Historial de movimientos</h3>
                  </div>
                  {!cuenta?.movimientos?.length ? (
                    <p className="p-6 text-slate-500 text-sm">Sin movimientos registrados</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500 border-b">
                          <th className="px-5 py-2 font-semibold">Fecha</th>
                          <th className="px-5 py-2 font-semibold">Tipo</th>
                          <th className="px-5 py-2 font-semibold">Concepto</th>
                          <th className="px-5 py-2 font-semibold text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cuenta.movimientos.map((m) => (
                          <tr key={m.id} className="border-b border-slate-50">
                            <td className="px-5 py-3">{formatFechaCorta(m.fecha)}</td>
                            <td className="px-5 py-3">
                              <span
                                className={`fc-badge ${
                                  m.tipo === "CARGO" ? "fc-badge-red" : "fc-badge-green"
                                }`}
                              >
                                {m.tipo === "CARGO" ? "Deuda" : "Pago"}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-600">{m.concepto}</td>
                            <td className="px-5 py-3 text-right font-semibold">
                              {m.tipo === "CARGO" ? "+" : "-"} Gs. {formatoGs(m.monto)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
