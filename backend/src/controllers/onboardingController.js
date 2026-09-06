import prisma from "../prisma.js";

// Pasos del onboarding
const PASOS_ONBOARDING = [
  {
    id: "bienvenida",
    titulo: "¡Bienvenido a Food Control!",
    descripcion: "Te guiaremos paso a paso para configurar tu negocio.",
  },
  {
    id: "negocio_info",
    titulo: "Información del Negocio",
    descripcion: "Completa la información básica de tu negocio.",
    campos: ["negocioNombre", "negocioTipo", "negocioHorarios", "negocioUbicacion"],
  },
  {
    id: "productos",
    titulo: "Crear Productos",
    descripcion: "Agrega tus primeros productos al menú.",
    accion: "productosCreados",
  },
  {
    id: "clientes",
    titulo: "Agregar Clientes",
    descripcion: "Importa o agrega tus clientes principales.",
    accion: "clientesCreados",
  },
  {
    id: "menu",
    titulo: "Configurar Menú",
    descripcion: "Organiza tu menú diario.",
    accion: "menuConfigurado",
  },
  {
    id: "whatsapp",
    titulo: "Configurar WhatsApp",
    descripcion: "Conecta WhatsApp para notificaciones.",
    accion: "whatsappConfigurado",
    opcional: true,
  },
  {
    id: "completado",
    titulo: "¡Listo!",
    descripcion: "Tu negocio está configurado y listo para usar.",
  },
];

export async function iniciarOnboarding(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    // Verificar si ya existe un onboarding para este negocio
    const onboardingExistente = await prisma.onboarding.findUnique({
      where: { negocioId },
    });

    if (onboardingExistente) {
      return res.json({
        mensaje: "Onboarding ya iniciado",
        onboarding: onboardingExistente,
        pasos: PASOS_ONBOARDING,
      });
    }

    // Crear onboarding nuevo
    const onboarding = await prisma.onboarding.create({
      data: {
        negocioId,
        estado: "PENDIENTE",
        pasoActual: 0,
      },
    });

    res.status(201).json({
      mensaje: "Onboarding iniciado exitosamente",
      onboarding,
      pasos: PASOS_ONBOARDING,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al iniciar onboarding",
    });
  }
}

export async function obtenerEstadoOnboarding(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const onboarding = await prisma.onboarding.findUnique({
      where: { negocioId },
    });

    if (!onboarding) {
      return res.json({
        onboarding: null,
        estado: "NO_INICIADO",
        pasos: PASOS_ONBOARDING,
      });
    }

    // Calcular progreso
    const progreso = Math.round((onboarding.pasoActual / (PASOS_ONBOARDING.length - 1)) * 100);

    res.json({
      onboarding,
      estado: onboarding.estado,
      progreso,
      pasos: PASOS_ONBOARDING,
      pasoActual: PASOS_ONBOARDING[onboarding.pasoActual],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener estado de onboarding",
    });
  }
}

export async function actualizarPasoOnboarding(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { paso, datos } = req.body;

    const onboarding = await prisma.onboarding.findUnique({
      where: { negocioId },
    });

    if (!onboarding) {
      return res.status(404).json({
        error: "Onboarding no encontrado",
      });
    }

    if (onboarding.estado === "COMPLETADO" || onboarding.estado === "OMITIDO") {
      return res.status(400).json({
        error: "El onboarding ya está completado u omitido",
      });
    }

    // Actualizar datos del paso
    const datosActualizados = {};
    const pasosCompletados = [...onboarding.pasosCompletados];

    if (datos) {
      if (datos.negocioNombre) datosActualizados.negocioNombre = datos.negocioNombre;
      if (datos.negocioTipo) datosActualizados.negocioTipo = datos.negocioTipo;
      if (datos.negocioHorarios) datosActualizados.negocioHorarios = datos.negocioHorarios;
      if (datos.negocioUbicacion) datosActualizados.negocioUbicacion = datos.negocioUbicacion;
    }

    // Marcar paso como completado
    if (!pasosCompletados.includes(PASOS_ONBOARDING[paso].id)) {
      pasosCompletados.push(PASOS_ONBOARDING[paso].id);
    }

    // Actualizar onboarding
    const onboardingActualizado = await prisma.onboarding.update({
      where: { negocioId },
      data: {
        ...datosActualizados,
        pasosCompletados,
        pasoActual: paso + 1,
        estado: paso + 1 >= PASOS_ONBOARDING.length - 1 ? "COMPLETADO" : "EN_PROGRESO",
        fechaCompletado: paso + 1 >= PASOS_ONBOARDING.length - 1 ? new Date() : null,
      },
    });

    // Si se completó el onboarding, actualizar el nombre del negocio si se proporcionó
    if (onboardingActualizado.estado === "COMPLETADO" && datosActualizados.negocioNombre) {
      await prisma.negocio.update({
        where: { id: negocioId },
        data: {
          nombre: datosActualizados.negocioNombre,
        },
      });
    }

    res.json({
      mensaje: "Paso actualizado exitosamente",
      onboarding: onboardingActualizado,
      siguientePaso: paso + 1 < PASOS_ONBOARDING.length ? PASOS_ONBOARDING[paso + 1] : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al actualizar paso de onboarding",
    });
  }
}

