import { useMemo } from "react";
import { motion } from "framer-motion";

export default function FloatingStats({ clients, visits, dailyRevenue, totalDebts, appointments }) {
  const weekFollowUps = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const endStr = weekEnd.toISOString().slice(0, 10);
    const apps = appointments.filter((a) => a.date >= today && a.date <= endStr);
    const urgent = apps.filter((a) => a.date === today || a.date === new Date(Date.now() + 86400000).toISOString().slice(0, 10));
    return { total: apps.length, urgent: urgent.length };
  }, [appointments]);

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
      className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-2xl border px-5 py-3 shadow-2xl backdrop-blur-2xl flex items-center gap-4"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: `rgba(var(--warning-rgb), ${weekFollowUps.urgent > 0 ? 0.3 : 0.15})`,
        boxShadow: weekFollowUps.urgent > 0
          ? "0 0 30px rgba(var(--warning-rgb), 0.1), 0 8px 32px rgba(0,0,0,0.3)"
          : "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <span className="text-sm">📅</span>
      <div className="flex items-baseline gap-1.5">
        <strong className="text-base font-black" style={{ color: weekFollowUps.urgent > 0 ? "var(--danger)" : "var(--warning)" }}>
          {weekFollowUps.total}
        </strong>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>حالة متبقية هذا الأسبوع</span>
      </div>
      {weekFollowUps.urgent > 0 && (
        <>
          <div className="h-5 w-px" style={{ backgroundColor: "var(--border-light)" }} />
          <div className="flex items-baseline gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
              style={{ backgroundColor: "rgba(var(--danger-rgb), 0.15)", color: "var(--danger)" }}>
              {weekFollowUps.urgent}
            </span>
            <span className="text-[10px] font-medium" style={{ color: "var(--danger)" }}>
              🔥 اليوم أو بكرا
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}
