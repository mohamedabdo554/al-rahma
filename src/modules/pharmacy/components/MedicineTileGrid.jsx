import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MedicineTileGrid({ medicines, onAddToCart, isWholesale }) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const sorted = [...medicines].sort((a, b) => {
      if (a.quantity <= 0 && b.quantity > 0) return 1;
      if (a.quantity > 0 && b.quantity <= 0) return -1;
      return a.name.localeCompare(b.name);
    });
    const q = search.trim().toLowerCase();
    if (!q) return showAll ? sorted : sorted.filter((m) => m.quantity > 0).slice(0, 20);
    return sorted.filter((m) => m.name.toLowerCase().includes(q) || m.qr_code?.includes(q));
  }, [medicines, search, showAll]);

  const outCount = medicines.filter((m) => m.quantity <= 0).length;

  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] opacity-40">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن دواء..."
            className="w-full rounded-xl border p-2 pr-8 text-[11px] outline-none transition-all"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAll((p) => !p)}
          className="shrink-0 rounded-lg border px-2 py-1.5 text-[9px] font-medium transition-all"
          style={{
            borderColor: showAll ? "rgba(var(--danger-rgb), 0.3)" : "var(--border-light)",
            color: showAll ? "var(--danger)" : "var(--text-muted)",
            backgroundColor: showAll ? "rgba(var(--danger-rgb), 0.06)" : "transparent",
          }}
        >
          {outCount > 0 ? `${outCount} منتهي` : "الكل"}
        </motion.button>
      </div>

      <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
        <AnimatePresence>
          {filtered.map((m) => {
            const isOut = m.quantity <= 0;
            const isLow = m.quantity > 0 && m.quantity <= 5;
            const color = isOut ? "var(--danger)" : isLow ? "var(--warning)" : "var(--accent)";
            const rgb = isOut ? "var(--danger-rgb)" : isLow ? "var(--warning-rgb)" : "var(--accent-rgb)";
            return (
              <motion.button
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !isOut && onAddToCart(m)}
                disabled={isOut}
                className="rounded-xl border p-1.5 text-center transition-all hover:scale-[1.05] active:scale-95 disabled:opacity-30"
                style={{
                  borderColor: `rgba(${rgb}, 0.2)`,
                  backgroundColor: `rgba(${rgb}, 0.04)`,
                }}
              >
                <div className="text-[8px] font-bold truncate leading-tight" style={{ color: "var(--text)" }}>
                  {m.name}
                </div>
                <div className="text-[10px] font-black mt-0.5" style={{ color }}>
                  {isWholesale && m.wholesale_price > 0 ? m.wholesale_price : m.selling_price}
                </div>
                <div className="text-[7px]" style={{ color: "var(--text-dim)" }}>
                  {isWholesale && m.wholesale_price > 0 ? <span style={{ color: "var(--accent2)" }}>جملة</span> : isOut ? "نفد" : `مخزون: ${m.quantity}`}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="col-span-full py-6 text-center text-[10px]" style={{ color: "var(--text-dim)" }}>
            {search ? "لا توجد نتائج" : "لا توجد أدوية متاحة"}
          </div>
        )}
      </div>
    </div>
  );
}
