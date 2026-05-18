import { useState, useMemo } from "react";
import Fuse from "fuse.js";

export default function VisitsList({ visits, onVisitClick }) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const fuse = useMemo(() => new Fuse(visits, { keys: ["name", "animal", "services", "notes"], threshold: 0.4, distance: 100 }), [visits]);

  const filtered = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    let filtered = visits;

    // Date filter
    if (dateFilter === "today") filtered = filtered.filter((v) => v.date === todayStr);
    else if (dateFilter === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().slice(0, 10);
      filtered = filtered.filter((v) => v.date >= weekAgoStr && v.date <= todayStr);
    } else if (dateFilter === "month") {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthAgoStr = monthAgo.toISOString().slice(0, 10);
      filtered = filtered.filter((v) => v.date >= monthAgoStr && v.date <= todayStr);
    }

    // Text search
    if (search.trim()) {
      const fuseResults = fuse.search(search).map((r) => r.item);
      return filtered.filter((v) => fuseResults.includes(v));
    }
    return filtered;
  }, [visits, search, dateFilter, fuse]);

  const filters = [
    { key: "all", label: "الكل" },
    { key: "today", label: "اليوم" },
    { key: "week", label: "أسبوع" },
    { key: "month", label: "شهر" },
  ];

  return (
    <div className="glass-card p-4">
      <h2 className="mb-3 text-xs font-bold flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px]" style={{ backgroundColor: "rgba(100,116,139,0.12)" }}>📋</span>
        سجل الزيارات
        <span className="mr-auto rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: "rgba(100,116,139,0.1)", color: "var(--text-muted)" }}>
          {filtered.length}
        </span>
      </h2>

      {/* Date Filters */}
      <div className="flex gap-1 mb-2">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setDateFilter(f.key)}
            className="rounded-lg border px-2.5 py-1 text-[9px] font-medium transition-all"
            style={{
              borderColor: dateFilter === f.key ? "var(--accent)" : "var(--border)",
              backgroundColor: dateFilter === f.key ? "rgba(var(--accent-rgb), 0.1)" : "transparent",
              color: dateFilter === f.key ? "var(--accent)" : "var(--text-muted)",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-2">
        <input placeholder="🔍 بحث..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border p-2 pr-8 text-[11px] outline-none transition-all"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }} />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] opacity-50 hover:opacity-100"
            style={{ color: "var(--text-muted)" }}>✕</button>
        )}
      </div>

      <div className="max-h-48 space-y-1.5 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-[11px]" style={{ color: "var(--text-dim)" }}>
            <span className="text-2xl mb-1 opacity-30">{visits.length === 0 ? "📋" : "🔍"}</span>
            <span>{visits.length === 0 ? "لا توجد زيارات بعد" : "لا توجد نتائج"}</span>
          </div>
        ) : (
          filtered.map((v) => (
            <div key={v.id} onClick={() => onVisitClick?.(v)}
              className="rounded-xl border p-2.5 text-xs transition-all hover:shadow-sm cursor-pointer active:scale-[0.99]"
              style={{
                borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)",
                borderRight: v.status === "مدفوع بالكامل ✓" ? "3px solid var(--accent)" : "3px solid var(--danger)",
              }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                  {v.name} <span className="text-[10px] font-normal" style={{ color: "var(--text-muted)" }}>({v.animal})</span>
                </span>
                <span className={"rounded-full px-2 py-0.5 text-[9px] font-bold"}
                  style={{
                    backgroundColor: v.status === "مدفوع بالكامل ✓" ? "rgba(var(--accent-rgb), 0.1)" : "rgba(var(--danger-rgb), 0.1)",
                    color: v.status === "مدفوع بالكامل ✓" ? "var(--accent)" : "var(--danger)",
                    border: v.status === "مدفوع بالكامل ✓" ? "1px solid rgba(var(--accent-rgb), 0.2)" : "1px solid rgba(var(--danger-rgb), 0.2)",
                  }}>
                  {v.status === "مدفوع بالكامل ✓" ? "مدفوع" : "دين"}
                </span>
              </div>
              <div className="flex items-center justify-between" style={{ color: "var(--text-dim)" }}>
                <span className="text-[10px] flex items-center gap-1.5">
                  <span>{v.date}</span>
                  {v.weight && <span className="text-[9px]" style={{ color: "var(--warning-dark)" }}>{v.weight}كجم</span>}
                  <span className="opacity-30">|</span>
                  <span className="truncate max-w-[100px]">{v.services}</span>
                  {v.notes && <span title={v.notes}>📝</span>}
                  {v.audio && <span title="تسجيل صوتي">🎤</span>}
                </span>
                <span className="font-bold text-sm" style={{ color: "var(--text)" }}>
                  {v.total} <span className="text-[9px] font-normal" style={{ color: "var(--text-muted)" }}>ج.م</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
