import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

const PLANES = ["GRATIS", "BASICO", "PRO", "ENTERPRISE"];
const ESTADOS = ["ACTIVO", "SUSPENDIDO", "CANCELADO"];

const badgePlan = {
  GRATIS: "bg-gray-100 text-gray-700",
  BASICO: "bg-blue-100 text-blue-800",
  PRO: "bg-purple-100 text-purple-800",
  ENTERPRISE: "bg-amber-100 text-amber-800",
};

const badgeEstado = {
  ACTIVO: "bg-green-100 text-green-800",
  SUSPENDIDO: "bg-yellow-100 text-yellow-800",
  CANCELADO: "bg-red-100 text-red-800",
};

export default function Negocios() {
  const [negocios, setNegocios] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});

  // Alta interna de negocio
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [formNuevo, setFormNuevo] = useState({
    nombre: "", email: "", telefono: "", direccion: "",
    adminNombre: "", adminEmail: "", adminPassword: "",
  });
  const [creandoNegocio, setCreandoNegocio] = useState(false);

  // Facturación por negocio
  const [facturando, setFacturando] = useState(null); // negocioId
  const [formFactura, setFormFactura] = useState({ concepto: "", monto: "", diasVencimiento: 15 });
  const [facturasNegocio, setFacturasNegocio] = useState([]);
  const [viendoFacturas, setViendoFacturas] = useState(null); // negocioId

  useEffect(() => {
    cargarNegocios();
  }, []);

  async function crearNegocio(e) {
    e.preventDefault();
    setCreandoNegocio(true);
    setError("");
    try {
      await api.post("/negocios/registrar", formNuevo);
      setMensaje(`Negocio "${formNuevo.nombre}" creado`);
      setMostrarNuevo(false);
      setFormNuevo({ nombre: "", email: "", telefono: "", direccion: "", adminNombre: "", adminEmail: "", adminPassword: "" });
      await cargarNegocios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear negocio");
    } finally {
      setCreandoNegocio(false);
    }
  }

  async function generarFactura(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/facturacion/admin/crear", {
        negocioId: facturando,
        concepto: formFactura.concepto,
        monto: Number(formFactura.monto),
        diasVencimiento: Number(formFactura.diasVencimiento),
      });
      setMensaje("Factura generada");
      setFacturando(null);
      setFormFactura({ concepto: "", monto: "", diasVencimiento: 15 });
      await cargarNegocios();
      if (viendoFacturas === facturando) await verFacturas(facturando);
    } catch (err) {
      setError(err.response?.data?.error || "Error al generar factura");
    }
  }

  async function verFacturas(negocioId) {
    try {
      const res = await api.get(`/facturacion/admin/negocio/${negocioId}`);
      setFacturasNegocio(res.data);
      setViendoFacturas(negocioId);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar facturas");
    }
  }

  async function pagarFactura(facturaId, negocioId) {
    try {
      await api.post(`/facturacion/admin/${facturaId}/pagar`, { metodoPago: "EFECTIVO" });
      setMensaje("Factura marcada como pagada");
      await verFacturas(negocioId);
      await cargarNegocios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al marcar pago");
    }
  }

  async function cargarNegocios() {
    setLoading(true);
    try {
      const [negociosRes, resumenRes] = await Promise.all([
        api.get("/negocios/admin/todos"),
        api.get("/negocios/admin/resumen"),
      ]);
      setNegocios(negociosRes.data);
      setResumen(resumenRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar negocios");
    } finally {
      setLoading(false);
    }
  }

  function iniciarEdicion(n) {
    setEditando(n.id);
    setForm({
      plan: n.plan,
      estado: n.estado,
      maxUsuarios: n.maxUsuarios,
      maxClientes: n.maxClientes,
      maxPedidosMes: n.maxPedidosMes,
      maxSebastianMsg: n.maxSebastianMsg,
    });
    setError("");
    setMensaje("");
  }

  async function guardar(id) {
    try {
      await api.put(`/negocios/admin/${id}`, form);
      setMensaje("Negocio actualizado");
      setEditando(null);
      await cargarNegocios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar");
    }
  }

  async function cambiarEstado(n, estado) {
    try {
      await api.put(`/negocios/admin/${n.id}`, { estado });
      setMensaje(`Negocio "${n.nombre}" → ${estado}`);
      await cargarNegocios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar estado");
    }
  }

  const formatoGs = (v) => new Intl.NumberFormat("es-PY").format(v || 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Negocios</h1>
            <p className="text-gray-500">Panel de administración de la plataforma</p>
          </div>
          <button
            onClick={() => setMostrarNuevo(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + Nuevo negocio
          </button>
        </div>

        {/* Modal: nuevo negocio */}
        {mostrarNuevo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Registrar nuevo negocio</h2>
              <form onSubmit={crearNegocio} className="space-y-3">
                <input required placeholder="Nombre del negocio" value={formNuevo.nombre}
                  onChange={(e) => setFormNuevo({ ...formNuevo, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input required type="email" placeholder="Email del negocio" value={formNuevo.email}
                  onChange={(e) => setFormNuevo({ ...formNuevo, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Teléfono" value={formNuevo.telefono}
                  onChange={(e) => setFormNuevo({ ...formNuevo, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Dirección" value={formNuevo.direccion}
                  onChange={(e) => setFormNuevo({ ...formNuevo, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <hr />
                <p className="text-xs text-gray-500 font-medium">Usuario administrador</p>
                <input required placeholder="Nombre del admin" value={formNuevo.adminNombre}
                  onChange={(e) => setFormNuevo({ ...formNuevo, adminNombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input required type="email" placeholder="Email del admin" value={formNuevo.adminEmail}
                  onChange={(e) => setFormNuevo({ ...formNuevo, adminEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input required type="password" placeholder="Contraseña (mín. 8, mayús, núm, símbolo)" value={formNuevo.adminPassword}
                  onChange={(e) => setFormNuevo({ ...formNuevo, adminPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={creandoNegocio}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium">
                    {creandoNegocio ? "Creando..." : "Crear negocio"}
                  </button>
                  <button type="button" onClick={() => setMostrarNuevo(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: generar factura */}
        {facturando && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Generar factura</h2>
              <form onSubmit={generarFactura} className="space-y-3">
                <input required placeholder="Concepto (ej: Suscripción mensual - Octubre)" value={formFactura.concepto}
                  onChange={(e) => setFormFactura({ ...formFactura, concepto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input required type="number" min="1" placeholder="Monto (Gs.)" value={formFactura.monto}
                  onChange={(e) => setFormFactura({ ...formFactura, monto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  Días de vencimiento:
                  <input type="number" min="1" value={formFactura.diasVencimiento}
                    onChange={(e) => setFormFactura({ ...formFactura, diasVencimiento: e.target.value })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm" />
                </label>
                <p className="text-xs text-gray-500">Se agrega IVA 21% automáticamente.</p>
                <div className="flex gap-2 pt-2">
                  <button type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
                    Generar factura
                  </button>
                  <button type="button" onClick={() => setFacturando(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Panel: facturas del negocio */}
        {viendoFacturas && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Facturas de {negocios.find((n) => n.id === viendoFacturas)?.nombre}
              </h2>
              <button onClick={() => setViendoFacturas(null)} className="text-gray-500 text-sm">
                Cerrar
              </button>
            </div>
            {facturasNegocio.length === 0 ? (
              <p className="text-gray-500 text-sm">Sin facturas.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Número</th>
                    <th className="pb-2">Concepto</th>
                    <th className="pb-2">Total</th>
                    <th className="pb-2">Vence</th>
                    <th className="pb-2">Estado</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {facturasNegocio.map((f) => (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="py-2 font-mono text-xs">{f.numero}</td>
                      <td className="py-2">{f.concepto}</td>
                      <td className="py-2">Gs. {formatoGs(f.total)}</td>
                      <td className="py-2">{new Date(f.fechaVencimiento).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          f.estado === "PAGADA" ? "bg-green-100 text-green-800" :
                          f.estado === "VENCIDA" ? "bg-red-100 text-red-800" :
                          f.estado === "ANULADA" ? "bg-gray-100 text-gray-600" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {f.estado}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        {(f.estado === "PENDIENTE" || f.estado === "VENCIDA") && (
                          <button onClick={() => pagarFactura(f.id, viendoFacturas)}
                            className="text-green-600 hover:text-green-800 text-xs font-medium">
                            Marcar pagada
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Resumen de la plataforma */}
        {resumen && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Negocios</p>
              <p className="text-2xl font-bold">{resumen.totales.negocios}</p>
              <p className="text-xs text-green-600">{resumen.totales.activos} activos</p>
              {resumen.totales.suspendidos > 0 && (
                <p className="text-xs text-yellow-600">{resumen.totales.suspendidos} suspendidos</p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Ingresos del mes</p>
              <p className="text-2xl font-bold text-green-600">
                Gs. {formatoGs(resumen.totales.ingresosMes)}
              </p>
              <p className="text-xs text-gray-500">facturas pagadas</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Por cobrar</p>
              <p className="text-2xl font-bold text-yellow-600">{resumen.totales.facturasPendientes}</p>
              {resumen.totales.facturasVencidas > 0 && (
                <p className="text-xs text-red-600">{resumen.totales.facturasVencidas} vencidas</p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Actividad del mes</p>
              <p className="text-2xl font-bold">{resumen.totales.pedidosMes}</p>
              <p className="text-xs text-gray-500">pedidos en toda la plataforma</p>
              {resumen.totales.nuevosEsteMes > 0 && (
                <p className="text-xs text-blue-600">+{resumen.totales.nuevosEsteMes} negocios nuevos</p>
              )}
            </div>
          </div>
        )}

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

        <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
          {loading ? (
            <p className="text-gray-500">Cargando negocios...</p>
          ) : negocios.length === 0 ? (
            <p className="text-gray-500">No hay negocios registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Negocio</th>
                  <th className="pb-2">Plan</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Uso</th>
                  <th className="pb-2">Facturas pendientes</th>
                  <th className="pb-2">Registrado</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {negocios.map((n) => (
                  <tr key={n.id} className="border-b last:border-0 align-top">
                    <td className="py-3">
                      <p className="font-medium">{n.nombre}</p>
                      <p className="text-xs text-gray-500">{n.email}</p>
                      <p className="text-xs text-gray-400">/{n.slug}</p>
                    </td>

                    {editando === n.id ? (
                      <>
                        <td className="py-3">
                          <select
                            value={form.plan}
                            onChange={(e) => setForm({ ...form, plan: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {PLANES.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          <select
                            value={form.estado}
                            onChange={(e) => setForm({ ...form, estado: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {ESTADOS.map((e) => (
                              <option key={e} value={e}>{e}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          <div className="space-y-1 text-xs">
                            <label className="flex items-center gap-1">
                              Usuarios:
                              <input type="number" value={form.maxUsuarios}
                                onChange={(e) => setForm({ ...form, maxUsuarios: e.target.value })}
                                className="w-20 px-1 border border-gray-300 rounded" />
                            </label>
                            <label className="flex items-center gap-1">
                              Clientes:
                              <input type="number" value={form.maxClientes}
                                onChange={(e) => setForm({ ...form, maxClientes: e.target.value })}
                                className="w-20 px-1 border border-gray-300 rounded" />
                            </label>
                            <label className="flex items-center gap-1">
                              Pedidos/mes:
                              <input type="number" value={form.maxPedidosMes}
                                onChange={(e) => setForm({ ...form, maxPedidosMes: e.target.value })}
                                className="w-20 px-1 border border-gray-300 rounded" />
                            </label>
                            <label className="flex items-center gap-1">
                              Sebastian/mes:
                              <input type="number" value={form.maxSebastianMsg}
                                onChange={(e) => setForm({ ...form, maxSebastianMsg: e.target.value })}
                                className="w-20 px-1 border border-gray-300 rounded" />
                            </label>
                          </div>
                        </td>
                        <td className="py-3 text-gray-500">—</td>
                        <td className="py-3 text-gray-500">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button onClick={() => guardar(n.id)}
                            className="text-green-600 hover:text-green-800 text-xs font-medium">
                            Guardar
                          </button>
                          <button onClick={() => setEditando(null)}
                            className="text-gray-500 text-xs">
                            Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${badgePlan[n.plan] || ""}`}>
                            {n.plan}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${badgeEstado[n.estado] || ""}`}>
                            {n.estado}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-600">
                          <p>{n._count.usuarios} usuarios</p>
                          <p>{n._count.clientes} clientes</p>
                          <p>{n._count.pedidos} pedidos</p>
                        </td>
                        <td className="py-3 text-xs">
                          {n.facturas.length === 0 ? (
                            <span className="text-green-600">Al día</span>
                          ) : (
                            <span className="text-red-600 font-medium">
                              {n.facturas.length} pendiente(s) · Gs.{" "}
                              {formatoGs(n.facturas.reduce((s, f) => s + f.total, 0))}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-gray-500">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button onClick={() => iniciarEdicion(n)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                            Editar
                          </button>
                          <button onClick={() => { setFacturando(n.id); setFormFactura({ concepto: `Suscripción ${n.plan} - ${n.nombre}`, monto: "", diasVencimiento: 15 }); }}
                            className="text-purple-600 hover:text-purple-800 text-xs font-medium">
                            Facturar
                          </button>
                          <button onClick={() => verFacturas(n.id)}
                            className="text-gray-600 hover:text-gray-800 text-xs font-medium">
                            Facturas
                          </button>
                          {n.estado === "ACTIVO" ? (
                            <button onClick={() => cambiarEstado(n, "SUSPENDIDO")}
                              className="text-yellow-600 hover:text-yellow-800 text-xs font-medium">
                              Suspender
                            </button>
                          ) : (
                            <button onClick={() => cambiarEstado(n, "ACTIVO")}
                              className="text-green-600 hover:text-green-800 text-xs font-medium">
                              Activar
                            </button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
