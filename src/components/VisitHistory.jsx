import { motion } from "framer-motion";
import WeightChart from "./WeightChart";

export default function VisitHistory({ client, visits, onVisitClick, onTimeline }) {
  const patientHistory = client
    ? visits.filter((v) => v.name === client.name && v.animal === client.animal)
    : [];

  if (!client || patientHistory.length === 0) return null;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
      initial="hidden" animate="visible"
      className="rounded-2xl border p-4 backdrop-blur-sm"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
    >
      <h2 className="mb-3 text-xs font-bold flex items-center gap-2" style={{ color: "var(--info)" }}>
        <span>📋</span>
        تاريخ {client.name} — {client.animal}
        <span className="mr-auto rounded-full px-2 py-0.5 text-[9px]" style={{ backgroundColor: "rgba(var(--info-rgb), 0.1)", color: "var(--info)" }}>
          {patientHistory.length}
        </span>
        {onTimeline && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onTimeline(); }}
            className="rounded-lg px-2 py-1 text-[8px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--accent3), var(--accent3-dark))" }}>
            🕐 السجل الطبي
          </motion.button>
        )}
      </h2>

      {/* Weight Chart */}
      <WeightChart visits={patientHistory} client={client} />

      {/* Visit List */}
      <div className="max-h-36 space-y-1.5 overflow-y-auto mt-2">
        {patientHistory.map((v) => (
          <div
            key={v.id}
            onClick={() => onVisitClick?.(v)}
            className="flex items-center justify-between rounded-lg border p-2 text-[10px] cursor-pointer hover:shadow-sm transition-all"
            style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}
          >
            <span style={{ color: "var(--text-muted)" }}>{v.date}</span>
            {v.doctor && <span className="text-[7px] rounded px-1" style={{ backgroundColor: "rgba(var(--accent3-rgb), 0.08)", color: "var(--accent3)" }}>{v.doctor}</span>}
            <span className="flex-1 px-2 truncate" style={{ color: "var(--text)" }}>{v.services}</span>
            <div className="flex items-center gap-1.5">
              {v.audio && <span className="text-[9px]">🎤</span>}
              {v.weight && <span className="text-[9px]" style={{ color: "var(--warning-dark)" }}>{v.weight}كجم</span>}
              <span className="font-bold" style={{ color: v.debt > 0 ? "var(--danger)" : "var(--accent)" }}>
                {v.total} ج.م
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