export async function marcarAccionCompletada(req, res) {
  try {
    const negocioId = req.usuario.negocioId;
    const { accion } = req.body; // productosCreados, clientesCreados, menuConfigurado, whatsappConfigurado

    const onboarding = await prisma.onboarding.findUnique({
      where: { negocioId },
    });

    if (!onboarding) {
      return res.status(404).json({
        error: "Onboarding no encontrado",
      });
    }

    // Verificar que la acción sea válida
    const accionesValidas = ["productosCreados", "clientesCreados", "menuConfigurado", "whatsappConfigurado"];
    if (!accionesValidas.includes(accion)) {
      return res.status(400).json({
        error: "Acción inválida",
      });
    }

    // Actualizar la acción
    const datosActualizados = {};
    datosActualizados[accion] = true;

    const onboardingActualizado = await prisma.onboarding.update({
      where: { negocioId },
      data: datosActualizados,
    });

    // Verificar si todas las acciones obligatorias están completadas
    accionesObligatorias = ["productosCreados", "clientesCreados", "menuConfigurado"];
    const todasCompletadas = accionesObligatorias.every(
      (accion) => onboardingActualizado[accion]
    );

    if (todasCompletadas && onboardingActualizado.estado !== "COMPLETADO") {
      // Avanzar al último paso
      const onboardingFinal = await prisma.onboarding.update({
        where: { negocioId },
        data: {
          pasoActual: PASOS_ONBOARDING.length - 1,
          estado: "COMPLETADO",
          fechaCompletado: new Date(),
        },
      });

      return res.json({
        mensaje: "Acción completada y onboarding finalizado",
        onboarding: onboardingFinal,
      });
    }

    res.json({
      mensaje: "Acción marcada como completada",
      onboarding: onboardingActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al marcar acción como completada",
    });
  }
}

export async function omitirOnboarding(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const onboarding = await prisma.onboarding.findUnique({
      where: { negocioId },
    });

    if (!onboarding) {
      return res.status(404).json({
        error: "Onboarding no encontrado",
      });
    }

    if (onboarding.estado === "COMPLETADO") {
      return res.status(400).json({
        error: "El onboarding ya está completado",
      });
    }

    // Marcar onboarding como omitido
    const onboardingActualizado = await prisma.onboarding.update({
      where: { negocioId },
      data: {
        estado: "OMITIDO",
      },
    });

    res.json({
      mensaje: "Onboarding omitido exitosamente",
      onboarding: onboardingActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al omitir onboarding",
    });
  }
}

export async function reiniciarOnboarding(req, res) {
  try {
    const negocioId = req.usuario.negocioId;

    const onboarding = await prisma.onboarding.update({
      where: { negocioId },
      data: {
        estado: "PENDIENTE",
        pasoActual: 0,
        pasosCompletados: [],
        productosCreados: false,
        clientesCreados: false,
        menuConfigurado: false,
        whatsappConfigurado: false,
        fechaCompletado: null,
      },
    });

    res.json({
      mensaje: "Onboarding reiniciado exitosamente",
      onboarding,
      pasos: PASOS_ONBOARDING,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al reiniciar onboarding",
    });
  }
}

export async function obtenerPasosOnboarding(req, res) {
  try {
    res.json({
      pasos: PASOS_ONBOARDING,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener pasos de onboarding",
    });
  }
}
