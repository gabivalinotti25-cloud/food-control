import { Link } from "react-router-dom";

export default function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  };

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  return (
    <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">
        Food Control
      </h1>

      <nav className="flex flex-col gap-3 flex-1">
        <Link to="/" className="hover:text-blue-300 transition">Dashboard</Link>
        <Link to="/pedidos" className="hover:text-blue-300 transition">Pedidos</Link>
        <Link to="/clientes" className="hover:text-blue-300 transition">Clientes</Link>

        <Link to="/cuenta" className="hover:text-blue-300 transition">
          Cuenta Corriente
        </Link>

        <Link to="/caja" className="hover:text-blue-300 transition">Caja</Link>
        <Link to="/ventas-anonimas" className="hover:text-blue-300 transition">Ventas Anónimas</Link>
        <Link to="/estadisticas" className="hover:text-blue-300 transition">Estadísticas</Link>
        <Link to="/menu" className="hover:text-blue-300 transition">Menú de hoy</Link>
        <Link to="/configuracion-menu" className="hover:text-blue-300 transition">Config. Menú</Link>
        <Link to="/productos" className="hover:text-blue-300 transition">Productos</Link>
        <Link to="/configuracion" className="hover:text-blue-300 transition">Configuración</Link>
      </nav>

      <div className="mt-8 pt-6 border-t border-slate-700">
        <div className="mb-4">
          <p className="text-sm text-slate-400">Usuario:</p>
          <p className="font-medium">{usuario.nombre || 'Usuario'}</p>
          <p className="text-xs text-slate-500">{usuario.rol || 'EMPLEADO'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}