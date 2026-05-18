import { useMemo } from "react";
import { motion } from "framer-motion";

export default function MedicalTimeline({ client, visits: allVisits, onClose }) {
  const visits = useMemo(() => {
    if (!client) return [];
    return allVisits
      .filter((v) => v.name === client.name && v.animal === client.animal)
      .sort((a, b) => b.id - a.id);
  }, [client, allVisits]);

  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: "var(--overlay)" }} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "var(--bg-card-solid)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b p-4 backdrop-blur-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-light)" }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>
              📋 التاريخ الطبي — {client.name}
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {client.animal} ({client.type}) {client.gender === "ذكر" ? "♂" : "♀"}
              {client.weight && ` ⚖️ ${client.weight} كجم`}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-[10px]" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>✕ إغلاق</button>
        </div>

        {/* Timeline */}
        <div className="p-5">
          {visits.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-xs" style={{ color: "var(--text-dim)" }}>
              <span className="text-2xl mb-2 opacity-30">📋</span>
              لا توجد زيارات سابقة
            </div>
          ) : (
            <div className="space-y-0">
              {visits.map((v, idx) => {
                const servicesList = v.services ? v.services.split("، ").filter(Boolean) : [];
                return (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative flex gap-4 pb-6"
                  >
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center">
                      <div className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold"
                        style={{ backgroundColor: v.status === "مدفوع بالكامل ✓" ? "rgba(var(--accent-rgb), 0.15)" : "rgba(var(--danger-rgb), 0.15)", color: v.status === "مدفوع بالكامل ✓" ? "var(--accent)" : "var(--danger)", border: `2px solid ${v.status === "مدفوع بالكامل ✓" ? "var(--accent)" : "var(--danger)"}` }}>
                        {v.status === "مدفوع بالكامل ✓" ? "✓" : "!"}
                      </div>
                      {idx < visits.length - 1 && (
                        <div className="h-full w-px" style={{ backgroundColor: "var(--border-light)" }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 -mt-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold" style={{ color: "var(--text)" }}>{v.date}</span>
                        {v.doctor && <span className="text-[8px] rounded-full px-1.5 py-0.5" style={{ backgroundColor: "rgba(var(--accent3-rgb), 0.1)", color: "var(--accent3)" }}>{v.doctor}</span>}
                        <span className="text-[9px] rounded-full px-1.5 py-0.5" style={{ backgroundColor: "var(--bg-input)", color: "var(--text-muted)" }}>
                          {v.total} ج.م
                        </span>
                      </div>

                      {/* Services */}
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {servicesList.map((s, i) => (
                          <span key={i} className="rounded-md px-1.5 py-0.5 text-[9px]" style={{ backgroundColor: "rgba(var(--accent-rgb), 0.08)", color: "var(--accent)" }}>
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Weight + Notes + Audio */}
                      <div className="flex flex-wrap gap-3 text-[9px]" style={{ color: "var(--text-dim)" }}>
                        {v.weight && <span>⚖️ {v.weight} كجم</span>}
                        {v.paid > 0 && <span style={{ color: "var(--accent)" }}>✅ مدفوع: {v.paid} ج.م</span>}
                        {v.debt > 0 && <span style={{ color: "var(--danger)" }}>💰 متبقي: {v.debt} ج.م</span>}
                        {v.audio && <span>🎤 تسجيل</span>}
                      </div>

                      {/* Notes */}
                      {v.notes && (
                        <div className="mt-1.5 rounded-lg border p-2 text-[9px] leading-relaxed" style={{ borderColor: "rgba(var(--warning-rgb), 0.15)", backgroundColor: "rgba(var(--warning-rgb), 0.04)", color: "var(--text-muted)" }}>
                          📝 {v.notes}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
