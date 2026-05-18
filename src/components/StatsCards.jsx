import { useMemo } from "react";

export default function StatsCards({ visits, clients }) {
  const stats = useMemo(() => {
    const totalVisits = visits.length;
    if (totalVisits === 0) return null;

    const totalRevenue = visits.reduce((s, v) => s + v.total, 0);
    const avgVisitValue = Math.round(totalRevenue / totalVisits);

    const typeCount = {};
    clients.forEach((c) => {
      typeCount[c.type] = (typeCount[c.type] || 0) + 1;
    });
    const mostCommonType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];

    const paidVisits = visits.filter((v) => v.status === "مدفوع بالكامل ✓").length;
    const collectionRate = totalVisits > 0 ? Math.round((paidVisits / totalVisits) * 100) : 0;

    return { totalVisits, totalRevenue, avgVisitValue, mostCommonType, collectionRate, paidVisits };
  }, [visits, clients]);

  if (!stats) return null;

  const cards = [
    { icon: "📋", label: "إجمالي الزيارات", value: stats.totalVisits, color: "var(--accent2)" },
    { icon: "💰", label: "إجمالي الإيرادات", value: `${stats.totalRevenue} ج.م`, color: "var(--accent)" },
    { icon: "📊", label: "متوسط الزيارة", value: `${stats.avgVisitValue} ج.م`, color: "var(--info)" },
    { icon: "✅", label: "نسبة التحصيل", value: `${stats.collectionRate}%`, color: stats.collectionRate > 70 ? "var(--accent)" : "var(--warning)" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border p-2.5"
          style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}
        >
          <div className="text-base mb-0.5">{c.icon}</div>
          <div className="text-xs font-bold" style={{ color: c.color }}>{c.value}</div>
          <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}
