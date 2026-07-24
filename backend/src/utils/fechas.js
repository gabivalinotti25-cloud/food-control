export function parseFechaDia(fechaStr) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  const inicio = new Date(y, m - 1, d, 0, 0, 0, 0);
  const fin = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  return { inicio, fin };
}

export function hoyISO() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fechaDiaExacta(fechaStr) {
  const { inicio } = parseFechaDia(fechaStr);
  return inicio;
}
