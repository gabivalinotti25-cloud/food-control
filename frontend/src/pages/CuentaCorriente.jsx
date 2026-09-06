import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

export default function CuentaCorriente() {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [movimientos, setMovimientos] = useState([]);

  const [montoPago, setMontoPago] = useState("");
  const [formaPago, setFormaPago] = useState("EFECTIVO");

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    const res = await fetch("http://localhost:3000/clientes");
    const data = await res.json();
    setClientes(data);
  }

  async function verCuenta(cliente) {
    setClienteSeleccionado(cliente);

    const res = await fetch(
      `http://localhost:3000/cuenta/${cliente.id}`
    );

    const data = await res.json();

    setMovimientos(data.movimientos || []);

    // Actualizar saldo del cliente seleccionado
    setClienteSeleccionado(data);
  }

  async function registrarPago() {
    if (!clienteSeleccionado) return;

    const res = await fetch("http://localhost:3000/pagos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clienteId: clienteSeleccionado.id,
        monto: Number(montoPago),
        formaPago,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Pago registrado correctamente");

      setMontoPago("");

      await verCuenta(clienteSeleccionado);
      await cargarClientes();
    } else {
      alert(data.error);
    }
  }

  const formatoGs = (valor) =>
    new Intl.NumberFormat("es-PY").format(valor || 0);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Cuenta Corriente
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Saldo</th>
              <th className="p-3 text-left">Acción</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border-t">
                <td className="p-3">{cliente.nombre}</td>

                <td className="p-3">{cliente.telefono}</td>

                <td className="p-3 font-bold text-red-600">
                  Gs. {formatoGs(cliente.saldo)}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => verCuenta(cliente)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Ver cuenta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {clienteSeleccionado && (
        <div className="mt-8 bg-white rounded-xl shadow">

          <div className="border-b p-6">

            <h2 className="text-2xl font-bold">
              {clienteSeleccionado.nombre}
            </h2>

            <p className="mt-2 text-lg">
              Saldo:
              <span className="font-bold text-red-600 ml-2">
                Gs. {formatoGs(clienteSeleccionado.saldo)}
              </span>
            </p>

            <div className="mt-6 flex gap-4 items-end">

              <div>
                <label className="block font-semibold mb-1">
                  Monto
                </label>

                <input
                  type="number"
                  className="border rounded p-2"
                  value={montoPago}
                  onChange={(e) =>
                    setMontoPago(e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Forma de pago
                </label>

                <select
                  className="border rounded p-2"
                  value={formaPago}
                  onChange={(e) =>
                    setFormaPago(e.target.value)
                  }
                >
                  <option value="EFECTIVO">
                    Efectivo
                  </option>

                  <option value="TRANSFERENCIA">
                    Transferencia
                  </option>
                </select>
              </div>

              <button
                onClick={registrarPago}
                className="bg-green-600 text-white px-5 py-2 rounded"
              >
                Registrar pago
              </button>

            </div>

          </div>

          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Concepto</th>
                <th className="p-3 text-left">Monto</th>
              </tr>
            </thead>

            <tbody>

              {movimientos.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-6 text-center text-gray-500"
                  >
                    Este cliente aún no tiene movimientos.
                  </td>
                </tr>
              ) : (
                movimientos.map((mov) => (
                  <tr key={mov.id} className="border-t">

                    <td className="p-3">
                      {new Date(mov.fecha).toLocaleDateString("es-PY")}
                    </td>

                    <td className="p-3">
                      {mov.tipo}
                    </td>

                    <td className="p-3">
                      {mov.concepto}
                    </td>

                    <td className="p-3">
                      Gs. {formatoGs(mov.monto)}
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>

        </div>
      )}

    </MainLayout>
  );
}