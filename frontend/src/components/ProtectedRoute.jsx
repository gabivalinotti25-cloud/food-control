import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && usuario.rol !== requiredRole && usuario.rol !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}
