import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import OperacionesDia from "./pages/OperacionesDia";
import Deudas from "./pages/Deudas";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";
import Estadisticas from "./pages/Estadisticas";
import Configuracion from "./pages/Configuracion";
import Sebastian from "./pages/Sebastian";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <OperacionesDia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dia/:fecha"
          element={
            <ProtectedRoute>
              <OperacionesDia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deudas"
          element={
            <ProtectedRoute>
              <Deudas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <ProtectedRoute>
              <Estadisticas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracion"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Configuracion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sebastian"
          element={
            <ProtectedRoute>
              <Sebastian />
            </ProtectedRoute>
          }
        />

        {/* Redirecciones de rutas antiguas */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/pedidos" element={<Navigate to="/" replace />} />
        <Route path="/calendario" element={<Navigate to="/" replace />} />
        <Route path="/menu" element={<Navigate to="/" replace />} />
        <Route path="/cuenta" element={<Navigate to="/deudas" replace />} />
        <Route path="/caja" element={<Navigate to="/" replace />} />
        <Route path="/ventas-anonimas" element={<Navigate to="/" replace />} />
        <Route path="/configuracion-menu" element={<Navigate to="/productos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
