import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientSelector({ clients, selectedClientId, onSelect, onAdd, onUpdate, onDelete, onBulkDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [newName, setNewName] = useState("");
  const [newAnimal, setNewAnimal] = useState("");
  const [newType, setNewType] = useState("قطة");
  const [newGender, setNewGender] = useState("ذكر");
  const [newPhone, setNewPhone] = useState("");
  const [newWeight, setNewWeight] = useState("");

  const client = clients.find((c) => c.id === selectedClientId);

  function handleSubmit(e) {
    e.preventDefault();
    if (!newName.trim() || !newAnimal.trim()) return;
    onAdd({ name: newName.trim(), animal: newAnimal.trim(), type: newType, gender: newGender, phone: newPhone.trim(), weight: newWeight.trim() });
    setNewName(""); setNewAnimal(""); setNewPhone(""); setNewWeight(""); setShowForm(false);
  }

  function startEdit() {
    if (!client) return;
    setNewName(client.name);
    setNewAnimal(client.animal);
    setNewType(client.type);
    setNewGender(client.gender || "ذكر");
    setNewPhone(client.phone || "");
    setNewWeight(client.weight || "");
    setEditMode(true);
  }

  function handleUpdate(e) {
    e.preventDefault();
    if (!newName.trim() || !newAnimal.trim()) return;
    onUpdate(selectedClientId, { name: newName.trim(), animal: newAnimal.trim(), type: newType, gender: newGender, phone: newPhone.trim(), weight: newWeight.trim() });
    setNewName(""); setNewAnimal(""); setNewPhone(""); setNewWeight(""); setEditMode(false);
  }

  function toggleManage() {
    setManageMode(!manageMode);
    setSelectedIds([]);
  }

  function toggleId(id) {
    setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }

  function selectAll() {
    if (selectedIds.length === clients.length) setSelectedIds([]);
    else setSelectedIds(clients.map((c) => c.id));
  }

  function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    onBulkDelete(selectedIds);
    setSelectedIds([]);
    setManageMode(false);
  }

  const genderIcon = (g) => g === "ذكر" ? "♂️" : "♀️";

  if (editMode) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border p-4 backdrop-blur-sm" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
        <h2 className="text-xs font-bold mb-3" style={{ color: "var(--warning-dark)" }}>✏️ تعديل العميل</h2>
        <form onSubmit={handleUpdate} className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <input aria-label="الاسم" placeholder="الاسم" value={newName} onChange={(e) => setNewName(e.target.value)} required className="flex-1 rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
            <input aria-label="الحيوان" placeholder="الحيوان" value={newAnimal} onChange={(e) => setNewAnimal(e.target.value)} required className="flex-1 rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <input aria-label="رقم الهاتف" placeholder="رقم الهاتف" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="flex-1 rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
            <input aria-label="الوزن (كجم)" placeholder="الوزن (كجم)" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="w-20 rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
            <select aria-label="نوع الحيوان" value={newType} onChange={(e) => setNewType(e.target.value)} className="rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }}>
              <option value="قطة">قطة</option><option value="كلب">كلب</option><option value="طائر">طائر</option><option value="أرنب">أرنب</option><option value="آخر">آخر</option>
            </select>
            <select aria-label="الجنس" value={newGender} onChange={(e) => setNewGender(e.target.value)} className="rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }}>
              <option value="ذكر">♂ ذكر</option><option value="أنثى">♀ أنثى</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-lg py-2 text-xs font-bold text-white transition-all hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, var(--warning), var(--warning-dark))" }}>💾 حفظ التعديل</button>
            <button type="button" onClick={() => setEditMode(false)} className="rounded-lg border px-4 py-2 text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>إلغاء</button>
          </div>
        </form>
      </motion.div>
    );
  }

  if (manageMode) {
    return (
      <motion.div
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden" animate="visible"
        className="rounded-2xl border p-4 backdrop-blur-sm"
        style={{ borderColor: "var(--danger)", backgroundColor: "var(--bg-card)" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold" style={{ color: "var(--danger)" }}>🗑️ إدارة العملاء</h2>
          <button onClick={toggleManage} className="rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all hover:scale-105"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>رجوع</button>
        </div>
        {clients.length === 0 ? (
          <div className="py-6 text-center text-[10px]" style={{ color: "var(--text-dim)" }}>لا يوجد عملاء</div>
        ) : (
          <div className="max-h-72 space-y-1 overflow-y-auto mb-2">
            {clients.map((c) => (
              <label key={c.id} className="flex items-center gap-2 rounded-lg border p-2 text-[10px] cursor-pointer transition-all hover:bg-opacity-50"
                style={{ borderColor: selectedIds.includes(c.id) ? "var(--danger)" : "var(--border-light)", backgroundColor: selectedIds.includes(c.id) ? "rgba(var(--danger-rgb), 0.06)" : "var(--bg-input)" }}>
                <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleId(c.id)}
                  className="accent-red-500" />
                <span className="flex-1" style={{ color: "var(--text)" }}>{c.name} — {c.animal} ({c.type})</span>
                {c.debt > 0 && <span className="font-bold" style={{ color: "var(--warning)" }}>+{c.debt} ج.م</span>}
                <span className="text-[8px]" style={{ color: "var(--text-dim)" }}>{genderIcon(c.gender)} {c.phone || "—"}</span>
              </label>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={selectAll} className="rounded-lg border px-3 py-1.5 text-[10px] font-medium transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            {selectedIds.length === clients.length ? "إلغاء التحديد" : "تحديد الكل"}
          </button>
          <button onClick={handleBulkDelete} disabled={selectedIds.length === 0}
            className="flex-1 rounded-lg py-1.5 text-[10px] font-bold text-white transition-all disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
            🗑️ حذف المحددين ({selectedIds.length})
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
      initial="hidden" animate="visible"
      className="rounded-2xl border p-4 backdrop-blur-sm transition-all hover:shadow-lg"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold" style={{ color: "var(--accent2)" }}>👤 العميل والحيوان</h2>
        <div className="flex gap-1.5">
          {clients.length > 0 && (
            <button onClick={toggleManage}
              className="rounded-lg border px-2 py-1 text-[10px] font-medium transition-all hover:scale-105"
              style={{ borderColor: "rgba(var(--danger-rgb), 0.2)", color: "var(--danger)" }}>
              🗑️ حذف
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)}
            className="rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all hover:scale-105"
            style={{ borderColor: "var(--border)", color: "var(--accent2)" }}>
            {showForm ? "إلغاء" : "+ جديد"}
          </button>
        </div>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <input aria-label="الاسم" placeholder="الاسم" value={newName} onChange={(e) => setNewName(e.target.value)} required className="flex-1 rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
            <input aria-label="الحيوان" placeholder="الحيوان" value={newAnimal} onChange={(e) => setNewAnimal(e.target.value)} required className="flex-1 rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <input aria-label="رقم الهاتف" placeholder="رقم الهاتف" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="flex-1 rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
            <input aria-label="الوزن (كجم)" placeholder="الوزن (كجم)" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="w-20 rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
            <select aria-label="نوع الحيوان" value={newType} onChange={(e) => setNewType(e.target.value)} className="rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }}>
              <option value="قطة">قطة</option><option value="كلب">كلب</option><option value="طائر">طائر</option><option value="أرنب">أرنب</option><option value="آخر">آخر</option>
            </select>
            <select aria-label="الجنس" value={newGender} onChange={(e) => setNewGender(e.target.value)} className="rounded-lg border p-2 text-xs outline-none" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }}>
              <option value="ذكر">♂ ذكر</option><option value="أنثى">♀ أنثى</option>
            </select>
          </div>
          <button type="submit" className="w-full rounded-lg py-2 text-xs font-bold text-white transition-all hover:scale-[1.01] active:scale-95" style={{ background: "linear-gradient(135deg, var(--accent2), var(--accent2-dark))" }}>حفظ العميل</button>
        </form>
      ) : (
        <div>
          <select
            aria-label="اختر العميل"
            value={selectedClientId}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full rounded-xl border p-2.5 text-xs outline-none transition-all focus:shadow-lg"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <option value="">— اختر عميل —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.animal} ({c.type}){c.debt > 0 ? ` | +${c.debt} ج.م` : ""}
              </option>
            ))}
          </select>

          <AnimatePresence>
            {client && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span>📞 {client.phone || "—"}</span>
                    <span>🐾 {client.type}</span>
                    <span>{genderIcon(client.gender)}</span>
                    {client.weight && <span>⚖️ {client.weight} كجم</span>}
                    {client.debt > 0 && <span style={{ color: "var(--warning)" }}>+{client.debt} ج.م دين</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={startEdit} className="rounded-lg border px-2 py-0.5 text-[9px] transition-all hover:scale-105" style={{ borderColor: "var(--border)", color: "var(--warning-dark)" }}>✏️</button>
                    <button onClick={() => onDelete(selectedClientId)} className="rounded-lg border px-2 py-0.5 text-[9px] transition-all hover:scale-105" style={{ borderColor: "var(--border)", color: "var(--danger)" }}>🗑️</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
