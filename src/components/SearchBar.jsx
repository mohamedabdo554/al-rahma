import { useState, useMemo } from "react";
import Fuse from "fuse.js";

export default function SearchBar({ clients, onSelect }) {
  const [quickSearch, setQuickSearch] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(clients, {
        keys: [
          { name: "name", weight: 2 },
          { name: "animal", weight: 1.5 },
          { name: "phone", weight: 1 },
        ],
        threshold: 0.4,
        distance: 100,
        minMatchCharLength: 1,
      }),
    [clients]
  );

  const searchResults = quickSearch.trim()
    ? fuse.search(quickSearch).map((r) => r.item).slice(0, 6)
    : [];

  function handleSelect(c) {
    onSelect(c.id);
    setQuickSearch("");
  }

  return (
    <div className="mx-auto mb-4 max-w-7xl relative">
      <div className="relative">
        <input
          placeholder="🔍 ابحث عن عميل بالاسم / الحيوان / رقم الهاتف..."
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          className="w-full rounded-2xl border p-3 pr-10 text-sm outline-none backdrop-blur-xl transition-all focus:shadow-2xl"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text)" }}
        />
        {quickSearch && (
          <button
            onClick={() => setQuickSearch("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
            style={{ color: "var(--text-muted)" }}
          >
            ✕
          </button>
        )}
      </div>
      {quickSearch.trim() && searchResults.length > 0 && (
        <div
          className="absolute top-full right-0 left-0 z-30 mt-1.5 rounded-xl border shadow-2xl backdrop-blur-2xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card-solid)", borderColor: "var(--border)" }}
        >
          {searchResults.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c)}
              className="w-full px-4 py-2.5 text-right text-xs transition-all hover:bg-white/5 flex items-center justify-between border-b last:border-0"
              style={{ color: "var(--text)", borderColor: "var(--border-light)" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <AnimalAvatar type={c.type} />
                <span className="truncate">{c.name} — {c.animal}</span>
              </div>
              <span className="shrink-0" style={{ color: "var(--text-muted)" }}>
                {c.phone || ""} {c.debt > 0 ? <span style={{ color: "var(--danger)" }}>| {c.debt} ج.م</span> : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AnimalAvatar({ type }) {
  const colors = { قطة: "var(--type-cat)", كلب: "var(--type-dog)", طائر: "var(--type-bird)", أرنب: "var(--type-rabbit)", آخر: "var(--type-other)" };
  const colorMap = { قطة: "#6366f1", كلب: "#f59e0b", طائر: "#06b6d4", أرنب: "#a78bfa", آخر: "#10b981" };
  const icons = { قطة: "🐱", كلب: "🐶", طائر: "🐦", أرنب: "🐰", آخر: "🐾" };
  const c = colorMap[type] || colorMap.آخر;
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px]" style={{ backgroundColor: `${c}20` }}>
      {icons[type] || icons.آخر}
    </span>
  );
}
