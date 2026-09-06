export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Food Control</h1>
        <div className="flex gap-4">
          <button className="hover:bg-blue-700 px-3 py-2 rounded">Perfil</button>
          <button className="hover:bg-blue-700 px-3 py-2 rounded">Salir</button>
        </div>
      </div>
    </nav>
  );
}
