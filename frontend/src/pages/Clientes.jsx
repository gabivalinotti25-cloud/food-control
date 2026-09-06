import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    observacion: "",
  });

  async function cargarClientes() {
    const res = await fetch("http://localhost:3000/clientes");
    const data = await res.json();
    setClientes(data);
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  async function guardarCliente(e) {
    e.preventDefault();

    await fetch("http://localhost:3000/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({
      nombre: "",
      telefono: "",
      direccion: "",
      observacion: "",
    });

    cargarClientes();
  }

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Clientes
      </h1>

      <form
        onSubmit={guardarCliente}
        className="bg-white p-6 rounded-xl shadow mb-8"
      >
        <div className="grid grid-cols-2 gap-4">

          <input
            placeholder="Nombre"
            className="border p-2 rounded"
            value={form.nombre}
            onChange={(e) =>
              setForm({ ...form, nombre: e.target.value })
            }
          />

          <input
            placeholder="Teléfono"
            className="border p-2 rounded"
            value={form.telefono}
            onChange={(e) =>
              setForm({ ...form, telefono: e.target.value })
            }
          />

          <input
            placeholder="Dirección"
            className="border p-2 rounded"
            value={form.direccion}
            onChange={(e) =>
              setForm({ ...form, direccion: e.target.value })
            }
          />

          <input
            placeholder="Observación"
            className="border p-2 rounded"
            value={form.observacion}
            onChange={(e) =>
              setForm({ ...form, observacion: e.target.value })
            }
          />

        </div>

        <button
          className="mt-4 bg-blue-600 text-white px-5 py-2 rounded"
        >
          Guardar Cliente
        </button>
      </form>

      <div className="bg-white rounded-xl shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Dirección</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((cliente) => (
              <tr
                key={cliente.id}
                className="border-b"
              >
                <td className="p-3">{cliente.nombre}</td>
                <td className="p-3">{cliente.telefono}</td>
                <td className="p-3">{cliente.direccion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </MainLayout>
  );
}