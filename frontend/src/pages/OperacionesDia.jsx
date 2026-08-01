import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import CalendarStrip, { ResumenDiaCards, BadgePago } from "../components/CalendarStrip";
import api from "../services/api";
import { formatoGs, hoyISO, labelPago } from "../utils/format";

const TABS = [
  { id: "registros", label: "Registros del día" },
  { id: "menu", label: "Menú" },
  { id: "resumen", label: "Resumen" },
];

export default function OperacionesDia() {
  const { fecha: fechaParam } = useParams();
  const navigate = useNavigate();
  const fecha = fechaParam || hoyISO();

  const [tab, setTab] = useState("registros");
  const [datos, setDatos] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [clienteId, setClienteId] = useState("");
  const [formaPago, setFormaPago] = useState("EFECTIVO");
  const [items, setItems] = useState([]);
  const [montoLibre, setMontoLibre] = useState({ descripcion: "", precio: "" });

  const [menuLibre, setMenuLibre] = useState({ nombre: "", precio: "" });

  useEffect(() => {
    cargarTodo();
  }, [fecha]);

  async function cargarTodo() {
    setLoading(true);
    setError("");
    try {
      const [diaRes, clientesRes, productosRes] = await Promise.all([
        api.get(`/dia/${fecha}`),
        api.get("/clientes"),
        api.get("/productos"),
      ]);
      setDatos(diaRes.data);
      setClientes(clientesRes.data || []);
      setProductos(productosRes.data || []);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 404) {
        setError(
          "El backend está desactualizado. Reiniciá el servidor backend (npm run dev en la carpeta backend)."
        );
      } else if (e.request) {
        setError(
          "No se pudo conectar con el backend. Verificá que esté corriendo en http://localhost:3000"
        );
      } else {
        setError("Error al cargar los datos del día.");
      }
    } finally {
      setLoading(false);
    }
  }

  const menuProductos = datos?.menu?.productos || [];
  const pedidos = datos?.pedidos || [];

  const totalPedido = useMemo(
    () => items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0),
    [items]
  );

  function toggleItem(producto) {
    setItems((prev) => {
      const existe = prev.find((i) => i.productoId === producto.id);
      if (existe) {
        return prev.filter((i) => i.productoId !== producto.id);
      }
      return [
        ...prev,
        {
          productoId: producto.id,
          descripcion: producto.nombre,
          cantidad: 1,
          precioUnitario: producto.precio,
        },
      ];
    });
  }

  function actualizarCantidad(productoId, cantidad) {
    setItems((prev) =>
      prev.map((i) =>
        i.productoId === productoId
          ? { ...i, cantidad: Math.max(1, Number(cantidad) || 1) }
          : i
      )
    );
  }

  function agregarMontoLibre() {
    if (!montoLibre.precio) return;
    setItems((prev) => [
      ...prev,
      {
        descripcion: montoLibre.descripcion || "Monto libre",
        cantidad: 1,
        precioUnitario: Number(montoLibre.precio),
      },
    ]);
    setMontoLibre({ descripcion: "", precio: "" });
  }

  async function guardarRegistro(e) {
    e.preventDefault();
    if (!clienteId || items.length === 0) return;

    setGuardando(true);
    try {
      await api.post("/pedidos", {
        clienteId,
        fecha,
        detalles: items,
        estadoPago: formaPago === "PENDIENTE" ? "PENDIENTE" : "PAGADO",
        formaPago: formaPago === "PENDIENTE" ? undefined : formaPago,
      });
      setClienteId("");
      setItems([]);
      setFormaPago("EFECTIVO");
      await cargarTodo();
    } catch (e) {
      alert(e.response?.data?.error || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarPedido(id) {
    if (!confirm("⚠️ ATENCIÓN: Esto eliminará el registro y TODOS sus datos asociados (pagos, detalles, movimientos de cuenta). ¿Estás seguro de que quieres continuar?")) return;
    await api.delete(`/pedidos/${id}`);
    cargarTodo();
  }

  async function copiarMenuFijo() {
    await api.post("/menu/copiar", { fecha });
    cargarTodo();
  }

  async function agregarAlMenu(productoId) {
    await api.post("/menu/agregar", { productoId, fecha });
    cargarTodo();
  }

  async function quitarDelMenu(id) {
    await api.delete(`/menu/producto/${id}`);
    cargarTodo();
  }

  async function agregarMontoAlMenu(e) {
    e.preventDefault();
    if (!menuLibre.precio) return;
    await api.post("/menu/monto-libre", {
      fecha,
      nombre: menuLibre.nombre || "Monto libre",
      precio: Number(menuLibre.precio),
    });
    setMenuLibre({ nombre: "", precio: "" });
    cargarTodo();
  }

  const productosDisponibles = productos.filter(
    (p) => p.activo && !menuProductos.some((m) => m.producto.id === p.id)
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64 text-slate-500">
          Cargando operaciones...
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="fc-card p-8 max-w-lg mx-auto mt-12 text-center">
          <p className="text-red-600 font-semibold mb-2">No se pudo cargar la aplicación</p>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <div className="text-left text-sm bg-slate-50 rounded-lg p-4 space-y-2 text-slate-700">
            <p className="font-semibold">Pasos para solucionarlo:</p>
            <p>1. Abrí una terminal en la carpeta <code className="bg-white px-1 rounded">backend</code> y ejecutá: <code className="bg-white px-1 rounded">npm run dev</code></p>
            <p>2. Abrí otra terminal en la carpeta <code className="bg-white px-1 rounded">frontend</code> y ejecutá: <code className="bg-white px-1 rounded">npm run dev</code></p>
            <p>3. Recargá esta página</p>
          </div>
          <button onClick={cargarTodo} className="fc-btn fc-btn-primary mt-6">
            Reintentar
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Operaciones del día</h1>
            <p className="text-slate-500 mt-1">
              Registros, menú y cobros organizados por fecha
            </p>
          </div>
          <Link 
            to="/sebastian"
            className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-serif border border-gray-700 shadow-lg"
          >
            <span className="text-xl">🎩</span>
            <span>Sebastian</span>
          </Link>
        </div>

        <CalendarStrip
          fecha={fecha}
          onChange={(f) => navigate(f === hoyISO() ? "/" : `/dia/${f}`)}
        />

        <ResumenDiaCards resumen={datos?.resumen} />

        <div className="flex gap-2 border-b border-slate-200 pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
                tab === t.id
                  ? "bg-white text-blue-600 border border-b-white border-slate-200 -mb-px"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "registros" && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 fc-card p-5">
              <h3 className="font-bold text-slate-900 mb-4">Nuevo registro</h3>
              <form onSubmit={guardarRegistro} className="space-y-4">
                <div>
                  <label className="fc-label">Cliente</label>
                  <select
                    className="fc-input"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="fc-label">Ítems del menú</label>
                  {menuProductos.length === 0 ? (
                    <p className="text-sm text-slate-500 py-2">
                      Cargá el menú en la pestaña Menú primero.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {menuProductos.map(({ producto }) => {
                        const sel = items.find((i) => i.productoId === producto.id);
                        return (
                          <div
                            key={producto.id}
                            className={`flex items-center justify-between p-2 rounded-lg border ${
                              sel ? "border-blue-300 bg-blue-50" : "border-slate-200"
                            }`}
                          >
                            <label className="flex items-center gap-2 flex-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!sel}
                                onChange={() => toggleItem(producto)}
                              />
                              <span className="text-sm font-medium">{producto.nombre}</span>
                              <span className="text-xs text-slate-500">
                                Gs. {formatoGs(producto.precio)}
                              </span>
                            </label>
                            {sel && (
                              <input
                                type="number"
                                min="1"
                                value={sel.cantidad}
                                onChange={(e) =>
                                  actualizarCantidad(producto.id, e.target.value)
                                }
                                className="fc-input w-16 text-center"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t pt-3">
                  <label className="fc-label">Monto sin nombre</label>
                  <div className="flex gap-2">
                    <input
                      className="fc-input"
                      placeholder="Descripción (opcional)"
                      value={montoLibre.descripcion}
                      onChange={(e) =>
                        setMontoLibre({ ...montoLibre, descripcion: e.target.value })
                      }
                    />
                    <input
                      className="fc-input w-28"
                      type="number"
                      placeholder="Gs."
                      value={montoLibre.precio}
                      onChange={(e) =>
                        setMontoLibre({ ...montoLibre, precio: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={agregarMontoLibre}
                      className="fc-btn fc-btn-secondary shrink-0"
                    >
                      +
                    </button>
                  </div>
                  {items.filter((i) => !i.productoId).map((i, idx) => (
                    <div key={idx} className="text-sm text-slate-600 mt-2 flex justify-between">
                      <span>{i.descripcion}</span>
                      <span>Gs. {formatoGs(i.precioUnitario)}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="fc-label">Forma de pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: "EFECTIVO", l: "Efectivo" },
                      { v: "TRANSFERENCIA", l: "Transferencia" },
                      { v: "PENDIENTE", l: "Fiado" },
                    ].map((op) => (
                      <button
                        key={op.v}
                        type="button"
                        onClick={() => setFormaPago(op.v)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition ${
                          formaPago === op.v
                            ? op.v === "PENDIENTE"
                              ? "bg-amber-100 border-amber-400 text-amber-800"
                              : op.v === "TRANSFERENCIA"
                              ? "bg-blue-100 border-blue-400 text-blue-800"
                              : "bg-emerald-100 border-emerald-400 text-emerald-800"
                            : "bg-white border-slate-200 text-slate-600"
                        }`}
                      >
                        {op.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-bold text-lg">
                    Total: Gs. {formatoGs(totalPedido)}
                  </span>
                  <button
                    type="submit"
                    disabled={guardando || !clienteId || items.length === 0}
                    className="fc-btn fc-btn-primary disabled:opacity-50"
                  >
                    {guardando ? "Guardando..." : "Registrar"}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-3 fc-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">
                  Registros ({pedidos.length})
                </h3>
              </div>
              {pedidos.length === 0 ? (
                <p className="p-8 text-center text-slate-500">
                  No hay registros para este día
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pedidos.map((p) => (
                    <div key={p.id} className="px-5 py-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {p.cliente?.nombre}
                          </p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {p.detalles
                              ?.map(
                                (d) =>
                                  `${d.cantidad}x ${d.producto?.nombre || d.descripcion}`
                              )
                              .join(" · ") || "—"}
                          </p>
                          <div className="mt-2">
                            <BadgePago pedido={p} />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-slate-900">
                            Gs. {formatoGs(p.total)}
                          </p>
                          <button
                            onClick={() => eliminarPedido(p.id)}
                            className="text-xs text-red-500 mt-2 hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "menu" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="fc-card p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Menú del día</h3>
                <button onClick={copiarMenuFijo} className="fc-btn fc-btn-primary text-sm">
                  Cargar platos fijos
                </button>
              </div>

              {menuProductos.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  Sin menú cargado. Usá &quot;Cargar platos fijos&quot; o agregá platos del día.
                </p>
              ) : (
                <div className="space-y-2">
                  {menuProductos.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                    >
                      <div>
                        <p className="font-medium">{item.producto.nombre}</p>
                        <p className="text-sm text-slate-500">
                          Gs. {formatoGs(item.producto.precio)}
                          {item.producto.esFijo && (
                            <span className="ml-2 fc-badge fc-badge-gray">Fijo</span>
                          )}
                          {item.producto.esLibre && (
                            <span className="ml-2 fc-badge fc-badge-blue">Libre</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => quitarDelMenu(item.id)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={agregarMontoAlMenu} className="mt-6 pt-4 border-t space-y-3">
                <p className="font-semibold text-sm">Agregar monto sin nombre al menú</p>
                <div className="flex gap-2">
                  <input
                    className="fc-input"
                    placeholder="Nombre (ej: Extra)"
                    value={menuLibre.nombre}
                    onChange={(e) => setMenuLibre({ ...menuLibre, nombre: e.target.value })}
                  />
                  <input
                    className="fc-input w-32"
                    type="number"
                    placeholder="Precio Gs."
                    value={menuLibre.precio}
                    onChange={(e) => setMenuLibre({ ...menuLibre, precio: e.target.value })}
                  />
                  <button type="submit" className="fc-btn fc-btn-secondary">
                    Agregar
                  </button>
                </div>
              </form>
            </div>

            <div className="fc-card p-5">
              <h3 className="font-bold mb-4">Platos del día (2-3 especiales)</h3>
              <p className="text-sm text-slate-500 mb-4">
                Agregá los platos que cambian cada día. Los fijos se cargan con el botón anterior.
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {productosDisponibles.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                  >
                    <div>
                      <p className="font-medium text-sm">{p.nombre}</p>
                      <p className="text-xs text-slate-500">Gs. {formatoGs(p.precio)}</p>
                    </div>
                    <button
                      onClick={() => agregarAlMenu(p.id)}
                      className="fc-btn fc-btn-primary text-xs py-1.5 px-3"
                    >
                      + Menú
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "resumen" && (
          <div className="fc-card p-6">
            <h3 className="font-bold mb-6">Resumen de cobros del día</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">
                  Por forma de pago
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-emerald-50 rounded-lg">
                    <span>Efectivo</span>
                    <span className="font-bold text-emerald-700">
                      Gs. {formatoGs(datos?.resumen?.efectivo)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span>Transferencia</span>
                    <span className="font-bold text-blue-700">
                      Gs. {formatoGs(datos?.resumen?.transferencia)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                    <span>Fiado (no pagaron)</span>
                    <span className="font-bold text-amber-700">
                      Gs. {formatoGs(datos?.resumen?.fiado)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">
                  Detalle por cliente
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pedidos.map((p) => (
                    <div key={p.id} className="flex justify-between text-sm py-2 border-b border-slate-100">
                      <span>{p.cliente?.nombre}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-slate-500">{labelPago(p)}</span>
                        <span className="font-semibold">Gs. {formatoGs(p.total)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
