import "dotenv/config";
import express from "express";
import cors from "cors";

import clientesRoutes from "./routes/clientes.js";
import pedidosRoutes from "./routes/pedidos.js";
import dashboardRoutes from "./routes/dashboard.js";
import deudasRoutes from "./routes/deudas.js";
import cuentaRoutes from "./routes/cuenta.js";
import pagosRoutes from "./routes/pagos.js";
import deudasAntiguasRoutes from "./routes/deudasAntiguas.js";
import productosRoutes from "./routes/productos.js";
import categoriasRoutes from "./routes/categorias.js";
import menuRoutes from "./routes/menu.js";
import cajaRoutes from "./routes/caja.js";
import configuracionMenuRoutes from "./routes/configuracionMenu.js";
import estadisticasRoutes from "./routes/estadisticas.js";
import backupRoutes from "./routes/backup.js";
import authRoutes from "./routes/auth.js";
import diaRoutes from "./routes/dia.js";
import sebastianRoutes from "./routes/sebastian.js";
import notificacionesRoutes from "./routes/notificaciones.js";
import historialRoutes from "./routes/historial.js";

const app = express();

app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: "Food Control API funcionando 🚀",
    version: "1.0.0",
  });
});

// Rutas
app.use("/auth", authRoutes);
app.use("/clientes", clientesRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/deudas", deudasRoutes);
app.use("/cuenta", cuentaRoutes);
app.use("/pagos", pagosRoutes);
app.use("/deudas-antiguas", deudasAntiguasRoutes);
app.use("/productos", productosRoutes);
app.use("/categorias", categoriasRoutes);
app.use("/menu", menuRoutes);
app.use("/dia", diaRoutes);
app.use("/caja", cajaRoutes);
app.use("/configuracion-menu", configuracionMenuRoutes);
app.use("/estadisticas", estadisticasRoutes);
app.use("/backup", backupRoutes);
app.use("/sebastian", sebastianRoutes);
app.use("/notificaciones", notificacionesRoutes);
app.use("/historial", historialRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});