import { Router } from "express";
import {
  registrar,
  login,
  obtenerPerfil,
  listarUsuarios,
  actualizarUsuario,
  cambiarPassword,
} from "../controllers/authController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { verificarLimite } from "../middleware/limites.js";
import { validar, schemaLogin, schemaRegistrarUsuario } from "../middleware/validar.js";

const router = Router();

// Rutas públicas
router.post("/registrar", validar(schemaRegistrarUsuario), verificarLimite("usuarios"), registrar);
router.post("/login", validar(schemaLogin), login);

// Rutas protegidas
router.get("/perfil", authMiddleware, obtenerPerfil);
router.get("/usuarios", authMiddleware, adminMiddleware, listarUsuarios);
router.put("/usuarios/:id", authMiddleware, adminMiddleware, actualizarUsuario);
router.put("/cambiar-password", authMiddleware, cambiarPassword);

export default router;