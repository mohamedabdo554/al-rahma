import { motion, AnimatePresence } from "framer-motion";

export default function AppointmentsList({ appointments, onRemind, onComplete, onDelete }) {
  return (
    <div className="glass-card p-4">
      <h2 className="mb-3 text-xs font-bold flex items-center gap-2" style={{ color: "var(--info)" }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px]" style={{ backgroundColor: "rgba(var(--info-rgb), 0.12)" }}>📅</span>
        الإعادات القادمة
        {appointments.length > 0 && (
          <span className="mr-auto rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: "rgba(var(--info-rgb), 0.1)", color: "var(--info)" }}>
            {appointments.length}
          </span>
        )}
      </h2>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-[11px]" style={{ color: "var(--text-dim)" }}>
          <span className="text-2xl mb-2 opacity-30">📅</span>
          <span>لا توجد مواعيد متابعة</span>
        </div>
      ) : (
        <div className="max-h-52 space-y-2 overflow-y-auto">
          <AnimatePresence>
            {appointments.map((a) => {
              const isPast = a.date < new Date().toISOString().slice(0, 10);
              const isToday = a.date === new Date().toISOString().slice(0, 10);
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  className="rounded-xl border p-2.5 text-xs transition-all"
                  style={{
                    borderColor: isToday ? "rgba(var(--info-rgb), 0.3)" : "var(--border-light)",
                    backgroundColor: isToday ? "rgba(var(--info-rgb), 0.04)" : "var(--bg-input)",
                    borderRight: isToday ? "3px solid var(--info)" : "3px solid transparent",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate" style={{ color: "var(--text)" }}>{a.name}</span>
                        <span style={{ color: "var(--text-muted)" }}>— {a.animal}</span>
                        {isToday && (
                          <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold" style={{ backgroundColor: "rgba(var(--info-rgb), 0.15)", color: "var(--info)" }}>
                            اليوم
                          </span>
                        )}
                        {isPast && !isToday && (
                          <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold" style={{ backgroundColor: "rgba(var(--danger-rgb), 0.1)", color: "var(--danger)" }}>
                            فات
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[10px]" style={{ color: "var(--text-dim)" }}>
                        {a.date}{a.time ? ` ${a.time}` : ""} | <span style={{ color: "var(--info)" }}>{a.reason}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => onRemind(a)}
                        className="rounded-lg border px-2 py-1 text-[9px] font-medium transition-all"
                        style={{ borderColor: "rgba(var(--accent-rgb), 0.2)", color: "var(--accent)" }}
                      >
                        📱
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => onComplete(a)}
                        className="rounded-lg border px-2 py-1 text-[9px] font-medium transition-all"
                        style={{ borderColor: "rgba(16,185,129,0.2)", color: "var(--accent)" }}
                      >
                        ✓
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => onDelete(a.id)}
                        className="rounded-lg border px-2 py-1 text-[9px] font-medium transition-all"
                        style={{ borderColor: "rgba(var(--danger-rgb), 0.2)", color: "var(--danger)" }}
                      >
                        ✕
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
