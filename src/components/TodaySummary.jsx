import { motion } from "framer-motion";

export default function TodaySummary({ todayPatients, todayRevenue, upcomingAppointments }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold flex items-center gap-2" style={{ color: "var(--warning)" }}>
          <span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px]" style={{ backgroundColor: "rgba(var(--warning-rgb), 0.12)" }}>📊</span>
          ملخص اليوم
        </h2>
        <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>
          {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <SummaryCard icon="👥" label="المرضى" value={todayPatients} color="var(--accent2)" />
        <SummaryCard icon="💰" label="الإيراد" value={`${todayRevenue} ج.م`} color="var(--accent)" />
        <SummaryCard icon="📅" label="المواعيد" value={upcomingAppointments} color="var(--info)" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="rounded-lg p-2.5 text-[10px] leading-relaxed"
        style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-light)", color: "var(--text-muted)" }}
      >
        💡 <strong>اختصارات:</strong> <kbd>/</kbd> بحث · <kbd>Ctrl+Enter</kbd> حفظ · <kbd>Esc</kbd> إغلاق
      </motion.div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <div className="rounded-xl border p-2.5 text-center" style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}>
      <div className="text-base mb-0.5">{icon}</div>
      <div className="text-sm font-bold" style={{ color }}>{value}</div>
      <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>{label}</div>
    </div>
  );
}
