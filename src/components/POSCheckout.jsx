import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

export default function POSCheckout({ medicines, onCompleteSale }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [scannedCode, setScannedCode] = useState("");

  // Handle scanned barcode/QR
  useEffect(() => {
    if (!scannedCode) return;
    const found = medicines.find((m) => m.qr_code === scannedCode);
    if (found && found.quantity > 0) {
      addToCart(found);
      setScannedCode("");
    } else {
      setScannedCode("");
    }
  }, [scannedCode]);

  function addToCart(med) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === med.id);
      if (existing) return prev.map((c) => (c.id === med.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id: med.id, name: med.name, price: med.selling_price, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  const total = useMemo(() => cart.reduce((s, c) => s + c.price * c.qty, 0), [cart]);

  const filtered = search
    ? medicines.filter((m) => m.name.includes(search) || m.qr_code?.includes(search))
    : medicines;

  function checkout() {
    if (cart.length === 0) return;
    onCompleteSale(cart, total);
    setCart([]);
  }

  return (
    <div className="card-premium p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px]" style={{ backgroundColor: "rgba(var(--accent-rgb), 0.12)" }}>🛒</span>
        <h3 className="text-[11px] font-bold" style={{ color: "var(--text)" }}>نقطة البيع (POS)</h3>
      </div>

      {/* Scanner input — hidden, triggered by useHardwareScanner */}
      <input type="text" value={scannedCode} onChange={(e) => setScannedCode(e.target.value)}
        placeholder="📷 امسح الباركود..."
        className="mb-2 w-full rounded-xl border p-2.5 text-xs outline-none transition-all"
        style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Left panel: search medicines */}
        <div>
          <input placeholder="🔍 بحث في الأدوية..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="mb-2 w-full rounded-lg border p-2 text-[10px] outline-none"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {filtered.slice(0, 20).map((m) => (
              <motion.button key={m.id} whileTap={{ scale: 0.95 }}
                disabled={m.quantity <= 0}
                onClick={() => addToCart(m)}
                className="flex w-full items-center justify-between rounded-lg border p-2 text-[10px] transition-all disabled:opacity-30"
                style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium" style={{ color: "var(--text)" }}>{m.name}</span>
                  {m.qr_code && <span className="text-[8px]" style={{ color: "var(--text-dim)" }}>📎</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: "var(--accent)" }}>{m.selling_price} ج.م</span>
                  <span className="text-[8px]" style={{ color: m.quantity <= 5 ? "var(--danger)" : "var(--text-dim)" }}>{m.quantity}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right panel: cart */}
        <div>
          <div className="mb-2 text-[9px] font-medium" style={{ color: "var(--text-dim)" }}>الفواتير ({cart.length})</div>
          <div className="max-h-36 space-y-1 overflow-y-auto mb-2">
            {cart.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-2 text-[10px]"
                style={{ borderColor: "var(--border-light)" }}>
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: "var(--text)" }}>{c.name}</span>
                  <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>×{c.qty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: "var(--accent)" }}>{c.price * c.qty} ج.م</span>
                  <button onClick={() => removeFromCart(c.id)} className="text-[9px] opacity-40 hover:opacity-100" style={{ color: "var(--danger)" }}>✕</button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="py-6 text-center text-[10px]" style={{ color: "var(--text-dim)" }}>
                السلة فارغة — امسح باركود أو اختر دواء
              </div>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border p-2 mb-2"
            style={{ borderColor: "rgba(var(--accent-rgb), 0.2)", backgroundColor: "rgba(var(--accent-rgb), 0.04)" }}>
            <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>الإجمالي</span>
            <span className="text-sm font-black" style={{ color: "var(--accent)" }}>{total} ج.م</span>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={checkout} disabled={cart.length === 0}
            className="w-full rounded-xl py-2.5 text-[11px] font-bold text-white transition-all shadow-lg disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, #065f46, #059669)", boxShadow: "0 4px 20px rgba(5,150,105,0.3)" }}>
            💳 إتمام البيع ({cart.length})
          </motion.button>
        </div>
      </div>
    </div>
  );
}
