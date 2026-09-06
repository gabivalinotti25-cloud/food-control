import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Landing() {
  const [planes, setPlanes] = useState([]);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    adminNombre: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/negocios/planes")
      .then((res) => setPlanes(res.data))
      .catch(() => setPlanes([]));
  }, []);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.adminPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/negocios/registrar", {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        adminNombre: formData.adminNombre,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
      });

      // Login automático con el token devuelto
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.admin));
      api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          (err.request
            ? "No se pudo conectar con el servidor."
            : "Error al registrar el negocio")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white">Food Control</h1>
        <div className="space-x-3">
          <button
            onClick={() => navigate("/login")}
            className="text-white hover:text-blue-200 font-medium"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setMostrarRegistro(true)}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Registrar mi negocio
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center text-white px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Gestioná tu negocio gastronómico en un solo lugar
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Pedidos, clientes, deudas, caja diaria, estadísticas y un asistente de
          IA. Todo lo que necesitás para profesionalizar tu operación.
        </p>
        <button
          onClick={() => setMostrarRegistro(true)}
          className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition shadow-lg"
        >
          Comenzar gratis — 30 días de prueba
        </button>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-6">
        {[
          { titulo: "Operaciones del día", desc: "Pedidos, menú diario y caja en tiempo real." },
          { titulo: "Cuentas corrientes", desc: "Control de deudas y pagos de tus clientes." },
          { titulo: "Sebastian IA", desc: "Asistente inteligente que gestiona por vos." },
        ].map((f) => (
          <div key={f.titulo} className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2">{f.titulo}</h3>
            <p className="text-blue-100">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Planes */}
      {planes.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h3 className="text-3xl font-bold text-white text-center mb-10">Planes</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {planes.map((plan) => (
              <div
                key={plan.codigo}
                className="bg-white rounded-xl p-6 shadow-lg flex flex-col"
              >
                <h4 className="text-xl font-bold text-gray-800">{plan.nombre}</h4>
                <p className="text-gray-500 text-sm mb-4">{plan.descripcion}</p>
                <p className="text-3xl font-bold text-blue-600 mb-4">
                  {plan.precio === 0 ? "Gratis" : `$${plan.precio}/mes`}
                </p>
                <ul className="text-sm text-gray-600 space-y-1 flex-1">
                  {plan.caracteristicas.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
                <button
                  onClick={() => setMostrarRegistro(true)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Elegir
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal de registro */}
      {mostrarRegistro && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Registrar negocio</h3>
              <button
                onClick={() => setMostrarRegistro(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-semibold text-gray-700">Datos del negocio</h4>
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Nombre del negocio *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email del negocio *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Teléfono"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Dirección"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <h4 className="font-semibold text-gray-700 pt-2">Cuenta de administrador</h4>
              <input
                name="adminNombre"
                value={formData.adminNombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={handleChange}
                required
                placeholder="Tu email *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={handleChange}
                required
                placeholder="Contraseña (mayúscula, minúscula, número y símbolo) *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirmar contraseña *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? "Registrando..." : "Crear mi negocio"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
