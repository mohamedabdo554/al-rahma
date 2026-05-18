import { useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function FloatingStats({ clients, visits, dailyRevenue, totalDebts, appointments }) {
  const [dismissed, setDismissed] = useState(false);
  const weekFollowUps = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const endStr = weekEnd.toISOString().slice(0, 10);
    const apps = appointments.filter((a) => a.date >= today && a.date <= endStr);
    const urgent = apps.filter((a) => a.date === today || a.date === new Date(Date.now() + 86400000).toISOString().slice(0, 10));
    return { total: apps.length, urgent: urgent.length };
  }, [appointments]);

  if (dismissed || weekFollowUps.total === 0) return null;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
      className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-2xl border px-3 py-2 shadow-2xl backdrop-blur-2xl flex items-center gap-3"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: `rgba(var(--warning-rgb), ${weekFollowUps.urgent > 0 ? 0.3 : 0.15})`,
        boxShadow: weekFollowUps.urgent > 0
          ? "0 0 30px rgba(var(--warning-rgb), 0.1), 0 8px 32px rgba(0,0,0,0.3)"
          : "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <span className="text-sm">📅</span>
      <div className="flex items-baseline gap-1">
        <strong className="text-sm font-black" style={{ color: weekFollowUps.urgent > 0 ? "var(--danger)" : "var(--warning)" }}>
          {weekFollowUps.total}
        </strong>
        <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>متابعة</span>
      </div>
      {weekFollowUps.urgent > 0 && (
        <>
          <div className="h-4 w-px" style={{ backgroundColor: "var(--border-light)" }} />
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] font-bold"
            style={{ backgroundColor: "rgba(var(--danger-rgb), 0.15)", color: "var(--danger)" }}>
            {weekFollowUps.urgent}
          </span>
        </>
      )}
      <button onClick={() => setDismissed(true)}
        className="rounded-full p-0.5 text-[10px] leading-none transition-all hover:scale-110"
        style={{ color: "var(--text-dim)" }}>✕</button>
    </motion.div>
  );
}
