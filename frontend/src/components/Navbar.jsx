import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Notificaciones from "./Notificaciones";

export default function Navbar() {
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [noLeidasCount, setNoLeidasCount] = useState(0);

  useEffect(() => {
    cargarNoLeidas();
    const interval = setInterval(cargarNoLeidas, 30000); // Polling cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  async function cargarNoLeidas() {
    try {
      const { data } = await api.get("/notificaciones?soloNoLeidas=true");
      setNoLeidasCount(data.noLeidasCount);
    } catch (error) {
      console.error("Error al cargar no leídas:", error);
    }
  }

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-4 shadow-2xl border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <h1 className="text-2xl font-serif font-bold tracking-wide">Food Control</h1>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/sebastian" target="_blank" rel="noopener noreferrer" className="hover:bg-gray-700 px-3 py-2 rounded transition-all font-serif flex items-center gap-2">
            <span>🎩</span>
            <span>Sebastian</span>
          </Link>
          
          <Link to="/historial-sebastian" className="hover:bg-gray-700 px-3 py-2 rounded transition-all font-serif flex items-center gap-2">
            <span>📜</span>
            <span>Historial</span>
          </Link>
          
          <div className="relative">
            <button
              onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
              className="hover:bg-gray-700 px-3 py-2 rounded transition-all font-serif flex items-center gap-2 relative"
            >
              <span className="text-xl">🔔</span>
              {noLeidasCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {noLeidasCount > 9 ? '9+' : noLeidasCount}
                </span>
              )}
            </button>
            
            {mostrarNotificaciones && (
              <Notificaciones onClose={() => setMostrarNotificaciones(false)} />
            )}
          </div>
          
          <button className="hover:bg-gray-700 px-3 py-2 rounded transition-all font-serif">Perfil</button>
          <button className="hover:bg-gray-700 px-3 py-2 rounded transition-all font-serif">Salir</button>
        </div>
      </div>
    </nav>
  );
}
