import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "../../../supabaseClient";
import MobileScannerPOS from "./MobileScannerPOS";
import { usePharmacy } from "../PharmacyContext";
import MedicineCabinet from "../../../components/MedicineCabinet";
function EditDebtRow({ client, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(client.debt);
  const [confirmDel, setConfirmDel] = useState(false);
  if (editing) {
    return (
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex items-center gap-2 rounded-xl border p-2"
        style={{ borderColor: "rgba(var(--accent2-rgb), 0.25)", backgroundColor: "rgba(var(--accent2-rgb), 0.04)" }}>
        <span className="text-[10px] font-semibold min-w-0 truncate" style={{ color: "var(--text)" }}>{client.name}</span>
        <input type="number" value={val} onChange={(e) => setVal(Number(e.target.value) || 0)}
          className="w-20 rounded-lg border p-1.5 text-[10px] outline-none text-center"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
        <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>ج.م</span>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => { onUpdate(client.id, { debt: val }); setEditing(false); }}
          className="rounded-lg px-2 py-1 text-[9px] font-bold text-white"
          style={{ background: "var(--accent2)" }}>💾</motion.button>
        <button onClick={() => { setVal(client.debt); setEditing(false); }}
          className="text-[9px]" style={{ color: "var(--text-muted)" }}>✕</button>
      </motion.div>
    );
  }
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex items-center justify-between rounded-xl border p-2.5 text-xs"
      style={{ borderColor: client.debt > 0 ? "rgba(var(--danger-rgb), 0.2)" : "var(--border-light)", backgroundColor: client.debt > 0 ? "rgba(var(--danger-rgb), 0.03)" : "var(--bg-input)" }}>
      <div className="flex-1 min-w-0">
        <span className="font-semibold" style={{ color: "var(--text)" }}>{client.name}</span>
        {client.phone && <span className="mr-2 text-[9px]" style={{ color: "var(--text-dim)" }}>{client.phone}</span>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {client.debt > 0 ? (
          <span className="font-bold text-sm" style={{ color: "var(--danger)" }}>{client.debt} ج.م</span>
        ) : (
          <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>✅ لا دين</span>
        )}
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setVal(client.debt); setEditing(true); }}
          className="rounded-lg border px-2 py-1 text-[9px]"
          style={{ borderColor: "var(--border)", color: "var(--warning-dark)" }}>
          ✏️
        </motion.button>
        {client.phone && (
          <motion.button whileTap={{ scale: 0.85 }}
            onClick={() => {
              const num = client.phone.replace(/^0+/, "20").replace(/[^\d]/g, "");
              window.open(`https://wa.me/${num}?text=${encodeURIComponent(`السلام عليكم، عيادة الرحمة البيطرية: تذكير بوجود مديونية بقيمة ${client.debt} ج.م. برجاء السداد.`)}`, "_blank");
            }}
            className="rounded-lg border px-2 py-1 text-[9px]"
            style={{ borderColor: "rgba(var(--accent-rgb), 0.2)", color: "var(--accent)" }}>
            📱
          </motion.button>
        )}
        {confirmDel ? (
          <div className="flex gap-1">
            <button onClick={() => { onDelete(client.id); setConfirmDel(false); }}
              className="rounded-lg border px-2 py-0.5 text-[9px] font-bold"
              style={{ borderColor: "var(--danger)", color: "var(--danger)", backgroundColor: "rgba(var(--danger-rgb), 0.12)" }}>
              تأكيد
            </button>
            <button onClick={() => setConfirmDel(false)}
              className="rounded-lg border px-2 py-0.5 text-[9px]"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              إلغاء
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDel(true)}
            className="rounded-lg border px-2 py-1 text-[9px]"
            style={{ borderColor: "rgba(var(--danger-rgb), 0.3)", color: "var(--danger)", backgroundColor: "rgba(var(--danger-rgb), 0.06)" }}>
            🗑️
          </button>
        )}
      </div>
    </motion.div>
  );
}

