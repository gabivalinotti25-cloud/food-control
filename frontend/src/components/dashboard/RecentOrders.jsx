export default function RecentOrders({ pedidos }) {
  const formatoGs = (valor) =>
    new Intl.NumberFormat("es-PY").format(valor || 0);

  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold">
            Últimos pedidos
          </h2>
        </div>

        <div className="p-8 text-center text-gray-500">
          No existen pedidos registrados.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow">

      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-semibold">
          Últimos pedidos
        </h2>
      </div>

      <table className="w-full">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Cliente</th>
            <th className="p-3 text-left">Estado</th>
            <th className="p-3 text-left">Total</th>
          </tr>
        </thead>

        <tbody>

          {pedidos.map((pedido) => (

            <tr
              key={pedido.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="p-3">
                {pedido.cliente?.nombre}
              </td>

              <td className="p-3">

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium
                  ${
                    pedido.estado === "ENTREGADO"
                      ? "bg-green-100 text-green-700"
                      : pedido.estado === "PENDIENTE"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {pedido.estado}
                </span>

              </td>

              <td className="p-3 font-semibold">
                Gs. {formatoGs(pedido.total)}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}