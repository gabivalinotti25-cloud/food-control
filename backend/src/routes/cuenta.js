import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Ruta cuenta funcionando",
  });
});

export default router;