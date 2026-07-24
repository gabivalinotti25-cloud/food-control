import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatFechaCorta, hoyISO } from "../utils/format";

export default function CalendarStrip({ fecha, onChange }) {
  const navigate = useNavigate();

  const dias = useMemo(() => {
    const base = new Date(fecha + "T12:00:00");
    const items = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      items.push({
        iso,
        dia: d.getDate(),
        nombre: d.toLocaleDateString("es-PY", { weekday: "short" }),
        esHoy: iso === hoyISO(),
        esSeleccionado: iso === fecha,
      });
    }
    return items;
  }, [fecha]);

  function irDia(iso) {
    onChange(iso);
    navigate(iso === hoyISO() ? "/" : `/dia/${iso}`);
  }

  return (
    <div className="fc-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Calendario
          </p>
          <h2 className="text-lg font-bold capitalize text-slate-900">
            {new Date(fecha + "T12:00:00").toLocaleDateString("es-PY", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fecha}
            onChange={(e) => irDia(e.target.value)}
            className="fc-input w-auto"
          />
          {fecha !== hoyISO() && (
            <button onClick={() => irDia(hoyISO())} className="fc-btn fc-btn-primary">
              Hoy
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dias.map((d) => (
          <button
            key={d.iso}
            onClick={() => irDia(d.iso)}
            className={`rounded-xl p-3 text-center transition border ${
              d.esSeleccionado
                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                : d.esHoy
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 hover:border-blue-300"
            }`}
          >
            <p className="text-[10px] uppercase font-semibold opacity-80">{d.nombre}</p>
            <p className="text-xl font-bold mt-0.5">{d.dia}</p>
            {d.esHoy && !d.esSeleccionado && (
              <p className="text-[10px] mt-1 font-medium">Hoy</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ResumenDiaCards({ resumen }) {
  if (!resumen) return null;
  const cards = [
    { label: "Efectivo", value: resumen.efectivo, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Transferencia", value: resumen.transferencia, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Fiado del día", value: resumen.fiado, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total vendido", value: resumen.totalVendido, color: "text-slate-900", bg: "bg-slate-100" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`fc-card p-4 ${c.bg} border-0`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.label}</p>
          <p className={`text-2xl font-bold mt-1 ${c.color}`}>
            Gs. {new Intl.NumberFormat("es-PY").format(c.value || 0)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function BadgePago({ pedido }) {
  if (pedido.estadoPago === "PENDIENTE") {
    return <span className="fc-badge fc-badge-amber">Fiado</span>;
  }
  if (pedido.pago?.forma === "EFECTIVO") {
    return <span className="fc-badge fc-badge-green">Efectivo</span>;
  }
  if (pedido.pago?.forma === "TRANSFERENCIA") {
    return <span className="fc-badge fc-badge-blue">Transferencia</span>;
  }
  return <span className="fc-badge fc-badge-gray">—</span>;
}

export { formatFechaCorta };