function PharmaAddClient({ onAdd }) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [debt, setDebt] = useState("");
  if (!show) return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShow(true)}
      className="rounded-xl border px-4 py-2 text-[10px] font-bold transition-all hover:shadow-lg"
      style={{ borderColor: "var(--border)", color: "var(--accent2)" }}>
      ➕ إضافة عميل صيدلية
    </motion.button>
  );
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-3" style={{ borderColor: "rgba(var(--accent2-rgb), 0.25)", background: "rgba(var(--accent2-rgb), 0.04)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold" style={{ color: "var(--accent2)" }}>➕ عميل صيدلية جديد</span>
        <button onClick={() => setShow(false)} className="text-[9px]" style={{ color: "var(--text-muted)" }}>✕</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)}
          className="flex-[2] min-w-[100px] rounded-xl border p-2 text-[10px] outline-none"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
        <input placeholder="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)}
          className="flex-1 min-w-[100px] rounded-xl border p-2 text-[10px] outline-none"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
        <input type="number" placeholder="الدين المبدئي" value={debt} onChange={(e) => setDebt(e.target.value)}
          className="w-[90px] rounded-xl border p-2 text-[10px] outline-none"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => { if (!name.trim()) return; onAdd(name.trim(), phone.trim(), Number(debt) || 0); setName(""); setPhone(""); setDebt(""); setShow(false); }}
          className="rounded-xl px-4 py-2 text-[10px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--accent2), var(--accent2-dark))" }}>
          حفظ
        </motion.button>
      </div>
    </motion.div>
  );
}

const cardStyle = (rgb, intense = false) => ({
  borderColor: `rgba(${rgb}, ${intense ? 0.35 : 0.18})`,
  background: intense
    ? `linear-gradient(135deg, rgba(${rgb}, 0.1), rgba(${rgb}, 0.03))`
    : `rgba(${rgb}, 0.04)`,
});

