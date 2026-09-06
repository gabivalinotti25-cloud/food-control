import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Pedidos from "./pages/Pedidos";
import Clientes from "./pages/Clientes";
import Caja from "./pages/Caja";
import Configuracion from "./pages/Configuracion";
import CuentaCorriente from "./pages/CuentaCorriente";
import Productos from "./pages/Productos";
import MenuHoy from "./pages/MenuHoy";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route 
          path="/" 
          element={<Dashboard />} 
        />

        <Route 
          path="/dashboard" 
          element={<Dashboard />} 
        />

        <Route 
          path="/pedidos" 
          element={<Pedidos />} 
        />

        <Route 
          path="/clientes" 
          element={<Clientes />} 
        />

        <Route 
          path="/caja" 
          element={<Caja />} 
        />

        <Route 
          path="/configuracion" 
          element={<Configuracion />} 
        />

        <Route 
          path="/cuenta" 
          element={<CuentaCorriente />} 
        />

        <Route 
          path="/productos" 
          element={<Productos />} 
        />

        <Route
        path="/menu"
        element={<MenuHoy />}
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;