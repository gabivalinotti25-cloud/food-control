import { Router } from "express";
import { registrarDeudaAntigua } from "../controllers/deudasAntiguasController.js";

const router = Router();

router.post("/", registrarDeudaAntigua);

export default router;