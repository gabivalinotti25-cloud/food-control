// Servicio de emails transaccionales con Resend
// Si RESEND_API_KEY no está configurada, los emails se omiten silenciosamente

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Food Control <noreply@food-control.app>";

async function enviarEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.log(`📧 Email omitido (sin RESEND_API_KEY): ${subject} → ${to}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`Error enviando email a ${to}:`, error);
    }
  } catch (error) {
    console.error(`Error enviando email a ${to}:`, error.message);
  }
}

export function emailBienvenida({ email, nombreNegocio, nombreAdmin }) {
  return enviarEmail({
    to: email,
    subject: `Bienvenido a Food Control, ${nombreNegocio}`,
    html: `
      <h2>¡Hola ${nombreAdmin}!</h2>
      <p>Tu negocio <strong>${nombreNegocio}</strong> ya está registrado en Food Control.</p>
      <p>Tenés <strong>30 días de prueba gratuita</strong> para explorar todas las funciones.</p>
      <p>Para empezar, completá la configuración inicial desde tu panel.</p>
      <br>
      <p>— El equipo de Food Control</p>
    `,
  });
}

export function emailFacturaEmitida({ email, nombreNegocio, numero, total, fechaVencimiento }) {
  const formatoGs = (v) => new Intl.NumberFormat("es-PY").format(v || 0);
  return enviarEmail({
    to: email,
    subject: `Factura ${numero} - Food Control`,
    html: `
      <h2>Nueva factura emitida</h2>
      <p>Hola <strong>${nombreNegocio}</strong>,</p>
      <p>Se emitió la factura <strong>${numero}</strong> por <strong>Gs. ${formatoGs(total)}</strong>.</p>
      <p>Vencimiento: <strong>${new Date(fechaVencimiento).toLocaleDateString("es-PY")}</strong></p>
      <p>Podés verla y gestionar el pago desde tu panel de Suscripción.</p>
      <br>
      <p>— El equipo de Food Control</p>
    `,
  });
}
