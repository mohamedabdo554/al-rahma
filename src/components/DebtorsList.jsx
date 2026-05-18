import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DebtorsList({ clients, onWhatsApp }) {
  const [showAll, setShowAll] = useState(false);
  const debtors = clients.filter((c) => c.debt > 0).sort((a, b) => b.debt - a.debt);
  const totalDebt = debtors.reduce((s, c) => s + c.debt, 0);
  const displayed = showAll ? debtors : debtors.slice(0, 5);

  function sendToAll() {
    const withPhone = debtors.filter((c) => c.phone);
    if (withPhone.length === 0) return;
    // Send first debtor's WhatsApp in current window, rest open in background
    withPhone.forEach((c, i) => {
      setTimeout(() => onWhatsApp(c), i * 800);
    });
  }

  return (
    <div className="glass-card p-4">
      <h2 className="mb-3 text-xs font-bold flex items-center gap-2" style={{ color: "var(--danger)" }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px]" style={{ backgroundColor: "rgba(var(--danger-rgb), 0.12)" }}>🏦</span>
        قائمة المدينين
        {debtors.length > 0 && (
          <span className="mr-auto rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: "rgba(var(--danger-rgb), 0.1)", color: "var(--danger)" }}>
            {totalDebt} ج.م
          </span>
        )}
      </h2>

      {debtors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-[11px]" style={{ color: "var(--text-dim)" }}>
          <span className="text-xl mb-1">✅</span>
          <span>لا يوجد عملاء عليهم ديون</span>
        </div>
      ) : (
        <>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            <AnimatePresence>
              {displayed.map((c) => (
                <motion.div key={c.id} layout
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl border p-2.5 text-xs flex items-center justify-between"
                  style={{ borderColor: "rgba(var(--danger-rgb), 0.15)", backgroundColor: "rgba(var(--danger-rgb), 0.03)" }}>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold" style={{ color: "var(--text)" }}>{c.name}</span>
                    <span className="mr-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>{c.animal} ({c.type})</span>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--text-dim)" }}>{c.phone || "—"}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-sm" style={{ color: "var(--danger)" }}>{c.debt} <span className="text-[9px] font-normal">ج.م</span></span>
                    {c.phone && (
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => onWhatsApp(c)}
                        className="rounded-lg border px-2 py-1 text-[9px]"
                        style={{ borderColor: "rgba(var(--accent-rgb), 0.2)", color: "var(--accent)" }}>
                        📱
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            {debtors.length > 5 && (
              <button onClick={() => setShowAll(!showAll)}
                className="rounded-lg border px-2.5 py-1 text-[9px] font-medium"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                {showAll ? "إخفاء" : `عرض الكل (${debtors.length})`}
              </button>
            )}
            {debtors.filter((c) => c.phone).length > 1 && (
              <button onClick={sendToAll}
                className="rounded-lg border px-2.5 py-1 text-[9px] font-medium"
                style={{ borderColor: "rgba(var(--accent-rgb), 0.2)", color: "var(--accent)" }}>
                📱 إرسال للكل ({debtors.filter((c) => c.phone).length})
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
