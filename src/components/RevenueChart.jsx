import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

export default function RevenueChart({ visits }) {
  const data = useMemo(() => {
    const fmt = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = fmt(d);
      const label = d.toLocaleDateString("ar-EG", { weekday: "short" });
      const total = visits
        .filter((v) => v.date === key)
        .reduce((s, v) => s + (v.paid || 0), 0);
      days.push({ date: label, revenue: total });
    }
    return days;
  }, [visits]);

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="glass-card p-4">
      <h3 className="mb-3 text-[11px] font-semibold flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
        <span>📈</span> الإيرادات — آخر 7 أيام
      </h3>
      {data.every((d) => d.revenue === 0) ? (
        <div className="flex items-center justify-center h-[100px] text-[11px]" style={{ color: "var(--text-dim)" }}>
          لا توجد إيرادات في آخر 7 أيام
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={data}>
              <XAxis dataKey="date" tick={{ fill: "var(--text-dim)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, maxRevenue]} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="var(--accent)" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-1 text-[9px]" style={{ color: "var(--text-dim)" }}>
            <span>إجمالي: <strong style={{ color: "var(--accent)" }}>{data.reduce((s, d) => s + d.revenue, 0)} ج.م</strong></span>
            <span>متوسط: <strong style={{ color: "var(--accent)" }}>{Math.round(data.reduce((s, d) => s + d.revenue, 0) / 7)} ج.م</strong></span>
          </div>
        </>
      )}
    </div>
  );
}
