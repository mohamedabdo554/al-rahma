import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BarcodeGenerator from "./BarcodeGenerator";

export default function MedicineCabinet({ medicines, onAdd, onUpdate, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [editPriceVal, setEditPriceVal] = useState("");
  const [form, setForm] = useState({ name: "", qr_code: "", quantity: "", purchase_price: "", selling_price: "", wholesale_price: "", expiration_date: "" });

  function handleAdd() {
    if (!form.name.trim()) return;
    onAdd({ ...form, id: Date.now().toString(), quantity: Number(form.quantity) || 0, purchase_price: Number(form.purchase_price) || 0, selling_price: Number(form.selling_price) || 0, wholesale_price: Number(form.wholesale_price) || 0 });
    setForm({ name: "", qr_code: "", quantity: "", purchase_price: "", selling_price: "", wholesale_price: "", expiration_date: "" });
    setShowAdd(false);
  }

  const lowStock = medicines.filter((m) => m.quantity > 0 && m.quantity <= 5).length;
  const expired = medicines.filter((m) => m.expiration_date && m.expiration_date < new Date().toISOString().slice(0, 10)).length;

  function printBarcode(m) {
    const code = m.qr_code || m.id;
    const win = window.open("", "_blank");
    win.document.write(`
      <html dir="rtl"><head><style>
        @page { size: 50mm 30mm; margin: 0; }
        body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 30mm; font-family: 'Cairo', sans-serif; }
        svg { max-width: 44mm; height: 12mm; }
        .name { font-size: 7px; font-weight: bold; text-align: center; margin-top: 2px; }
        .price { font-size: 8px; font-weight: 900; text-align: center; color: #6366f1; }
      </style></head><body>
        <svg id="barcode"></svg>
        <div class="name">${m.name}</div>
        <div class="price">${m.selling_price} ج.م</div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3/dist/JsBarcode.all.min.js"><\/script>
        <script>
          JsBarcode("#barcode", "${code}", { format: "CODE128", width: 1.2, height: 24, displayValue: true, fontSize: 10, margin: 0 });
          setTimeout(() => { window.print(); }, 500);
        <\/script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div className="card-premium p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px]" style={{ backgroundColor: "rgba(var(--accent2-rgb), 0.12)" }}>💊</span>
          <h3 className="text-[11px] font-bold" style={{ color: "var(--text)" }}>المخزون الدوائي</h3>
          {lowStock > 0 && <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold" style={{ backgroundColor: "rgba(var(--danger-rgb), 0.1)", color: "var(--danger)" }}>{lowStock} منخفض</span>}
          {expired > 0 && <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold" style={{ backgroundColor: "rgba(var(--warning-rgb), 0.1)", color: "var(--warning)" }}>{expired} منتهي</span>}
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAdd((p) => !p)}
          className="rounded-lg border px-2.5 py-1 text-[9px] font-medium"
          style={{ borderColor: "var(--border)", color: "var(--accent2)" }}>
          + إضافة دواء
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-3 space-y-2 overflow-hidden rounded-xl border p-3" style={{ borderColor: "var(--border-light)" }}>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <input placeholder="اسم الدواء" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="rounded-lg border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
              <div className="col-span-2">
                <BarcodeGenerator
                  value={form.qr_code}
                  onChange={(v) => setForm((p) => ({ ...p, qr_code: v }))}
                />
              </div>
              <input type="number" placeholder="الكمية" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                className="rounded-lg border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
              <input type="date" placeholder="تاريخ الصلاحية" value={form.expiration_date} onChange={(e) => setForm((p) => ({ ...p, expiration_date: e.target.value }))}
                className="rounded-lg border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
              <input type="number" placeholder="سعر الشراء" value={form.purchase_price} onChange={(e) => setForm((p) => ({ ...p, purchase_price: e.target.value }))}
                className="rounded-lg border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
              <input type="number" placeholder="سعر البيع" value={form.selling_price} onChange={(e) => setForm((p) => ({ ...p, selling_price: e.target.value }))}
                className="rounded-lg border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
              <input type="number" placeholder="سعر الجملة" value={form.wholesale_price} onChange={(e) => setForm((p) => ({ ...p, wholesale_price: e.target.value }))}
                className="rounded-lg border p-2 outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleAdd}
              className="w-full rounded-lg py-2 text-[10px] font-bold text-white"
              style={{ background: "var(--accent2)" }}>
              💾 حفظ الدواء
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {medicines.length === 0 ? (
        <div className="py-8 text-center text-[11px]" style={{ color: "var(--text-dim)" }}>
          <span className="text-2xl block mb-2 opacity-30">💊</span>
          لا توجد أدوية في المخزون
        </div>
      ) : (
        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {[...medicines].sort((a, b) => a.name.localeCompare(b.name)).map((m) => {
            const isLow = m.quantity > 0 && m.quantity <= 5;
            const isExpired = m.expiration_date && m.expiration_date < new Date().toISOString().slice(0, 10);
            const isOut = m.quantity <= 0;
            return (
              <motion.div key={m.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between rounded-lg border p-2.5 text-xs"
                style={{
                  borderColor: isExpired ? "rgba(var(--danger-rgb), 0.2)" : isLow ? "rgba(var(--warning-rgb), 0.2)" : "var(--border-light)",
                  backgroundColor: isExpired ? "rgba(var(--danger-rgb), 0.03)" : isLow ? "rgba(var(--warning-rgb), 0.03)" : "var(--bg-input)",
                }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold truncate" style={{ color: "var(--text)" }}>{m.name}</span>
                    <span className="text-[9px] font-bold" style={{ color: isOut ? "var(--danger)" : isLow ? "var(--warning)" : "var(--accent)" }}>
                      ({m.quantity})
                    </span>
                    {isOut && <span className="rounded px-1 text-[8px] font-bold" style={{ backgroundColor: "rgba(var(--danger-rgb), 0.15)", color: "var(--danger)" }}>نفد</span>}
                    {isExpired && <span className="rounded px-1 text-[8px] font-bold" style={{ backgroundColor: "rgba(var(--danger-rgb), 0.1)", color: "var(--danger)" }}>منتهي</span>}
                  </div>
                  <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>
                    {m.qr_code && <span className="ml-2">📎 {m.qr_code}</span>}
                    {m.expiration_date && <span>صلاحية: {m.expiration_date}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 mr-2">
                  <div className="text-right">
                    <div className="font-bold" style={{ color: isExpired ? "var(--danger)" : isLow ? "var(--warning)" : "var(--accent)" }}>
                      {m.quantity}
                    </div>
                    {editingPrice === m.id ? (
                      <div className="flex gap-1 items-center">
                        <input type="number" value={editPriceVal} onChange={(e) => setEditPriceVal(e.target.value)}
                          className="w-16 rounded border p-0.5 text-[9px] text-center outline-none"
                          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                        <button onClick={() => { onUpdate(m.id, { selling_price: Number(editPriceVal) }); setEditingPrice(null); }}
                          className="text-[9px] font-bold" style={{ color: "var(--accent)" }}>💾</button>
                        <button onClick={() => setEditingPrice(null)} className="text-[9px]" style={{ color: "var(--text-muted)" }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingPrice(m.id); setEditPriceVal(m.selling_price); }}
                        className="text-[9px] transition-all hover:scale-105" style={{ color: "var(--text-dim)" }}>
                        {m.selling_price} ج.م ✏️
                      </button>
                    )}
                  </div>
                  {confirmDelete === m.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => { onDelete(m.id); setConfirmDelete(null); }}
                        className="rounded-lg border px-2 py-0.5 text-[9px] font-bold"
                        style={{ borderColor: "var(--danger)", color: "var(--danger)", backgroundColor: "rgba(var(--danger-rgb), 0.12)" }}>
                        تأكيد
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="rounded-lg border px-2 py-0.5 text-[9px]"
                        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(m.id)}
                      className="rounded-lg border px-2 py-1 text-[9px] font-bold transition-all hover:scale-105"
                      style={{ borderColor: "rgba(var(--danger-rgb), 0.3)", color: "var(--danger)", backgroundColor: "rgba(var(--danger-rgb), 0.06)" }}>
                      🗑️
                    </button>
                  )}
                  <button onClick={() => printBarcode(m)}
                    className="rounded-lg border px-2 py-1 text-[9px] transition-all hover:scale-105"
                    style={{ borderColor: "rgba(var(--accent2-rgb), 0.3)", color: "var(--accent2)", backgroundColor: "rgba(var(--accent2-rgb), 0.06)" }}>
                    🏷️
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
