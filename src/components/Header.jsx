import { motion } from "framer-motion";

export default function Header({ theme, toggleTheme, todayPatients, totalDebts, totalClients, activeTab, onTabChange, weekFollowUps, role, onRoleChange, onSendFollowUpWA }) {
  const isPharmacy = role === "pharmacist";
  const tabs = isPharmacy
    ? [{ key: "pharmacy", label: "الصيدلية", icon: "💊" }]
    : [
        { key: "clinic", label: "الكشف", icon: "💉" },
        { key: "timeline", label: "السجل الطبي", icon: "📋" },
        { key: "finance", label: "الماليات", icon: "💰" },
        { key: "appointments", label: "المواعيد", icon: "📅" },
        { key: "reports", label: "التقارير", icon: "📊" },
      ];

  const headerCards = [
    { icon: "📅", label: "زيارات اليوم", value: todayPatients, color: "var(--accent2)" },
    { icon: "🏦", label: "إجمالي الديون", value: `${totalDebts} ج.م`, color: "var(--warning)" },
    { icon: "👥", label: "إجمالي العملاء", value: totalClients, color: "var(--info)" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mb-6 max-w-7xl rounded-2xl border backdrop-blur-2xl"
      style={{
        borderColor: "var(--border)",
        background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)",
        boxShadow: "var(--shadow-card)",
        padding: "16px 20px",
      }}
    >
      {/* Top row: Logo + Theme toggle */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--accent-dark), var(--accent), var(--accent-light))",
              boxShadow: "0 4px 20px rgba(var(--accent-rgb), 0.3)",
            }}
          >
            ر
          </div>
          <div>
            <h1 className="gradient-text text-lg font-black md:text-xl tracking-tight" style={{ WebkitTextFillColor: "transparent", fontFamily: "'Cairo', sans-serif" }}>
              عيادة الرحمة البيطرية
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.85 }}
            onClick={() => onRoleChange(role === "doctor" ? "pharmacist" : "doctor")}
            className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[9px] font-bold transition-all"
            style={{
              borderColor: isPharmacy ? "rgba(var(--accent2-rgb), 0.3)" : "var(--border)",
              backgroundColor: isPharmacy ? "rgba(var(--accent2-rgb), 0.1)" : "var(--bg-input)",
              color: isPharmacy ? "var(--accent2)" : "var(--text-muted)",
            }}>
            {isPharmacy ? "👨‍⚕️" : "💊"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-all"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-input)" }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </motion.button>
        </div>
      </div>

      {!isPharmacy && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {headerCards.map((c) => (
            <div key={c.label}
              className="rounded-xl border p-2.5 text-center transition-all hover:scale-[1.02]"
              style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}
            >
              <div className="text-base leading-none mb-1">{c.icon}</div>
              <div className="text-sm font-black leading-tight" style={{ color: c.color }}>{c.value}</div>
              <div className="text-[8px] mt-0.5" style={{ color: "var(--text-dim)" }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly alert card */}
      {weekFollowUps > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <motion.button
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onClick={() => onTabChange("appointments")}
            className="flex-1 rounded-xl border p-2.5 text-[10px] font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95"
            style={{
              borderColor: `rgba(var(--danger-rgb), 0.3)`,
              backgroundColor: `rgba(var(--danger-rgb), 0.08)`,
              color: "var(--danger)",
              boxShadow: "0 0 20px rgba(var(--danger-rgb), 0.06)",
              animation: "breathe 2s ease-in-out infinite",
            }}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold"
              style={{ backgroundColor: "rgba(var(--danger-rgb), 0.2)", color: "var(--danger)" }}>
              {weekFollowUps}
            </span>
            <span>🚨 {weekFollowUps} حالات إعادة كشف</span>
          </motion.button>
          {onSendFollowUpWA && (
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={onSendFollowUpWA}
              className="rounded-xl border px-3 py-2.5 text-[10px] font-bold shrink-0 transition-all"
              style={{ borderColor: "rgba(var(--accent-rgb), 0.3)", color: "var(--accent)", backgroundColor: "rgba(var(--accent-rgb), 0.08)" }}>
              📱 إرسال للكل
            </motion.button>
          )}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto md:gap-1.5" style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(tab.key)}
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold transition-all md:px-4 md:text-xs"
              style={{
                backgroundColor: isActive ? "rgba(var(--accent-rgb), 0.12)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                border: isActive ? "1px solid rgba(var(--accent-rgb), 0.25)" : "1px solid transparent",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.header>
  );
}
