import express from "express";
import {
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  crearNotificacion,
  eliminarNotificacion
} from "../controllers/notificacionesController.js";

const router = express.Router();

router.get("/", obtenerNotificaciones);
router.post("/", crearNotificacion);
router.patch("/:id/leer", marcarComoLeida);
router.patch("/todas/leer", marcarTodasComoLeidas);
router.delete("/:id", eliminarNotificacion);

export default router;
