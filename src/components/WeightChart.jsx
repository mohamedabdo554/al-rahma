import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function WeightChart({ visits, client }) {
  if (!client || !visits || visits.length === 0) return null;

  const weightData = visits
    .filter((v) => v.weight && Number(v.weight) > 0)
    .map((v) => ({
      date: v.date?.slice(5) || "",
      weight: Number(v.weight),
    }))
    .reverse();

  if (weightData.length < 2) return null;

  const latestWeight = weightData[weightData.length - 1]?.weight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-3 mt-2"
      style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-bold flex items-center gap-1" style={{ color: "var(--warning-dark)" }}>
          ⚖️ تطور الوزن
        </h4>
        <span className="text-[9px] font-bold" style={{ color: "var(--accent)" }}>
          {latestWeight} كجم
        </span>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={weightData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
          <XAxis dataKey="date" tick={{ fill: "var(--text-dim)", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tick={{ fill: "var(--text-dim)", fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{
              background: "var(--bg-card-solid)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text)",
              fontSize: 10,
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--warning-dark)"
            strokeWidth={2}
            dot={{ fill: "var(--warning-dark)", stroke: "var(--bg-card-solid)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 5, fill: "var(--warning-dark)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
