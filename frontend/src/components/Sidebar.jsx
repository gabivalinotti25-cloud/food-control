import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Operaciones", icon: "📅", end: true },
  { to: "/deudas", label: "Deudas", icon: "💳" },
  { to: "/clientes", label: "Clientes", icon: "👥" },
  { to: "/productos", label: "Productos", icon: "🍽️" },
  { to: "/estadisticas", label: "Estadísticas", icon: "📊" },
  { to: "/configuracion", label: "Configuración", icon: "⚙️", admin: true },
];

export default function Sidebar() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  }

  const links = navItems.filter(
    (item) => !item.admin || usuario.rol === "ADMIN"
  );

  return (
    <aside className="w-64 min-h-screen bg-[#0f172a] text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-700/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-lg font-bold">
            FC
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Food Control</h1>
            <p className="text-xs text-slate-400">Gestión diaria</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/80">
        <div className="px-3 py-2 mb-3">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Usuario</p>
          <p className="font-medium text-sm mt-0.5">{usuario.nombre || "Usuario"}</p>
          <p className="text-xs text-slate-400">{usuario.rol || "EMPLEADO"}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full fc-btn bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
