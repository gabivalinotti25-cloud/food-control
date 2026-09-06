import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-8">
        Food Control
      </h1>

      <nav className="flex flex-col gap-3">
        <Link to="/">Dashboard</Link>
        <Link to="/pedidos">Pedidos</Link>
        <Link to="/clientes">Clientes</Link>

        <Link to="/cuenta">
          Cuenta Corriente
        </Link>

        <Link to="/caja">Caja</Link>
        <Link to="/configuracion">Configuración</Link>
        <Link to="/menu">Menú de hoy</Link>
      </nav>
    </aside>
  );
}