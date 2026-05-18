import { useState, useMemo } from "react";
import { saveServices } from "../storage";
import { motion, AnimatePresence } from "framer-motion";

export default function ServicesPanel({
  services, selected, onAddService, onRemoveService, onPriceChange, onQtyChange, onUndo, onServicesChange, visits,
}) {
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [showManager, setShowManager] = useState(false);
  const [searchService, setSearchService] = useState("");

  // Count how many times each service was used
  const usageCounts = useMemo(() => {
    const counts = {};
    visits?.forEach((v) => {
      (v.services || "").split(/[،,]\s*/).forEach((s) => {
        if (s) counts[s] = (counts[s] || 0) + 1;
      });
    });
    return counts;
  }, [visits]);

  const filteredServices = useMemo(() => {
    if (!searchService.trim()) return services;
    const q = searchService.trim().toLowerCase();
    return services.filter((s) => s.name.toLowerCase().includes(q));
  }, [services, searchService]);

  function addFromList(e) {
    const svc = services.find((s) => s.id === e.target.value);
    if (svc) onAddService({ ...svc, uid: Date.now(), qty: svc.daily ? 1 : undefined });
    e.target.value = "";
  }

  function addCustom() {
    const n = customName.trim(), p = Number(customPrice);
    if (!n || !p) return;
    onAddService({ id: "custom", name: n, price: p, uid: Date.now() });
    setCustomName(""); setCustomPrice("");
  }

  return (
    <>
      <motion.div variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden" animate="visible"
        className="rounded-2xl border p-4 backdrop-blur-sm transition-all hover:shadow-lg"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold" style={{ color: "var(--accent3)" }}>💉 الخدمات</h2>
          <button onClick={() => setShowManager(true)}
            className="rounded-lg border px-2 py-1 text-[9px] transition-all hover:scale-105"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>⚙️ إدارة</button>
        </div>

        <input aria-label="ابحث عن خدمة" placeholder="🔍 ابحث عن خدمة..." value={searchService} onChange={(e) => setSearchService(e.target.value)}
          className="mb-2 w-full rounded-xl border p-2 text-[11px] outline-none transition-all"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />

        <select aria-label="اختر الخدمة الطبية" onChange={addFromList} defaultValue=""
          className="mb-3 w-full rounded-xl border p-2.5 text-xs outline-none transition-all focus:shadow-lg"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }}>
          <option value="" disabled>— اختر خدمة —</option>
          {filteredServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.price} ج.م {usageCounts[s.name] ? `(${usageCounts[s.name]})` : ""}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          <input aria-label="اسم الخدمة المخصصة" placeholder="خدمة مخصصة" value={customName} onChange={(e) => setCustomName(e.target.value)}
            className="flex-1 rounded-lg border p-2 text-xs outline-none"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
          <input aria-label="سعر الخدمة" type="number" placeholder="السعر" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)}
            className="w-20 rounded-lg border p-2 text-xs outline-none"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
          <motion.button whileTap={{ scale: 0.9 }} onClick={addCustom}
            className="rounded-lg px-4 py-2 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--accent3), var(--accent3-dark))" }}>+ إضافة</motion.button>
        </div>

        {/* Selected */}
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>فاتورة الزيارة الحالية:</span>
            {selected.length > 0 && <button onClick={onUndo} className="text-[10px] transition-all hover:scale-105" style={{ color: "var(--warning-dark)" }}>↩ تراجع</button>}
          </div>
          {selected.length === 0 ? (
            <p className="py-4 text-center text-xs" style={{ color: "var(--text-dim)" }}>لم تضف خدمات بعد</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              <AnimatePresence>
                {selected.map((item) => (
                    <motion.div key={item.uid} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0 }}
                      className="flex items-center gap-2 rounded-xl border p-2.5 text-xs"
                      style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}>
                      <span className="flex-1 font-medium truncate" style={{ color: "var(--text)" }}>{item.name}</span>
                      {item.daily ? (
                        <div className="flex items-center gap-1 rounded-lg border px-1.5 py-0.5" style={{ borderColor: "var(--warning)" }}>
                          <input type="number" min={1} value={item.qty || 1}
                            onChange={(e) => onQtyChange(item.uid, Math.max(1, Number(e.target.value)))}
                            className="w-10 bg-transparent text-center text-xs font-bold outline-none"
                            style={{ color: "var(--warning)" }} />
                          <span className="text-[8px]" style={{ color: "var(--text-dim)" }}>أيام</span>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-1 rounded-lg border px-1.5 py-0.5" style={{ borderColor: "var(--border-light)" }}>
                        <input type="number" value={item.price}
                          onChange={(e) => onPriceChange(item.uid, Number(e.target.value))}
                          className="w-14 bg-transparent text-center text-xs font-bold outline-none"
                          style={{ color: "var(--accent3)" }} />
                        <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>ج.م</span>
                      </div>
                      <span className="text-[9px] font-bold" style={{ color: "var(--accent)" }}>{Number(item.price) * (item.qty || 1)}</span>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => onRemoveService(item.uid)}
                        className="px-1 text-xs opacity-60 transition-opacity hover:opacity-100" style={{ color: "var(--danger)" }}>✕</motion.button>
                    </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Manage Services Modal */}
      {showManager && <ManageServicesModal services={services} onClose={() => setShowManager(false)} onChange={onServicesChange} />}
    </>
  );
}

function ManageServicesModal({ services, onClose, onChange }) {
  const [list, setList] = useState([...services]);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  function addService() {
    if (!newName.trim() || !Number(newPrice)) return;
    const s = { id: "s" + Date.now(), name: newName.trim(), price: Number(newPrice) };
    const updated = [...list, s];
    setList(updated); setNewName(""); setNewPrice("");
    persist(updated);
  }

  function deleteService(id) {
    const updated = list.filter((s) => s.id !== id);
    setList(updated);
    persist(updated);
  }

  function persist(data) {
    saveServices(data);
    if (onChange) onChange(data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl border p-5 shadow-2xl"
        style={{ backgroundColor: "var(--bg-card-solid)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>⚙️ إدارة الخدمات</h3>
          <button onClick={onClose} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>✕</button>
        </div>
        <div className="flex gap-2 mb-4">
          <input placeholder="اسم الخدمة" value={newName} onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-lg border p-2 text-xs outline-none"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
          <input type="number" placeholder="السعر" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
            className="w-20 rounded-lg border p-2 text-xs outline-none"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
          <button onClick={addService}
            className="rounded-lg px-3 py-2 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}>+</button>
        </div>
        <div className="max-h-60 space-y-1.5 overflow-y-auto">
          {list.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border p-2.5 text-xs"
              style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}>
              <span style={{ color: "var(--text)" }}>{s.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-bold" style={{ color: "var(--accent)" }}>{s.price} ج.م</span>
                <button onClick={() => deleteService(s.id)} style={{ color: "var(--danger)" }} className="opacity-60 hover:opacity-100">✕</button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
