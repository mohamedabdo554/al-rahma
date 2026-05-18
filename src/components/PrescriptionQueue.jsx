import { motion, AnimatePresence } from "framer-motion";

function statusStyle(s) {
  return s === "pending"
    ? { borderColor: "rgba(var(--warning-rgb), 0.25)", backgroundColor: "rgba(var(--warning-rgb), 0.05)", badgeBg: "rgba(var(--warning-rgb), 0.12)", badgeColor: "var(--warning)" }
    : { borderColor: "rgba(var(--accent-rgb), 0.2)", backgroundColor: "rgba(var(--accent-rgb), 0.03)", badgeBg: "rgba(var(--accent-rgb), 0.1)", badgeColor: "var(--accent)" };
}

export default function PrescriptionQueue({ prescriptions, items, onDispense }) {
  const pending = prescriptions.filter((p) => p.status === "pending");
  const dispensed = prescriptions.filter((p) => p.status === "dispensed");

  return (
    <div className="card-premium p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px]" style={{ backgroundColor: "rgba(var(--info-rgb), 0.12)" }}>📋</span>
        <h3 className="text-[11px] font-bold" style={{ color: "var(--text)" }}>الوصفات الطبية</h3>
        {pending.length > 0 && (
          <span className="mr-auto rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: "rgba(var(--warning-rgb), 0.1)", color: "var(--warning)" }}>
            {pending.length} قيد الانتظار
          </span>
        )}
      </div>

      {prescriptions.length === 0 ? (
        <div className="py-8 text-center text-[11px]" style={{ color: "var(--text-dim)" }}>
          <span className="text-2xl block mb-2 opacity-30">📋</span>
          لا توجد وصفات طبية
        </div>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          <AnimatePresence>
            {[...pending, ...dispensed].map((rx) => {
              const rxItems = items.filter((i) => i.prescription_id === rx.id);
              const st = statusStyle(rx.status);
              return (
                <motion.div key={rx.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="rounded-xl border p-3 text-xs" style={{ borderColor: st.borderColor, backgroundColor: st.backgroundColor }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: "var(--text)" }}>{rx.patient_name}</span>
                        <span style={{ color: "var(--text-muted)" }}>— {rx.patient_animal}</span>
                        <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold" style={{ backgroundColor: st.badgeBg, color: st.badgeColor }}>
                          {rx.status === "pending" ? "بانتظار الصرف" : "تم الصرف ✓"}
                        </span>
                      </div>
                      <div className="mt-1 text-[9px]" style={{ color: "var(--text-dim)" }}>
                        {rx.doctor_name && <span>د. {rx.doctor_name} · </span>}
                        {rx.diagnosis && <span>التشخيص: {rx.diagnosis} · </span>}
                        <span>{rx.created_at}</span>
                      </div>
                      {rxItems.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {rxItems.map((item) => (
                            <div key={item.id} className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                              💊 {item.medicine_name} × {item.quantity_prescribed}{item.dosage ? ` (${item.dosage})` : ""}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {rx.status === "pending" && (
                      <motion.button whileTap={{ scale: 0.85 }}
                        onClick={() => onDispense(rx.id)}
                        className="rounded-lg border px-2.5 py-1.5 text-[9px] font-bold whitespace-nowrap transition-all shrink-0"
                        style={{ borderColor: "rgba(var(--accent-rgb), 0.3)", color: "var(--accent)", backgroundColor: "rgba(var(--accent-rgb), 0.06)" }}>
                        صرف ✓
                      </motion.button>
                    )}
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
