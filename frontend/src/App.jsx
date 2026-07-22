import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Pedidos from "./pages/Pedidos";
import Clientes from "./pages/Clientes";
import Caja from "./pages/Caja";
import Configuracion from "./pages/Configuracion";
import CuentaCorriente from "./pages/CuentaCorriente";
import Productos from "./pages/Productos";
import MenuHoy from "./pages/MenuHoy";
import VentasAnonimas from "./pages/VentasAnonimas";
import Estadisticas from "./pages/Estadisticas";
import ConfiguracionMenu from "./pages/ConfiguracionMenu";
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
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/pedidos" 
          element={
            <ProtectedRoute>
              <Pedidos />
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
          path="/caja" 
          element={
            <ProtectedRoute>
              <Caja />
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
          path="/cuenta" 
          element={
            <ProtectedRoute>
              <CuentaCorriente />
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
        path="/menu"
        element={
          <ProtectedRoute>
            <MenuHoy />
          </ProtectedRoute>
        }
        />

        <Route
        path="/ventas-anonimas"
        element={
          <ProtectedRoute>
            <VentasAnonimas />
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
        path="/configuracion-menu"
        element={
          <ProtectedRoute>
            <ConfiguracionMenu />
          </ProtectedRoute>
        }
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;