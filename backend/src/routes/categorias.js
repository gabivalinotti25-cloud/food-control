import { Router } from "express";
import {
  listarCategorias,
  crearCategoria,
} from "../controllers/categoriasController.js";

const router = Router();

router.get("/", listarCategorias);
router.post("/", crearCategoria);

export default router;