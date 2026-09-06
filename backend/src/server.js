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
import authRoutes from "./routes/auth.js";
import negociosRoutes from "./routes/negocios.js";
import suscripcionesRoutes from "./routes/suscripciones.js";
import whatsappRoutes from "./routes/whatsapp.js";
import facturacionRoutes from "./routes/facturacion.js";
import onboardingRoutes from "./routes/onboarding.js";
import personalizacionRoutes from "./routes/personalizacion.js";

const app = express();

app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: "Food Control API funcionando 🚀",
  });
});

// Rutas
app.use("/auth", authRoutes);
app.use("/negocios", negociosRoutes);
app.use("/suscripciones", suscripcionesRoutes);
app.use("/whatsapp", whatsappRoutes);
app.use("/facturacion", facturacionRoutes);
app.use("/onboarding", onboardingRoutes);
app.use("/personalizacion", personalizacionRoutes);
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

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});