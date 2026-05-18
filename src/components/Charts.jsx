import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CHART_COLORS = ["var(--accent)", "var(--accent2)", "var(--accent3)", "var(--warning)", "var(--info)"];

function normalizeServices(servicesStr) {
  return (servicesStr || "").split(/[،,]\s*/).filter(Boolean);
}

export default function Charts({ visits, theme }) {
  if (visits.length === 0) return null;
  const accent = theme === "dark" ? "var(--accent)" : "var(--accent-dark)";

  const barData = Object.entries(
    visits.reduce((acc, v) => {
      normalizeServices(v.services).forEach((s) => { acc[s] = (acc[s] || 0) + 1; });
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const paidCount = visits.filter((v) => v.status === "مدفوع بالكامل ✓").length;
  const debtCount = visits.length - paidCount;
  const pieData = [
    { name: "مدفوع", value: paidCount },
    { name: "عليه دين", value: debtCount },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="glass-card p-4">
        <h3 className="mb-3 text-[11px] font-semibold flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
          <span>📊</span> أكثر الخدمات طلباً
        </h3>
        {barData.length === 0 ? (
          <div className="flex items-center justify-center h-[170px] text-[11px]" style={{ color: "var(--text-dim)" }}>لا توجد بيانات كافية</div>
        ) : (
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: "var(--text-dim)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--text-dim)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-card-solid)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)", fontSize: 11 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="glass-card p-4">
        <h3 className="mb-3 text-[11px] font-semibold flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
          <span>🥧</span> نسبة التحصيل
        </h3>
        {debtCount === 0 && paidCount === 0 ? (
          <div className="flex items-center justify-center h-[170px] text-[11px]" style={{ color: "var(--text-dim)" }}>لا توجد بيانات كافية</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={4} dataKey="value" data={pieData}>
                  {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? accent : "var(--danger)"} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--bg-card-solid)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
                مدفوع ({paidCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--danger)" }} />
                دين ({debtCount})
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
