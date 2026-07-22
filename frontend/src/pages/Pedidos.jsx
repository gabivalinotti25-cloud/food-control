import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

export default function Pedidos() {
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  const [form, setForm] = useState({
    clienteId: "",
    total: "",
    estadoPago: "PAGADO",
    formaPago: "EFECTIVO",
  });

  useEffect(() => {
    cargarClientes();
    cargarPedidos();
  }, []);

  async function cargarClientes() {
    const { data } = await api.get("/clientes");
    setClientes(Array.isArray(data) ? data : []);
  }

  async function cargarPedidos() {
    const { data } = await api.get("/pedidos");
    setPedidos(Array.isArray(data) ? data : []);
  }

  async function guardarPedido(e) {
    e.preventDefault();

    const { data } = await api.post("/pedidos", form);

    console.log(data);

    alert("Pedido guardado");

    setForm({
      clienteId: "",
      total: "",
      estadoPago: "PAGADO",
      formaPago: "EFECTIVO",
    });

    cargarPedidos();
  }

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Nuevo Pedido
      </h1>

      <form
        onSubmit={guardarPedido}
        className="bg-white p-6 rounded-xl shadow max-w-xl"
      >
        <label className="font-semibold">
          Cliente
        </label>

        <select
          className="border rounded w-full p-2 mt-2 mb-4"
          value={form.clienteId}
          onChange={(e) =>
            setForm({
              ...form,
              clienteId: e.target.value,
            })
          }
        >
          <option value="">Seleccione un cliente</option>

          {clientes.map((cliente) => (
            <option
              key={cliente.id}
              value={cliente.id}
            >
              {cliente.nombre}
            </option>
          ))}
        </select>

        <label className="font-semibold">
          Total
        </label>

        <input
          className="border rounded w-full p-2 mt-2 mb-4"
          type="number"
          value={form.total}
          onChange={(e) =>
            setForm({
              ...form,
              total: e.target.value,
            })
          }
        />

        <label className="font-semibold">
          Estado del pago
        </label>

        <select
          className="border rounded w-full p-2 mt-2 mb-4"
          value={form.estadoPago}
          onChange={(e) =>
            setForm({
              ...form,
              estadoPago: e.target.value,
            })
          }
        >
          <option value="PAGADO">Pagado</option>
          <option value="PENDIENTE">Pendiente</option>
        </select>

        {form.estadoPago === "PAGADO" && (
          <>
            <label className="font-semibold">
              Forma de pago
            </label>

            <select
              className="border rounded w-full p-2 mt-2 mb-4"
              value={form.formaPago}
              onChange={(e) =>
                setForm({
                  ...form,
                  formaPago: e.target.value,
                })
              }
            >
              <option value="EFECTIVO">
                Efectivo
              </option>

              <option value="TRANSFERENCIA">
                Transferencia
              </option>
            </select>
          </>
        )}

        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          Guardar Pedido
        </button>
      </form>

      <div className="mt-8 bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Forma de pago</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-4 text-center text-gray-500"
                >
                  No hay pedidos registrados.
                </td>
              </tr>
            ) : (
              pedidos.map((pedido) => (
                <tr
                  key={pedido.id}
                  className="border-t"
                >
                  <td className="p-3">
                    {pedido.cliente.nombre}
                  </td>

                  <td className="p-3">
                    Gs. {pedido.total.toLocaleString("es-PY")}
                  </td>

                  <td className="p-3">
                    {pedido.estadoPago === "PAGADO"
                      ? "✅ Pagado"
                      : "🟡 Pendiente"}
                  </td>

                  <td className="p-3">
                    {pedido.pago
                      ? pedido.pago.forma
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
