import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useScannerInput from "../../../hooks/useScannerInput";
import { usePharmacy } from "../PharmacyContext";
import { supabase } from "../../../supabaseClient";

export default function PosDashboard() {
  const { medicines, lookupQR, searchMeds, checkout, pendingRx, prescriptions, prescriptionItems, syncing: ctxSync } = usePharmacy();
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRx, setSelectedRx] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [lastScan, setLastScan] = useState(null);

  // Auto-focused scanner input
  const { code, setCode, inputRef } = useScannerInput({
    onScan: (val) => {
      const med = lookupQR(val);
      if (med) {
        addToCart(med);
        setLastScan(med.name);
        setTimeout(() => setLastScan(null), 1500);
      }
    },
  });

  const filtered = useMemo(() => searchMeds(search), [search, medicines]);

  function addToCart(med) {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === med.id);
      if (ex) return prev.map((c) => (c.id === med.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id: med.id, name: med.name, price: med.selling_price, qty: 1, stock: med.quantity }];
    });
  }

  function updateQty(id, delta) {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)));
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  const total = useMemo(() => cart.reduce((s, c) => s + c.price * c.qty, 0), [cart]);

  // Load prescription items into cart
  const loadRx = useCallback((rx) => {
    const items = prescriptionItems.filter((i) => i.prescription_id === rx.id);
    const newCart = [];
    items.forEach((item) => {
      const med = medicines.find((m) => m.id === item.medicine_id);
      if (med && med.quantity > 0) {
        const ex = newCart.find((c) => c.id === med.id);
        if (ex) ex.qty += item.quantity_prescribed;
        else newCart.push({ id: med.id, name: med.name, price: med.selling_price, qty: item.quantity_prescribed, stock: med.quantity });
      }
    });
    setCart(newCart);
    setSelectedRx(rx.id);
  }, [prescriptionItems, medicines]);

  const rxItems = useMemo(() => {
    if (!selectedRx) return [];
    return prescriptionItems.filter((i) => i.prescription_id === selectedRx);
  }, [selectedRx, prescriptionItems]);

  async function handleCheckout() {
    if (cart.length === 0) return;
    setCheckingOut(true);
    const ok = await checkout({ cart, total, prescriptionId: selectedRx });
    if (ok) {
      setCart([]);
      setSelectedRx(null);
    }
    setCheckingOut(false);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {/* Scanner bar — always focused */}
      <div className="relative">
        <input ref={inputRef} type="text" value={code} onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-2xl border-2 p-4 pr-12 text-base font-bold tracking-widest outline-none transition-all"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: lastScan ? "rgba(16,185,129,0.5)" : "var(--border)",
            color: "var(--accent)",
            boxShadow: lastScan ? "0 0 30px rgba(16,185,129,0.15)" : "var(--shadow-card)",
          }}
          placeholder="📷 امسح الباركود أو QR — scanner جاهز..." />
        {lastScan && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="absolute -top-3 left-4 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}>
            ✅ {lastScan}
          </motion.div>
        )}
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg opacity-40">📷</span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Left: Prescriptions */}
        <div className="lg:col-span-1 space-y-4">
          <PrescriptionPanel
            prescriptions={prescriptions}
            items={prescriptionItems}
            selectedRx={selectedRx}
            onSelect={loadRx}
            onDeselect={() => { setSelectedRx(null); setCart([]); }}
          />
        </div>

        {/* Center: Medicine browser */}
        <div className="lg:col-span-2 space-y-4">
          <MedicineBrowser
            medicines={filtered}
            search={search}
            onSearch={setSearch}
            onAdd={addToCart}
          />
        </div>

        {/* Right: Cart */}
        <div className="lg:col-span-1 space-y-4">
          <CheckoutCart
            cart={cart}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            total={total}
            onCheckout={handleCheckout}
            checkingOut={checkingOut}
            rxId={selectedRx}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function PrescriptionPanel({ prescriptions, items, selectedRx, onSelect, onDeselect }) {
  const pending = prescriptions.filter((p) => p.status === "pending");
  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold flex items-center gap-1.5" style={{ color: "var(--info)" }}>
          📋 الوصفات
          {pending.length > 0 && <span className="rounded-full px-1.5 py-0.5 text-[8px]" style={{ backgroundColor: "rgba(var(--warning-rgb), 0.12)", color: "var(--warning)" }}>{pending.length}</span>}
        </h3>
        {selectedRx && (
          <button onClick={onDeselect} className="text-[8px]" style={{ color: "var(--text-dim)" }}>✕ إلغاء</button>
        )}
      </div>
      {pending.length === 0 ? (
        <div className="py-6 text-center text-[9px]" style={{ color: "var(--text-dim)" }}>لا توجد وصفات معلقة</div>
      ) : (
        <div className="max-h-72 space-y-1.5 overflow-y-auto">
          {pending.map((rx) => {
            const rxItems = items.filter((i) => i.prescription_id === rx.id);
            const isSelected = selectedRx === rx.id;
            return (
              <motion.button key={rx.id} layout whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(rx)}
                className="w-full rounded-xl border p-2 text-right text-[10px] transition-all"
                style={{
                  borderColor: isSelected ? "rgba(var(--accent-rgb), 0.4)" : "var(--border-light)",
                  backgroundColor: isSelected ? "rgba(var(--accent-rgb), 0.06)" : "var(--bg-input)",
                  borderRight: isSelected ? "3px solid var(--accent)" : "3px solid transparent",
                }}>
                <div className="font-semibold" style={{ color: "var(--text)" }}>{rx.patient_name} — {rx.patient_animal}</div>
                <div className="text-[8px] mt-0.5" style={{ color: "var(--text-dim)" }}>
                  {rx.doctor_name && `د. ${rx.doctor_name} · `}{rx.diagnosis && `${rx.diagnosis} · `}{new Date(rx.created_at).toLocaleDateString("ar-EG")}
                </div>
                {rxItems.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {rxItems.map((it) => (
                      <div key={it.id} className="text-[8px]" style={{ color: "var(--text-muted)" }}>💊 ×{it.quantity_prescribed}</div>
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MedicineBrowser({ medicines, search, onSearch, onAdd }) {
  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
      <input placeholder="🔍 بحث في الأدوية..." value={search} onChange={(e) => onSearch(e.target.value)}
        className="mb-2 w-full rounded-xl border p-2.5 text-[10px] outline-none"
        style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
      <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto">
        {medicines.slice(0, 40).map((m) => (
          <motion.button key={m.id} whileTap={{ scale: 0.93 }} layout
            disabled={m.quantity <= 0}
            onClick={() => onAdd(m)}
            className="rounded-xl border px-3 py-2 text-[10px] text-right transition-all disabled:opacity-25"
            style={{
              borderColor: m.quantity <= 5 ? "rgba(var(--warning-rgb), 0.2)" : "var(--border-light)",
              backgroundColor: m.quantity <= 0 ? "var(--bg-input)" : "var(--bg-card-hover)",
              opacity: m.quantity <= 0 ? 0.35 : 1,
            }}>
            <div className="font-semibold" style={{ color: "var(--text)" }}>{m.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-bold" style={{ color: "var(--accent)" }}>{m.selling_price} ج.م</span>
              <span className="text-[8px]" style={{ color: m.quantity <= 5 ? "var(--warning)" : "var(--text-dim)" }}>مخزون: {m.quantity}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function CheckoutCart({ cart, onUpdateQty, onRemove, total, onCheckout, checkingOut, rxId }) {
  return (
    <div className="rounded-2xl border p-3 h-full flex flex-col" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
      <h3 className="text-[10px] font-bold flex items-center gap-1.5 mb-2" style={{ color: "var(--accent)" }}>
        🛒 السلة ({cart.length})
        {rxId && <span className="rounded-full px-1.5 py-0.5 text-[8px]" style={{ backgroundColor: "rgba(var(--info-rgb), 0.1)", color: "var(--info)" }}>وصفة</span>}
      </h3>

      <div className="flex-1 space-y-1 overflow-y-auto max-h-60 mb-2">
        <AnimatePresence>
          {cart.map((c) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex items-center justify-between rounded-xl border p-2 text-[10px]"
              style={{ borderColor: "var(--border-light)" }}>
              <div className="flex-1 min-w-0">
                <span className="font-semibold truncate block" style={{ color: "var(--text)" }}>{c.name}</span>
                <span className="text-[8px]" style={{ color: c.stock - c.qty <= 0 ? "var(--danger)" : "var(--text-dim)" }}>
                  {c.stock - c.qty <= 0 ? "⚠️ سيتم النفاد" : `المتبقي: ${c.stock - c.qty}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 mr-2">
                <div className="flex items-center gap-1 rounded-lg border px-1" style={{ borderColor: "var(--border-light)" }}>
                  <button onClick={() => onUpdateQty(c.id, -1)} className="px-1 text-[9px] font-bold" style={{ color: "var(--text-muted)" }}>−</button>
                  <span className="min-w-[18px] text-center text-[10px] font-bold" style={{ color: "var(--text)" }}>{c.qty}</span>
                  <button onClick={() => onUpdateQty(c.id, 1)} className="px-1 text-[9px] font-bold" style={{ color: "var(--text-muted)" }}>+</button>
                </div>
                <span className="font-bold text-[10px] min-w-[48px] text-left" style={{ color: "var(--accent)" }}>{c.price * c.qty} ج.م</span>
                <button onClick={() => onRemove(c.id)} className="text-[9px] opacity-30 hover:opacity-100" style={{ color: "var(--danger)" }}>✕</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {cart.length === 0 && (
          <div className="py-8 text-center text-[9px]" style={{ color: "var(--text-dim)" }}>
            السلة فارغة<br />امسح باركود أو اختر دواء
          </div>
        )}
      </div>

      <div className="rounded-xl border p-2.5 mb-2 text-center"
        style={{ borderColor: "rgba(var(--accent-rgb), 0.2)", backgroundColor: "rgba(var(--accent-rgb), 0.04)" }}>
        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>الإجمالي</span>
        <span className="block text-base font-black" style={{ color: "var(--accent)" }}>{total} ج.م</span>
      </div>

      <motion.button whileTap={{ scale: 0.96 }} onClick={onCheckout} disabled={cart.length === 0 || checkingOut}
        className="w-full rounded-xl py-3 text-[11px] font-bold text-white shadow-lg transition-all disabled:opacity-25"
        style={{
          background: "linear-gradient(135deg, #065f46, #059669)",
          boxShadow: "0 4px 24px rgba(5,150,105,0.3)",
        }}>
        {checkingOut ? "جاري المعالجة..." : `💳 إتمام البيع (${cart.length})`}
      </motion.button>
    </div>
  );
}
