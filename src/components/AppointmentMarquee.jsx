import { useMemo } from "react";
import { motion } from "framer-motion";

export default function AppointmentMarquee({ appointments, onSelect }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const uniqueApps = useMemo(() => {
    const seen = new Set();
    return appointments
      .filter((a) => a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter((a) => {
        const key = `${a.name}|${a.animal}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);
  }, [appointments, today]);

  if (uniqueApps.length === 0) return null;

  return (
    <div className="mx-auto mb-4 max-w-7xl rounded-xl border backdrop-blur-sm"
      style={{
        borderColor: "var(--border-light)",
        backgroundColor: "var(--bg-card)",
        boxShadow: "0 0 24px rgba(var(--accent-rgb), 0.04), var(--shadow-card)",
      }}>
      <div className="flex items-center gap-3 p-2 overflow-x-auto">
        <div className="shrink-0 z-10 rounded-xl px-3 py-2 text-[10px] font-bold flex items-center gap-1.5"
          style={{
            background: "linear-gradient(135deg, rgba(var(--warning-rgb), 0.2), rgba(var(--warning-rgb), 0.08))",
            border: "1px solid rgba(var(--warning-rgb), 0.2)",
            color: "var(--warning)",
            boxShadow: "0 0 16px rgba(var(--warning-rgb), 0.08)",
          }}>
          <span className="text-sm">📅</span>
          <span>مواعيد الأسبوع</span>
        </div>

        <motion.div
          className="flex gap-3"
          initial={{ x: "100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {uniqueApps.map((a) => (
            <ApptCard key={a.id} app={a} onSelect={onSelect} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function ApptCard({ app, onSelect }) {
  const today = new Date().toISOString().slice(0, 10);
  const diff = Math.ceil((new Date(app.date) - new Date(today)) / (1000 * 60 * 60 * 24));
  const isUrgent = diff <= 1;
  const isSoon = diff <= 3;

  const urgencyColor = isUrgent ? "var(--danger)" : isSoon ? "var(--warning)" : "var(--accent)";
  const urgencyRgb = isUrgent ? "var(--danger-rgb)" : isSoon ? "var(--warning-rgb)" : "var(--accent-rgb)";
  const bgOp = isUrgent ? "0.1" : isSoon ? "0.07" : "0.04";

  return (
    <button
      onClick={() => onSelect?.(app)}
      className="shrink-0 rounded-xl text-right transition-all cursor-pointer hover:scale-[1.04] active:scale-95"
      style={{
        width: 180,
        background: `linear-gradient(135deg, rgba(${urgencyRgb}, ${bgOp}), rgba(${urgencyRgb}, 0.02))`,
        border: `1px solid rgba(${urgencyRgb}, ${isUrgent ? 0.3 : isSoon ? 0.2 : 0.12})`,
        boxShadow: `0 0 20px rgba(${urgencyRgb}, ${isUrgent ? 0.08 : isSoon ? 0.04 : 0.02}), inset 0 0 20px rgba(${urgencyRgb}, 0.02)`,
        padding: "8px 12px",
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[11px] font-bold truncate" style={{ color: "var(--text)" }}>
          {app.animal}
        </span>
        <span className="rounded-md px-1.5 py-0.5 text-[8px] font-bold whitespace-nowrap"
          style={{
            backgroundColor: `rgba(${urgencyRgb}, 0.15)`,
            color: urgencyColor,
          }}
        >
          {diff === 0 ? "🔥 اليوم" : diff === 1 ? "بكرا" : `بعد ${diff} أيام`}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>👤 {app.name}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="h-1.5 w-1.5 rounded-full" style={{
          backgroundColor: urgencyColor,
          boxShadow: `0 0 6px ${urgencyColor}`,
          animation: "pulse-glow 1.5s ease-in-out infinite",
        }} />
        <span className="text-[8px] truncate" style={{ color: "var(--text-dim)" }}>
          {app.reason || "متابعة"}
        </span>
      </div>
    </button>
  );
}
