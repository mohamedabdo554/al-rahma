import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../supabaseClient";
import { usePharmacy } from "../PharmacyContext";
import BarcodeGenerator from "../../../components/BarcodeGenerator";
import MedicineTileGrid from "./MedicineTileGrid";

function playBeep(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === "success") { osc.frequency.value = 1200; gain.gain.value = 0.08; osc.start(); osc.stop(ctx.currentTime + 0.08); }
    else if (type === "error") { osc.frequency.value = 300; gain.gain.value = 0.1; osc.start(); osc.stop(ctx.currentTime + 0.2); }
    else { osc.frequency.value = 800; gain.gain.value = 0.06; osc.start(); osc.stop(ctx.currentTime + 0.05); }
  } catch {}
}

export default function MobileScannerPOS() {
  const { checkout, addMedicine, medicines, todaySales, pharmacyClients, addPharmacyDebt, updateMedicine } = usePharmacy();
  const [cart, setCart] = useState([]);
  const [scanValue, setScanValue] = useState("");
  const [status, setStatus] = useState({ type: "idle", msg: "📱 Scanner Ready — امسح الباركود الآن" });
  const [checkingOut, setCheckingOut] = useState(false);
  const [unknownCode, setUnknownCode] = useState(null);
  const [addForm, setAddForm] = useState({ name: "", quantity: "1", selling_price: "", purchase_price: "", wholesale_price: "", expiration_date: "" });
  const [adding, setAdding] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [isCredit, setIsCredit] = useState(false);
  const [isWholesale, setIsWholesale] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [pickMedicine, setPickMedicine] = useState(null);
  const [pickQty, setPickQty] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({ name: "", selling_price: "", purchase_price: "", wholesale_price: "", quantity: "" });
  const scanRef = useRef(null);

  useEffect(() => {
    if (pickMedicine) {
      setEditFields({
        name: pickMedicine.name || "",
        selling_price: String(pickMedicine.selling_price || ""),
        purchase_price: String(pickMedicine.purchase_price || ""),
        wholesale_price: String(pickMedicine.wholesale_price || ""),
        quantity: String(pickMedicine.quantity || ""),
      });
    }
  }, [pickMedicine]);

  const todayRev = useMemo(() => todaySales.reduce((s, sl) => s + Number(sl.total || 0), 0), [todaySales]);

  useEffect(() => {
    scanRef.current?.focus();
    function refocus(e) {
      if (e.target !== scanRef.current && scanRef.current) {
        const tag = e.target?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") return;
        scanRef.current.focus();
      }
    }
    window.addEventListener("click", refocus, true);
    return () => window.removeEventListener("click", refocus, true);
  }, []);

  // ── Determine price based on mode ──
  function getPrice(data) {
    if (isWholesale && data.wholesale_price && Number(data.wholesale_price) > 0) return Number(data.wholesale_price);
    return Number(data.selling_price);
  }

  const addToCart = useCallback((data, qtyOverride) => {
    const qty = qtyOverride || 1;
    const price = getPrice(data);
    setCart((prev) => {
      const existing = prev.find((c) => c.id === data.id);
      if (existing) return prev.map((c) => c.id === data.id ? { ...c, qty: Math.min(c.qty + qty, data.quantity) } : c);
      return [...prev, { id: data.id, name: data.name, price, purchasePrice: data.purchase_price || 0, wholesalePrice: data.wholesale_price || 0, qty: Math.min(qty, data.quantity), stock: data.quantity }];
    });
    playBeep("success");
  }, [isWholesale]);

  // ── Scan ──
  const handleScan = useCallback(async (barcode) => {
    const code = barcode.trim();
    if (!code) return;
    setStatus({ type: "scanning", msg: `🔍 بحث عن "${code}"...` });
    try {
      const { data, error } = await supabase.from("medicines").select("*").eq("qr_code", code).single();
      if (error || !data) {
        setStatus({ type: "error", msg: `❌ "${code}" غير موجود` });
        playBeep("error"); openQuickAdd(code); return;
      }
      if (data.quantity <= 0) {
        setStatus({ type: "error", msg: `⚠️ "${data.name}" — الكمية صفر` });
        playBeep("error");
        setTimeout(() => setStatus({ type: "idle", msg: "📱 Scanner Ready — امسح الباركود الآن" }), 2500); return;
      }
      addToCart(data);
      setStatus({ type: "success", msg: `✅ ${data.name} — ${getPrice(data)} ج.م` });
      setTimeout(() => setStatus({ type: "idle", msg: "📱 Scanner Ready — امسح الباركود الآن" }), 1500);
    } catch (err) {
      setStatus({ type: "error", msg: "❌ خطأ في الاتصال" });
      setTimeout(() => setStatus({ type: "idle", msg: "📱 Scanner Ready — امسح الباركود الآن" }), 2000);
    }
  }, [addToCart, isWholesale]);

  function openQuickAdd(code) {
    setUnknownCode(code);
    setAddForm({ name: "", qr_code: code, quantity: "1", selling_price: "", purchase_price: "", wholesale_price: "", expiration_date: "" });
  }
  function openManualAdd() {
    const genCode = Date.now().toString().slice(-10) + Math.floor(100 + Math.random() * 900).toString();
    openQuickAdd(genCode);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); const b = scanValue; setScanValue(""); handleScan(b); }
  }

  const total = useMemo(() => cart.reduce((s, c) => s + c.price * c.qty, 0), [cart]);
  const itemCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart]);
  const totalProfit = useMemo(() => cart.reduce((s, c) => s + (c.price - (c.purchasePrice || 0)) * c.qty, 0), [cart]);

  // ── Client search ──
  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return [];
    return pharmacyClients.filter((c) => c.name.toLowerCase().includes(q) || c.phone?.includes(q)).slice(0, 8);
  }, [pharmacyClients, clientSearch]);

  // ── Checkout ──
  async function handleCheckout() {
    if (cart.length === 0) return;
    setCheckingOut(true);
    const ok = await checkout({ cart, total, prescriptionId: null });
    if (ok) {
      if (selectedClient && isCredit) {
        addPharmacyDebt(selectedClient.id, total);
      }
      const r = { items: [...cart], total, profit: totalProfit, client: selectedClient, credit: isCredit, time: new Date().toLocaleString("ar-EG") };
      setCart([]);
      setReceipt(r);
      playBeep("success");
    } else {
      setStatus({ type: "error", msg: "❌ فشلت عملية البيع" });
    }
    setCheckingOut(false);
  }

  function removeItem(id) { setCart((prev) => prev.filter((c) => c.id !== id)); }

  async function handleQuickAdd() {
    if (!addForm.name.trim()) return;
    setAdding(true);
    try {
      const inserted = await addMedicine({
        name: addForm.name, qr_code: addForm.qr_code || unknownCode,
        quantity: Number(addForm.quantity) || 1,
        selling_price: Number(addForm.selling_price) || 0,
        purchase_price: Number(addForm.purchase_price) || 0,
        wholesale_price: Number(addForm.wholesale_price) || 0,
        expiration_date: addForm.expiration_date || null,
      });
      addToCart(inserted);
      setUnknownCode(null);
      setStatus({ type: "success", msg: `✅ تمت إضافة "${inserted.name}"` });
      setTimeout(() => setStatus({ type: "idle", msg: "📱 Scanner Ready" }), 2000);
    } catch (err) {
      setStatus({ type: "error", msg: `❌ ${err?.message || "فشلت الإضافة"}` });
    }
    setAdding(false);
  }

  const quickQtys = [1, 2, 3, 5, 10];
  const todayCount = todaySales.length;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {/* ─── Top bar: Snapshot + Client + Wholesale ─── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 flex-wrap">
        <div className="rounded-xl border px-3 py-1.5 text-center min-w-[80px]" style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}>
          <div className="text-xs font-black" style={{ color: "var(--accent)" }}>{todayRev} ج.م</div>
          <div className="text-[7px]" style={{ color: "var(--text-dim)" }}>مبيعات اليوم</div>
        </div>
        <div className="rounded-xl border px-3 py-1.5 text-center min-w-[55px]" style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}>
          <div className="text-xs font-black" style={{ color: "var(--info)" }}>{todayCount}</div>
          <div className="text-[7px]" style={{ color: "var(--text-dim)" }}>فواتير</div>
        </div>

        {/* Client selector */}
        <div className="relative flex-1 min-w-[160px] max-w-[240px]">
          <input value={clientSearch} onChange={(e) => setClientSearch(e.target.value)}
            placeholder={selectedClient ? `${selectedClient.name}${selectedClient.phone ? ` (${selectedClient.phone})` : ""}` : "👤 اختر عميل..."}
            onFocus={() => setClientSearch("")}
            className="w-full rounded-xl border p-1.5 text-[10px] outline-none"
            style={{ backgroundColor: "var(--bg-input)", borderColor: selectedClient ? "rgba(var(--accent-rgb), 0.3)" : "var(--border)", color: "var(--text)" }}
          />
          <AnimatePresence>
            {clientSearch && filteredClients.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute top-full right-0 left-0 z-20 mt-1 rounded-xl border shadow-lg overflow-hidden"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
                {filteredClients.map((c) => (
                  <button key={c.id} onClick={() => { setSelectedClient(c); setClientSearch(""); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-right transition-all hover:bg-black/5"
                    style={{ color: "var(--text)", borderBottom: "1px solid var(--border-light)" }}>
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>{c.phone || ""}</span>
                    {c.debt > 0 && <span className="mr-auto text-[9px]" style={{ color: "var(--danger)" }}>ديون: {c.debt}</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {selectedClient && (
            <button onClick={() => setSelectedClient(null)}
              className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] opacity-50 hover:opacity-100"
              style={{ color: "var(--danger)" }}>✕</button>
          )}
        </div>

        {/* Wholesale toggle */}
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsWholesale((p) => !p)}
          className="rounded-xl border px-2.5 py-1.5 text-[9px] font-bold transition-all"
          style={{
            borderColor: isWholesale ? "rgba(var(--accent2-rgb), 0.4)" : "var(--border-light)",
            backgroundColor: isWholesale ? "rgba(var(--accent2-rgb), 0.1)" : "var(--bg-input)",
            color: isWholesale ? "var(--accent2)" : "var(--text-muted)",
          }}>
          {isWholesale ? "🏷️ جملة" : "قطاعي"}
        </motion.button>

        {/* Credit toggle */}
        {selectedClient && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsCredit((p) => !p)}
            className="rounded-xl border px-2.5 py-1.5 text-[9px] font-bold transition-all"
            style={{
              borderColor: isCredit ? "rgba(var(--warning-rgb), 0.4)" : "var(--border-light)",
              backgroundColor: isCredit ? "rgba(var(--warning-rgb), 0.1)" : "var(--bg-input)",
              color: isCredit ? "var(--warning)" : "var(--text-muted)",
            }}>
            {isCredit ? "📝 آجل" : "نقداً"}
          </motion.button>
        )}
      </motion.div>

      {/* ─── Scanner ─── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border-2 p-4 text-center transition-all"
        style={{
          borderColor: status.type === "success" ? "rgba(16,185,129,0.5)" : status.type === "error" ? "rgba(var(--danger-rgb), 0.4)" : "var(--border)",
          backgroundColor: "var(--bg-card)",
        }}>
        <div className="flex items-center justify-center gap-3">
          <input ref={scanRef} type="text" value={scanValue} onChange={(e) => setScanValue(e.target.value)} onKeyDown={onKeyDown}
            autoComplete="off" spellCheck={false} placeholder="امسح الباركود..."
            className="flex-1 max-w-sm rounded-xl border-2 p-2.5 text-center text-sm font-bold tracking-[0.2em] outline-none"
            style={{ backgroundColor: "var(--bg-input)", borderColor: status.type === "success" ? "rgba(16,185,129,0.5)" : "var(--border)", color: "var(--accent)" }} />
          <motion.button whileTap={{ scale: 0.9 }} onClick={openManualAdd}
            className="shrink-0 rounded-xl border px-2.5 py-2 text-[9px] font-medium"
            style={{ borderColor: "var(--border)", color: "var(--accent)" }}>➕ إضافة</motion.button>
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-2">
          <span className="text-[9px]" style={{ color: status.type === "success" ? "var(--accent)" : status.type === "error" ? "var(--danger)" : "var(--text-muted)" }}>{status.msg}</span>
          <button onClick={() => setShowGrid((p) => !p)} className="text-[8px] px-1.5 py-0.5 rounded-lg border"
            style={{ borderColor: "var(--border-light)", color: "var(--text-dim)" }}>
            {showGrid ? "🔽 إخفاء" : "📋 أدوية"}
          </button>
        </div>
      </motion.div>

      {/* ─── Medicine Grid ─── */}
      <AnimatePresence>
        {showGrid && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <MedicineTileGrid medicines={medicines} onAddToCart={(m) => { setPickMedicine(m); setPickQty(1); }} isWholesale={isWholesale} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Quick-Add Modal ─── */}
      <AnimatePresence>
        {unknownCode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            onClick={() => setUnknownCode(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💊</span>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>إضافة دواء جديد</h3>
                  <p className="text-[9px]" style={{ color: "var(--text-dim)" }}>الباركود: <span className="font-mono font-bold" style={{ color: "var(--accent)" }}>{unknownCode}</span></p>
                </div>
              </div>
              <div className="space-y-2.5 text-[11px]">
                <input placeholder="اسم الدواء *" value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} autoFocus
                  className="w-full rounded-xl border p-2.5 outline-none"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                <BarcodeGenerator value={addForm.qr_code} onChange={(v) => setAddForm((p) => ({ ...p, qr_code: v }))} />
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" placeholder="الكمية" value={addForm.quantity} onChange={(e) => setAddForm((p) => ({ ...p, quantity: e.target.value }))}
                    className="rounded-xl border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                  <input type="number" placeholder="سعر البيع" value={addForm.selling_price} onChange={(e) => setAddForm((p) => ({ ...p, selling_price: e.target.value }))}
                    className="rounded-xl border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                  <input type="number" placeholder="جملة" value={addForm.wholesale_price} onChange={(e) => setAddForm((p) => ({ ...p, wholesale_price: e.target.value }))}
                    className="rounded-xl border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                  <input type="number" placeholder="سعر الشراء" value={addForm.purchase_price} onChange={(e) => setAddForm((p) => ({ ...p, purchase_price: e.target.value }))}
                    className="rounded-xl border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                  <input type="date" placeholder="الصلاحية" value={addForm.expiration_date} onChange={(e) => setAddForm((p) => ({ ...p, expiration_date: e.target.value }))}
                    className="rounded-xl border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleQuickAdd} disabled={adding || !addForm.name.trim()}
                  className="flex-1 rounded-xl py-2.5 text-xs font-bold text-white disabled:opacity-30"
                  style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}>
                  {adding ? "جاري..." : "💾 حفظ + إضافة للسلة"}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setUnknownCode(null)}
                  className="rounded-xl border px-4 py-2.5 text-xs font-medium"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>إلغاء</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Cart + Checkout ─── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
              🛒 السلة {cart.length > 0 && <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: "rgba(var(--accent-rgb), 0.1)", color: "var(--accent)" }}>{itemCount} قطعة</span>}
            </h3>
            {cart.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {quickQtys.map((q) => (
                    <button key={q} onClick={() => { const f = cart.find((c) => c.qty < c.stock); if (f) setCart((p) => p.map((x) => x.id === f.id ? { ...x, qty: Math.min(x.stock, q) } : x)); }}
                      className="rounded border px-1.5 py-0.5 text-[8px] font-bold"
                      style={{ borderColor: "var(--border-light)", color: "var(--text-dim)" }}>{q}</button>
                  ))}
                </div>
                <button onClick={() => setCart([])} className="text-[9px]" style={{ color: "var(--text-dim)" }}>🗑️</button>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="mb-1.5 hidden lg:grid lg:grid-cols-[1fr_65px_80px_65px_65px_28px] gap-1 px-2 text-[8px] font-bold" style={{ color: "var(--text-dim)" }}>
              <span>الاسم</span><span className="text-center">الكمية</span><span className="text-center">الوحدة</span><span className="text-center">الإجمالي</span><span className="text-center">الربح</span><span />
            </div>
          )}

          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {cart.map((c) => {
                const isLow = c.stock > 0 && c.stock <= 5;
                const margin = c.price - (c.purchasePrice || 0);
                const marginPct = c.purchasePrice > 0 ? Math.round((margin / c.purchasePrice) * 100) : null;
                return (
                  <motion.div key={c.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="rounded-xl border p-2.5 text-xs transition-all"
                    style={{ borderColor: isLow ? "rgba(var(--warning-rgb), 0.3)" : "var(--border-light)", backgroundColor: isLow ? "rgba(var(--warning-rgb), 0.04)" : "var(--bg-input)" }}>
                    <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_65px_80px_65px_65px_28px] items-center gap-1">
                      <div className="min-w-0">
                        <span className="font-semibold truncate block" style={{ color: "var(--text)" }}>{c.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[8px]" style={{ color: isLow ? "var(--warning)" : "var(--text-dim)" }}>
                            {isLow ? `⚠️ ${c.stock}` : `مخزون: ${c.stock}`}</span>
                          {isLow && <span className="rounded px-1 text-[7px] font-bold" style={{ backgroundColor: "rgba(var(--warning-rgb), 0.15)", color: "var(--warning)" }}>منخفض</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg border self-center justify-center" style={{ borderColor: "var(--border-light)" }}>
                        <button onClick={() => setCart((p) => p.map((x) => (x.id === c.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))}
                          className="px-1 py-0.5 text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>−</button>
                        <span className="min-w-[18px] text-center text-[10px] font-bold" style={{ color: "var(--text)" }}>{c.qty}</span>
                        <button onClick={() => setCart((p) => p.map((x) => (x.id === c.id ? { ...x, qty: Math.min(x.stock, x.qty + 1) } : x)))}
                          className="px-1 py-0.5 text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>+</button>
                      </div>
                      <div className="text-center text-[10px]" style={{ color: "var(--text-dim)" }}>{c.price} ج.م</div>
                      <div className="text-center text-xs font-bold" style={{ color: "var(--accent)" }}>{c.price * c.qty} ج.م</div>
                      <div className="text-center">
                        <span className="text-[9px] font-bold" style={{ color: margin > 0 ? "var(--accent2)" : "var(--danger)" }}>{margin * c.qty} ج.م</span>
                        {marginPct !== null && <span className="block text-[7px]" style={{ color: marginPct > 30 ? "var(--accent2)" : marginPct > 10 ? "var(--warning)" : "var(--danger)" }}>{marginPct}%</span>}
                      </div>
                      <button onClick={() => removeItem(c.id)} className="text-[9px] opacity-30 hover:opacity-100 justify-self-center" style={{ color: "var(--danger)" }}>✕</button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {cart.length === 0 && (
              <div className="flex flex-col items-center py-10 text-[11px]" style={{ color: "var(--text-dim)" }}>
                <span className="text-3xl mb-3 opacity-20">🛒</span>
                <span>السلة فارغة</span>
                <span className="text-[9px] mt-1">امسح باركود أو اضغط على دواء من الشبكة</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-3">
          <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
            <h3 className="text-xs font-bold mb-3 flex items-center gap-1" style={{ color: "var(--text)" }}>
              💰 الفاتورة {isWholesale && <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(var(--accent2-rgb), 0.12)", color: "var(--accent2)" }}>جملة</span>}
              {isCredit && <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(var(--warning-rgb), 0.12)", color: "var(--warning)" }}>آجل</span>}
            </h3>
            {selectedClient && (
              <div className="flex items-center justify-between mb-2 text-[9px]" style={{ color: "var(--text-muted)" }}>
                <span>👤 {selectedClient.name}{selectedClient.phone ? ` — ${selectedClient.phone}` : ""}</span>
                {selectedClient.debt > 0 && <span style={{ color: "var(--danger)" }}>ديون سابقة: {selectedClient.debt} ج.م</span>}
              </div>
            )}
            <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto">
              {cart.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span className="truncate ml-1">{c.name} × {c.qty}</span>
                  <span className="shrink-0">{c.price * c.qty} ج.م</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mb-3" style={{ borderColor: "var(--border-light)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold" style={{ color: "var(--text)" }}>الإجمالي</span>
                <span className="text-lg font-black" style={{ color: "var(--accent)" }}>{total} ج.م</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>الربح</span>
                <span className="text-[10px] font-bold" style={{ color: totalProfit > 0 ? "var(--accent2)" : "var(--text-dim)" }}>{totalProfit} ج.م</span>
              </div>
              {isCredit && selectedClient && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>إجمالي الديون</span>
                  <span className="text-[10px] font-bold" style={{ color: "var(--danger)" }}>{(selectedClient.debt || 0) + total} ج.م</span>
                </div>
              )}
            </div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleCheckout} disabled={cart.length === 0 || checkingOut}
              className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg disabled:opacity-25"
              style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}>
              {checkingOut ? <span className="flex items-center justify-center gap-2"><span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />جاري...</span>
                : `💳 ${isCredit ? "تسجيل آجل" : "تأكيد الدفع"} (${total} ج.م)`}
            </motion.button>
          </div>

          <div className="rounded-xl border p-3 text-[9px]" style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-card)" }}>
            <div className="font-semibold mb-1 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <span>⚡</span><span>مميزات الـ POS</span>
            </div>
            <ul className="space-y-0.5" style={{ color: "var(--text-dim)" }}>
              <li>• اختر عميل ← البيع يضاف لديونه تلقائي</li>
              <li>• زر آجل/نقداً للتبديل</li>
              <li>• زر جملة/قطاعي لتغيير الأسعار</li>
              <li>• شبكة الأدوية للبيع بدون scanner</li>
              <li>• الهامش والربض يظهر تحت كل صنف</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Receipt Modal ─── */}
      <AnimatePresence>
        {receipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setReceipt(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="text-3xl mb-1">🧾</div>
                <h3 className="text-sm font-black" style={{ color: "var(--text)" }}>عيادة الرحمة البيطرية</h3>
                <p className="text-[9px]" style={{ color: "var(--text-dim)" }}>{receipt.time}</p>
              </div>
              <div className="border-t border-b py-3 mb-3 space-y-1.5" style={{ borderColor: "var(--border-light)" }}>
                {receipt.items.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span>{c.name} × {c.qty}</span>
                    <span style={{ color: "var(--text)" }}>{c.price * c.qty} ج.م</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold" style={{ color: "var(--text)" }}>الإجمالي</span>
                <span className="text-lg font-black" style={{ color: "var(--accent)" }}>{receipt.total} ج.م</span>
              </div>
              {receipt.credit && (
                <div className="text-[9px] text-center mb-3" style={{ color: "var(--warning)" }}>
                  📝 تم تسجيل المبلغ كدين على {receipt.client?.name}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => window.print()}
                  className="flex-1 rounded-xl py-2.5 text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}>
                  🖨️ طباعة
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setReceipt(null)}
                  className="rounded-xl border px-4 py-2.5 text-xs font-medium"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>إغلاق</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Pick Medicine Dialog ─── */}
      <AnimatePresence>
        {pickMedicine && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            onClick={() => setPickMedicine(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs rounded-2xl border p-4 shadow-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold" style={{ color: "var(--text)" }}>
                  💊 {editMode ? "تعديل الدواء" : pickMedicine.name}
                </h3>
                <div className="flex gap-1">
                  <button onClick={() => { setEditMode((p) => !p); setPickQty(1); }}
                    className="rounded-lg border px-2 py-1 text-[9px] font-bold transition-all"
                    style={{
                      borderColor: editMode ? "rgba(var(--accent-rgb), 0.4)" : "var(--border-light)",
                      backgroundColor: editMode ? "rgba(var(--accent-rgb), 0.1)" : "transparent",
                      color: editMode ? "var(--accent)" : "var(--text-muted)",
                    }}>
                    {editMode ? "➕ إضافة" : "✏️ تعديل"}
                  </button>
                  <button onClick={() => { setPickMedicine(null); setEditMode(false); }}
                    className="rounded-lg border px-2 py-1 text-[9px]"
                    style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>✕</button>
                </div>
              </div>

              {editMode ? (
                <div className="space-y-2 text-[11px]">
                  <div>
                    <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>الاسم</span>
                    <input value={editFields.name} onChange={(e) => setEditFields((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>سعر البيع</span>
                      <input type="number" value={editFields.selling_price} onChange={(e) => setEditFields((p) => ({ ...p, selling_price: e.target.value }))}
                        className="w-full rounded-xl border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>سعر الشراء</span>
                      <input type="number" value={editFields.purchase_price} onChange={(e) => setEditFields((p) => ({ ...p, purchase_price: e.target.value }))}
                        className="w-full rounded-xl border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>سعر الجملة</span>
                      <input type="number" value={editFields.wholesale_price} onChange={(e) => setEditFields((p) => ({ ...p, wholesale_price: e.target.value }))}
                        className="w-full rounded-xl border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>الكمية</span>
                      <input type="number" value={editFields.quantity} onChange={(e) => setEditFields((p) => ({ ...p, quantity: e.target.value }))}
                        className="w-full rounded-xl border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        await updateMedicine(pickMedicine.id, {
                          name: editFields.name,
                          selling_price: Number(editFields.selling_price) || 0,
                          purchase_price: Number(editFields.purchase_price) || 0,
                          wholesale_price: Number(editFields.wholesale_price) || 0,
                          quantity: Number(editFields.quantity) || 0,
                        });
                        setPickMedicine(null);
                        setEditMode(false);
                        playBeep("success");
                      }}
                      className="flex-1 rounded-xl py-2.5 text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                      💾 حفظ التعديلات
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setEditMode(false); setPickQty(1); }}
                      className="rounded-xl border px-3 py-2.5 text-[10px]"
                      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>إلغاء</motion.button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>المخزون:</span>
                    <span className="text-[10px] font-bold" style={{ color: pickMedicine.quantity <= 0 ? "var(--danger)" : "var(--accent)" }}>
                      {pickMedicine.quantity}
                    </span>
                    <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>|</span>
                    <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>السعر:</span>
                    <span className="text-[10px] font-bold" style={{ color: "var(--accent2)" }}>
                      {isWholesale && pickMedicine.wholesale_price > 0 ? pickMedicine.wholesale_price : pickMedicine.selling_price} ج.م
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>الكمية:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 5, 10].map((n) => (
                        <button key={n} onClick={() => setPickQty(n)}
                          className="rounded-lg border px-2 py-1 text-[9px] font-bold transition-all"
                          style={{
                            borderColor: pickQty === n ? "rgba(var(--accent-rgb), 0.4)" : "var(--border-light)",
                            backgroundColor: pickQty === n ? "rgba(var(--accent-rgb), 0.1)" : "transparent",
                            color: pickQty === n ? "var(--accent)" : "var(--text-muted)",
                          }}>{n}</button>
                      ))}
                    </div>
                    <input type="number" min="1" max={pickMedicine.quantity} value={pickQty}
                      onChange={(e) => setPickQty(Math.max(1, Math.min(Number(e.target.value) || 1, pickMedicine.quantity)))}
                      className="w-14 rounded-lg border p-1.5 text-[10px] text-center outline-none"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                  </div>

                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        addToCart(pickMedicine, pickQty);
                        setPickMedicine(null);
                        scanRef.current?.focus();
                      }}
                      className="flex-1 rounded-xl py-2.5 text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}>
                      ➕ إضافة للفاتورة ({pickQty})
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setPickMedicine(null); setEditMode(false); }}
                      className="rounded-xl border px-3 py-2.5 text-[10px]"
                      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>إلغاء</motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
