export function formatoGs(valor) {
  return new Intl.NumberFormat("es-PY").format(valor || 0);
}

export function hoyISO() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-PY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatFechaCorta(fecha) {
  return new Date(fecha).toLocaleDateString("es-PY");
}

export const FORMAS_PAGO = [
  { value: "EFECTIVO", label: "Efectivo", color: "emerald" },
  { value: "TRANSFERENCIA", label: "Transferencia", color: "blue" },
  { value: "PENDIENTE", label: "Fiado / Deuda", color: "amber" },
];

export function labelPago(pedido) {
  if (pedido.estadoPago === "PENDIENTE") return "Fiado";
  if (pedido.pago?.forma === "EFECTIVO") return "Efectivo";
  if (pedido.pago?.forma === "TRANSFERENCIA") return "Transferencia";
  return "—";
}
