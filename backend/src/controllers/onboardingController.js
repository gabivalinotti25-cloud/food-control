import prisma from "../prisma.js";

const PASOS = [
  { id: 0, nombre: "Completar información del negocio", descripcion: "Agrega teléfono, dirección y datos básicos" },
  { id: 1, nombre: "Crear tus primeros productos", descripcion: "Carga los productos que vendes" },
  { id: 2, nombre: "Configurar el menú semanal", descripcion: "Define qué productos se ofrecen cada día" },
  { id: 3, nombre: "Agregar tus primeros clientes", descripcion: "Registra clientes para llevar sus cuentas" },
  { id: 4, nombre: "Registrar tu primer pedido", descripcion: "Haz un pedido de prueba" },
  { id: 5, nombre: "Conocer a Sebastian", descripcion: "Prueba el asistente de IA" },
  { id: 6, nombre: "Personalizar tu marca", descripcion: "Sube tu logo y elige tus colores" },
];

export async function iniciarOnboarding(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const existente = await prisma.onboarding.findUnique({ where: { negocioId } });
    if (existente) {
      return res.json({ onboarding: existente, pasos: PASOS });
    }

    const onboarding = await prisma.onboarding.create({
      data: { negocioId, estado: "EN_PROGRESO" },
    });

    res.status(201).json({ onboarding, pasos: PASOS });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar onboarding" });
  }
}

export async function obtenerEstadoOnboarding(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    let onboarding = await prisma.onboarding.findUnique({ where: { negocioId } });

    if (!onboarding) {
      onboarding = await prisma.onboarding.create({
        data: { negocioId, estado: "PENDIENTE" },
      });
    }

    const progreso = Math.round(
      (onboarding.pasosCompletados.length / PASOS.length) * 100
    );

    res.json({ onboarding, pasos: PASOS, progreso });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener estado del onboarding" });
  }
}

export async function actualizarPasoOnboarding(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { paso } = req.body;

    if (paso === undefined || paso < 0 || paso >= PASOS.length) {
      return res.status(400).json({ error: "Paso inválido" });
    }

    const onboarding = await prisma.onboarding.update({
      where: { negocioId },
      data: { pasoActual: paso, estado: "EN_PROGRESO" },
    });

    res.json({ onboarding, pasos: PASOS });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar paso" });
  }
}

export async function marcarAccionCompletada(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { paso } = req.body;

    if (paso === undefined || paso < 0 || paso >= PASOS.length) {
      return res.status(400).json({ error: "Paso inválido" });
    }

    const actual = await prisma.onboarding.findUnique({ where: { negocioId } });
    if (!actual) {
      return res.status(404).json({ error: "Onboarding no encontrado" });
    }

    const completados = new Set(actual.pasosCompletados);
    completados.add(paso);
    const pasosCompletados = Array.from(completados).sort((a, b) => a - b);

    const completado = pasosCompletados.length === PASOS.length;

    const onboarding = await prisma.onboarding.update({
      where: { negocioId },
      data: {
        pasosCompletados,
        pasoActual: completado ? actual.pasoActual : Math.min(paso + 1, PASOS.length - 1),
        estado: completado ? "COMPLETADO" : "EN_PROGRESO",
        completadoAt: completado ? new Date() : null,
      },
    });

    res.json({ onboarding, pasos: PASOS, completado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al marcar acción" });
  }
}

export async function omitirOnboarding(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const onboarding = await prisma.onboarding.update({
      where: { negocioId },
      data: { estado: "OMITIDO", completadoAt: new Date() },
    });

    res.json({ onboarding, mensaje: "Onboarding omitido" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al omitir onboarding" });
  }
}

export async function reiniciarOnboarding(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const onboarding = await prisma.onboarding.update({
      where: { negocioId },
      data: {
        estado: "EN_PROGRESO",
        pasoActual: 0,
        pasosCompletados: [],
        completadoAt: null,
      },
    });

    res.json({ onboarding, pasos: PASOS, mensaje: "Onboarding reiniciado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al reiniciar onboarding" });
  }
}

export async function obtenerPasosOnboarding(req, res) {
  res.json(PASOS);
}