export default function PharmacyDashboard() {
  const { medicines, pharmacyTotalRevenue, pharmacySaleCount, todaySales, sales, pharmacyClients, addPharmacyClient, addPharmacyDebt, updatePharmacyClient, deletePharmacyClient, addMedicine, updateMedicine, deleteMedicine } = usePharmacy();
  const [showInventory, setShowInventory] = useState(false);
  const [subTab, setSubTab] = useState("pos");
  const [financeUnlocked, setFinanceUnlocked] = useState(() => localStorage.getItem("vet_ph_finance_unlocked") === "true");
  function unlockFinance() {
    const saved = localStorage.getItem("vet_finance_password") || "1234";
    const p = prompt("🔒 أدخل كلمة المرور للمالية:");
    if (p === saved) { setFinanceUnlocked(true); setSubTab("finance"); localStorage.setItem("vet_ph_finance_unlocked", "true"); }
    else alert("❌ كلمة المرور خطأ");
  }
  function lockFinance() {
    setFinanceUnlocked(false);
    setSubTab("pos");
    localStorage.removeItem("vet_ph_finance_unlocked");
  }
  const todayRev = todaySales.reduce((s, sl) => s + Number(sl.total || 0), 0);
  const totalStock = medicines.reduce((s, m) => s + Math.max(0, m.quantity), 0);
  const lowStock = medicines.filter((m) => m.quantity > 0 && m.quantity <= 5).length;
  const lowItems = medicines.filter((m) => m.quantity > 0 && m.quantity <= 5);
  const [invSearch, setInvSearch] = useState("");
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [invItems, setInvItems] = useState([]);

  function exportPharmacy() {
    const BOM = "\uFEFF";
    const escCSV = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s; };
    const rows = [];
    rows.push("المخزون — الأدوية");
    rows.push(["الاسم", "الباركود", "الكمية", "سعر الشراء", "سعر البيع", "سعر الجملة", "تاريخ الصلاحية"].join(","));
    medicines.forEach((m) => rows.push([m.name, m.qr_code || "", m.quantity ?? 0, m.purchase_price ?? 0, m.selling_price ?? 0, m.wholesale_price ?? 0, m.expiration_date || ""].map(escCSV).join(",")));
    rows.push("");
    rows.push("المبيعات");
    rows.push(["التاريخ", "النوع", "الإجمالي"].join(","));
    sales.forEach((s) => rows.push([(s.created_at || "").slice(0, 10), s.type || "", s.total ?? 0].map(escCSV).join(",")));
    rows.push("");
    rows.push("عملاء الصيدلية");
    rows.push(["الاسم", "الهاتف", "المديونية"].join(","));
    pharmacyClients.forEach((c) => rows.push([c.name, c.phone || "", c.debt ?? 0].map(escCSV).join(",")));
    const csv = BOM + rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;header=present" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `pharmacy-backup-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }
  const [loadingInv, setLoadingInv] = useState(false);

  async function showInvoice(sale) {
    setInvoiceDetail(sale);
    setLoadingInv(true);
    setInvItems([]);
    const { data, error } = await supabase.from("sale_items").select("*").eq("sale_id", sale.id);
    if (!error && data) setInvItems(data);
    setLoadingInv(false);
  }

  // Sales chart data (last 7 days)
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const daySales = sales.filter((s) => (s.created_at || "").slice(0, 10) === key);
      days.push({ day: key.slice(5), total: daySales.reduce((s, sl) => s + Number(sl.total || 0), 0) });
    }
    return days;
  }, [sales]);

  const filteredInvoices = useMemo(() => {
    if (!invSearch.trim()) return [...sales].reverse().slice(0, 20);
    const q = invSearch.trim().toLowerCase();
    return [...sales].filter((s) => (s.id || "").toLowerCase().includes(q) || String(s.total).includes(q)).reverse().slice(0, 20);
  }, [sales, invSearch]);

  const finCards = [
    { icon: "💰", label: "إجمالي المبيعات", value: `${pharmacyTotalRevenue} ج.م`, color: "var(--accent)", rgb: "var(--accent-rgb)" },
    { icon: "📊", label: "مبيعات اليوم", value: `${todayRev} ج.م`, color: "var(--accent2)", rgb: "var(--accent2-rgb)" },
    { icon: "🧾", label: "عدد الفواتير", value: pharmacySaleCount, color: "var(--info)", rgb: "var(--info-rgb)" },
    { icon: "📦", label: "إجمالي المخزون", value: totalStock, color: "var(--warning)", rgb: "var(--warning-rgb)" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {/* Sub-tab navigation */}
      <div className="flex gap-2" style={{ direction: "rtl" }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSubTab("pos")}
          className="rounded-xl px-4 py-2 text-[10px] font-bold transition-all"
          style={{
            backgroundColor: subTab === "pos" ? "rgba(var(--accent-rgb), 0.12)" : "var(--bg-input)",
            color: subTab === "pos" ? "var(--accent)" : "var(--text-muted)",
            border: subTab === "pos" ? "1px solid rgba(var(--accent-rgb), 0.25)" : "1px solid var(--border)",
          }}
        >
          💊 نقطة البيع
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { if (financeUnlocked) setSubTab("finance"); else unlockFinance(); }}
          className="rounded-xl px-4 py-2 text-[10px] font-bold transition-all"
          style={{
            backgroundColor: subTab === "finance" ? "rgba(var(--accent2-rgb), 0.12)" : "var(--bg-input)",
            color: subTab === "finance" ? "var(--accent2)" : "var(--text-muted)",
            border: subTab === "finance" ? "1px solid rgba(var(--accent2-rgb), 0.25)" : "1px solid var(--border)",
          }}
        >
          {subTab === "finance" ? "🔓 المالية" : "🔒 المالية"}
        </motion.button>
      </div>

      {/* Financial cards (always shown) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInventory((p) => !p)}
          className="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-5 py-3 text-[10px] font-bold transition-all hover:shadow-lg sm:w-[100px]"
          style={{
            borderColor: showInventory ? "rgba(var(--accent-rgb), 0.4)" : "var(--border)",
            background: showInventory
              ? "linear-gradient(135deg, rgba(var(--accent-rgb), 0.12), rgba(var(--accent-rgb), 0.04))"
              : "var(--bg-input)",
            color: "var(--accent)",
            boxShadow: showInventory ? "0 4px 20px rgba(var(--accent-rgb), 0.15)" : "none",
          }}
        >
          <span className="text-xl">{showInventory ? "✕" : "📦"}</span>
          <span>{showInventory ? "إغلاق" : "المخزون"}</span>
          {lowStock > 0 && !showInventory && (
            <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold" style={{ backgroundColor: "rgba(var(--danger-rgb), 0.12)", color: "var(--danger)" }}>
              {lowStock} منخفض
            </span>
          )}
        </motion.button>

        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
          {finCards.map((c) => (
            <motion.div
              key={c.label}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl border p-3 text-center transition-all"
              style={cardStyle(c.rgb)}
            >
              <div className="text-lg leading-none mb-0.5">{c.icon}</div>
              <div className="text-sm font-black leading-tight" style={{ color: c.color }}>{c.value}</div>
              <div className="text-[8px] mt-0.5" style={{ color: "var(--text-dim)" }}>{c.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Low stock alert */}
      {lowItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-2.5 text-[10px] flex items-center gap-2 flex-wrap"
          style={{ borderColor: "rgba(var(--warning-rgb), 0.3)", backgroundColor: "rgba(var(--warning-rgb), 0.06)", color: "var(--warning)" }}>
          <span>⚠️ <strong>{lowItems.length}</strong> أدوية على وشك النفاد:</span>
          {lowItems.slice(0, 5).map((m) => (
            <span key={m.id} className="rounded-full px-2 py-0.5 text-[8px] font-bold"
              style={{ backgroundColor: "rgba(var(--danger-rgb), 0.1)", color: "var(--danger)" }}>
              {m.name} ({m.quantity})
            </span>
          ))}
          {lowItems.length > 5 && <span className="text-[8px]" style={{ color: "var(--text-dim)" }}>+{lowItems.length - 5} أخرى</span>}
        </motion.div>
      )}

      {/* Inventory panel */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <MedicineCabinet
              medicines={medicines}
              onAdd={addMedicine}
              onDelete={deleteMedicine}
              onUpdate={updateMedicine}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content: POS or Finance */}
      <AnimatePresence mode="wait">
        {subTab === "pos" ? (
          <motion.div key="pos" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <MobileScannerPOS />
          </motion.div>
        ) : (
          <motion.div key="finance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold" style={{ color: "var(--accent2)" }}>💰 مالية الصيدلية</span>
              <div className="flex gap-1">
                <motion.button whileTap={{ scale: 0.9 }} onClick={exportPharmacy}
                  className="rounded-lg border px-2 py-1 text-[9px]"
                  style={{ borderColor: "rgba(var(--accent-rgb), 0.3)", color: "var(--accent)" }}>
                  📥 تصدير
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={lockFinance}
                  className="rounded-lg border px-2 py-1 text-[9px]"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                  🔒 إغلاق
                </motion.button>
              </div>
            </div>
            {/* Add pharmacy client */}
            <PharmaAddClient onAdd={addPharmacyClient} />

            {/* Debtor summary cards */}
            {(() => {
              const debtors = pharmacyClients.filter((c) => c.debt > 0);
              const totalDebt = debtors.reduce((s, c) => s + c.debt, 0);
              const avgDebt = debtors.length > 0 ? Math.round(totalDebt / debtors.length) : 0;
              return (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border p-3 text-center" style={{ borderColor: "rgba(var(--danger-rgb), 0.25)", background: "rgba(var(--danger-rgb), 0.05)" }}>
                    <div className="text-lg font-black" style={{ color: "var(--danger)" }}>{debtors.length}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--text-dim)" }}>عدد المدينين</div>
                  </div>
                  <div className="rounded-2xl border p-3 text-center" style={{ borderColor: "rgba(var(--warning-rgb), 0.25)", background: "rgba(var(--warning-rgb), 0.05)" }}>
                    <div className="text-lg font-black" style={{ color: "var(--warning)" }}>{totalDebt} ج.م</div>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--text-dim)" }}>إجمالي الديون</div>
                  </div>
                  <div className="rounded-2xl border p-3 text-center" style={{ borderColor: "rgba(var(--accent-rgb), 0.25)", background: "rgba(var(--accent-rgb), 0.05)" }}>
                    <div className="text-lg font-black" style={{ color: "var(--accent)" }}>{avgDebt} ج.م</div>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--text-dim)" }}>متوسط الدين</div>
                  </div>
                </div>
              );
            })()}

            {/* Debtors list (pharmacy only) */}
            <div className="space-y-2">
              {pharmacyClients.length === 0 ? (
                <div className="rounded-2xl border py-8 text-center text-[11px]" style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}>
                  <span className="text-xl block mb-1 opacity-30">🏦</span>
                  لا يوجد عملاء صيدلية — أضف عميلاً من الأعلى
                </div>
              ) : (
                <>
                  <div className="max-h-72 space-y-1.5 overflow-y-auto">
                    {[...pharmacyClients].sort((a, b) => (b.debt || 0) - (a.debt || 0)).map((c) => (
                      <EditDebtRow key={c.id} client={c}
                        onUpdate={updatePharmacyClient}
                        onDelete={deletePharmacyClient}
                      />
                    ))}
                  </div>
                  {/* Send to all */}
                  {(() => {
                    const withPhone = pharmacyClients.filter((c) => c.phone);
                    if (withPhone.length < 2) return null;
                    return (
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          withPhone.forEach((c, i) => {
                            setTimeout(() => {
                              const num = c.phone.replace(/^0+/, "20").replace(/[^\d]/g, "");
                              window.open(`https://wa.me/${num}?text=${encodeURIComponent(`السلام عليكم، عيادة الرحمة البيطرية: تذكير بوجود مديونية بقيمة ${c.debt} ج.م. برجاء السداد.`)}`, "_blank");
                            }, i * 800);
                          });
                        }}
                        className="w-full rounded-xl border py-2.5 text-[10px] font-bold transition-all"
                        style={{ borderColor: "rgba(var(--accent-rgb), 0.25)", color: "var(--accent)", backgroundColor: "rgba(var(--accent-rgb), 0.05)" }}>
                        📱 إرسال للكل ({withPhone.length})
                      </motion.button>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Sales Chart */}
            <div className="rounded-2xl border p-3" style={{ borderColor: "var(--border-light)" }}>
              <h3 className="text-[10px] font-bold mb-2" style={{ color: "var(--accent2)" }}>📊 مبيعات آخر 7 أيام</h3>
              {chartData.every((d) => d.total === 0) ? (
                <div className="py-6 text-center text-[9px]" style={{ color: "var(--text-dim)" }}>
                  لا توجد مبيعات في آخر 7 أيام
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 8, fill: "var(--text-dim)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: "var(--text-dim)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg-card-solid)" }}
                      labelStyle={{ color: "var(--text)" }} formatter={(v) => [`${v} ج.م`, "المبيعات"]} />
                    <Bar dataKey="total" fill="var(--accent2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent invoices */}
            <div className="rounded-2xl border p-3" style={{ borderColor: "var(--border-light)" }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
                  🧾 الفواتير
                </h3>
                <input placeholder="🔍 بحث برقم الفاتورة..." value={invSearch} onChange={(e) => setInvSearch(e.target.value)}
                  className="w-[140px] rounded-lg border p-1.5 text-[9px] outline-none"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
              </div>
              {filteredInvoices.length === 0 ? (
                <div className="py-4 text-center text-[10px]" style={{ color: "var(--text-dim)" }}>
                  {sales.length === 0 ? "لا توجد فواتير بعد" : "لا توجد نتائج"}
                </div>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {filteredInvoices.map((s, i) => (
                    <motion.div key={s.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onClick={() => showInvoice(s)}
                      className="flex items-center justify-between rounded-lg border p-2 text-[10px] cursor-pointer transition-all hover:scale-[1.01]"
                      style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold truncate" style={{ color: "var(--text)" }}>
                          فاتورة #{s.id?.slice(0, 6) || i + 1}
                        </span>
                        <span className="text-[8px]" style={{ color: "var(--text-dim)" }}>
                          {s.created_at?.slice(0, 10) || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold" style={{ color: "var(--accent)" }}>{s.total} ج.م</span>
                        {s.type === "prescription" && <span className="text-[8px] px-1 py-0.5 rounded" style={{ backgroundColor: "rgba(var(--accent2-rgb), 0.1)", color: "var(--accent2)" }}>روشتة</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {invoiceDetail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setInvoiceDetail(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl border p-4 shadow-2xl"
              style={{ backgroundColor: "var(--bg-card-solid)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold" style={{ color: "var(--text)" }}>
                  🧾 فاتورة #{invoiceDetail.id?.slice(0, 6)}
                </h3>
                <button onClick={() => setInvoiceDetail(null)}
                  className="rounded-lg border px-2 py-1 text-[9px]"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>✕</button>
              </div>
              <div className="text-[9px] mb-3" style={{ color: "var(--text-dim)" }}>
                {invoiceDetail.created_at?.slice(0, 10) || "—"}
                {invoiceDetail.type === "prescription" && <span className="mr-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(var(--accent2-rgb), 0.1)", color: "var(--accent2)" }}>روشتة</span>}
              </div>

              {loadingInv ? (
                <div className="py-6 text-center text-[10px]" style={{ color: "var(--text-dim)" }}>جاري التحميل...</div>
              ) : invItems.length === 0 ? (
                <div className="py-6 text-center text-[10px]" style={{ color: "var(--text-dim)" }}>لا توجد أصناف</div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto mb-3">
                  {invItems.map((item, idx) => (
                    <div key={item.id || idx}
                      className="flex items-center justify-between rounded-lg border p-2 text-[9px]"
                      style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}>
                      <span className="font-semibold truncate" style={{ color: "var(--text)" }}>{item.item_name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[8px]" style={{ color: "var(--text-dim)" }}>×{item.quantity}</span>
                        <span className="font-bold" style={{ color: "var(--accent)" }}>{item.unit_price} ج.م</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <span className="text-[10px] font-bold" style={{ color: "var(--text-dim)" }}>الإجمالي</span>
                <span className="text-sm font-black" style={{ color: "var(--accent)" }}>{invoiceDetail.total} ج.م</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
