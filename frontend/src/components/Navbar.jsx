import { Link } from "react-router-dom";

export default function Navbar() {
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
          <button className="hover:bg-gray-700 px-3 py-2 rounded transition-all font-serif">Perfil</button>
          <button className="hover:bg-gray-700 px-3 py-2 rounded transition-all font-serif">Salir</button>
        </div>
      </div>
    </nav>
  );
}
