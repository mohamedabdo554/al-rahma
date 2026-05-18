import { motion } from "framer-motion";

const shortcuts = [
  { key: "N", desc: "عميل جديد", action: "newClient" },
  { key: "V", desc: "زيارة جديدة", action: "newVisit" },
  { key: "I", desc: "عرض الفاتورة", action: "showInvoice" },
  { key: "E", desc: "تصدير", action: "export" },
];

export default function QuickActions({ onAction }) {
  return (
    <div className="rounded-xl border backdrop-blur-sm px-4 py-2.5 flex items-center justify-between"
      style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-card)" }}>
      <span className="text-[10px] font-medium flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
        <span className="text-xs">⌨️</span> اختصارات سريعة
      </span>
      <div className="flex items-center gap-3">
        {shortcuts.map((s) => (
          <button key={s.key} onClick={() => onAction(s.action)}
            className="flex items-center gap-1.5 text-[10px] transition-all hover:scale-105 active:scale-95"
            style={{ color: "var(--text-muted)" }}>
            <kbd style={{ background: "var(--bg-input)", border: "1px solid var(--border)", padding: "1px 5px", borderRadius: 4, fontSize: 9, color: "var(--accent)" }}>
              {s.key}
            </kbd>
            <span className="hidden sm:inline">{s.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
