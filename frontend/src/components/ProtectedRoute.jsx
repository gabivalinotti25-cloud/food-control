import { Navigate, useLocation } from "react-router-dom";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : {};
  } catch {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    return {};
  }
}

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const usuario = getStoredUser();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && usuario.rol !== requiredRole && usuario.rol !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}
