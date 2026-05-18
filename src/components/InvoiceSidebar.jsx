import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceRecorder from "./VoiceRecorder";

export default function InvoiceSidebar({
  client, prevDebt, servicesTotal, selected,
  discount, setDiscount, paid, setPaid, method, setMethod, remaining,
  followUpDate, setFollowUpDate, followUpTime, setFollowUpTime, followUpReason, setFollowUpReason,
  notes, setNotes, visitWeight, setVisitWeight,
  onSave, onShowInvoice, onSendWA, onAudioChange,
  doctors, selectedDoctor, onDoctorChange,
}) {
  useEffect(() => {
    if (client?.weight && !visitWeight) setVisitWeight(client.weight);
  }, [client?.id]);

  const clientPhone = client?.phone?.trim();
  const phoneDisplay = clientPhone
    ? `0${clientPhone.replace(/^20/, "")}`
    : clientPhone || "";

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
      <div id="invoice-card"
        className="sticky top-4 rounded-2xl border p-5 backdrop-blur-xl transition-all space-y-4"
        style={{ borderColor: "rgba(var(--accent-rgb), 0.25)", backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-card)" }}>
        <div className="absolute top-0 right-8 left-8 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
        <h2 className="relative text-sm font-bold flex items-center gap-2" style={{ color: "var(--accent)" }}>
          <span className="flex h-6 w-6 items-center justify-center rounded-lg text-xs" style={{ backgroundColor: "rgba(var(--accent-rgb), 0.12)" }}>💳</span> الفاتورة
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="الدين السابق" value={`${prevDebt} ج.م`} color="var(--warning-dark)" />
          <MetricCard label="الفاتورة الحالية" value={`${servicesTotal} ج.م`} color="var(--text)" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>🏷️ خصم</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)}
              className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none transition-all"
              style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--warning-dark)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }} />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>✅ مدفوع</label>
            <input type="number" value={paid} onChange={(e) => setPaid(e.target.value)}
              className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none transition-all"
              style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--accent)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>💳 طريقة الدفع</label>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            {["كاش", "فيزا", "محفظة"].map((m) => (
              <button key={m} onClick={() => setMethod(m)}
                className="rounded-lg border py-2 font-medium transition-all active:scale-95"
                style={{ borderColor: method === m ? "var(--accent)" : "var(--border)", backgroundColor: method === m ? "rgba(var(--accent-rgb), 0.12)" : "transparent", color: method === m ? "var(--accent)" : "var(--text-muted)", boxShadow: method === m ? `0 0 20px rgba(var(--accent-rgb), 0.08)` : "none" }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-3 text-center text-sm font-bold transition-all"
          style={{ borderColor: remaining > 0 ? "rgba(var(--danger-rgb), 0.35)" : "rgba(var(--accent-rgb), 0.35)", backgroundColor: remaining > 0 ? "rgba(var(--danger-rgb), 0.06)" : "rgba(var(--accent-rgb), 0.06)", color: remaining > 0 ? "var(--danger)" : "var(--accent)", boxShadow: remaining > 0 ? "0 0 24px rgba(var(--danger-rgb), 0.1)" : "0 0 24px rgba(var(--accent-rgb), 0.06)" }}>
          {remaining > 0 ? `المتبقي: ${remaining} ج.م` : "✅ مدفوع بالكامل"}
        </div>

        {/* Weight */}
        <div>
          <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>⚖️ وزن الحيوان</label>
          <input type="number" step="0.1" placeholder="أدخل الوزن" value={visitWeight} onChange={(e) => setVisitWeight(e.target.value)}
            className="w-full rounded-xl border p-2.5 text-xs outline-none transition-all"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--warning-dark)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }} />
        </div>

        {/* Follow-up */}
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-light)" }}>
          <label className="flex items-center gap-2 text-[11px] font-medium" style={{ color: "var(--info)" }}>
            <input type="checkbox" checked={!!followUpDate} onChange={(e) => setFollowUpDate(e.target.checked ? new Date().toISOString().slice(0, 10) : "")} style={{ accentColor: "var(--info)" }} />
            📅 متابعة
          </label>
          <AnimatePresence>
            {followUpDate && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 space-y-2 overflow-hidden">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[9px]" style={{ color: "var(--text-dim)" }}>التاريخ</label>
                    <input type="date" value={followUpDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full rounded-lg border p-2 text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[9px]" style={{ color: "var(--text-dim)" }}>الوقت</label>
                    <input type="time" value={followUpTime} onChange={(e) => setFollowUpTime(e.target.value)}
                      className="w-full rounded-lg border p-2 text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
                  </div>
                </div>
                <input placeholder="سبب المتابعة" value={followUpReason} onChange={(e) => setFollowUpReason(e.target.value)}
                  className="w-full rounded-lg border p-2 text-xs outline-none"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Medical Notes */}
        <div>
          <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>            📋 الروشتة</label>
          <textarea placeholder="التشخيص، الأدوية، الجرعات..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            className="w-full rounded-xl border p-2.5 text-xs outline-none resize-none transition-all"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }} />
        </div>

        {/* Voice Recorder */}
        <div>
          <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>🎤 تسجيل صوتي (30 ث)</label>
          <VoiceRecorder onAudioChange={onAudioChange} />
        </div>

        {/* Doctor selector */}
        <div>
          <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
            👨‍⚕️ الطبيب المعالج
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {doctors.map((doc) => (
              <button key={doc} onClick={() => onDoctorChange(doc)}
                className="rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-all active:scale-95"
                style={{
                  borderColor: selectedDoctor === doc ? "var(--accent3)" : "var(--border)",
                  backgroundColor: selectedDoctor === doc ? "rgba(var(--accent3-rgb), 0.12)" : "transparent",
                  color: selectedDoctor === doc ? "var(--accent3)" : "var(--text-muted)",
                }}>
                {doc}
              </button>
            ))}
            <button onClick={() => {
              const name = prompt("أدخل اسم الطبيب:");
              if (name?.trim() && !doctors.includes(name.trim())) {
                const updated = [...doctors, name.trim()];
                onDoctorChange(name.trim());
                try { localStorage.setItem("vet_doctors", JSON.stringify(updated)); } catch {}
              }
            }}
              className="rounded-lg border px-2 py-1.5 text-[10px]"
              style={{ borderColor: "var(--border-light)", color: "var(--text-muted)" }}>
              + إضافة
            </button>
          </div>
        </div>

        {/* WhatsApp — Client's Phone */}
        {client && (
          <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(var(--accent-rgb), 0.04)", border: "1px solid rgba(var(--accent-rgb), 0.15)" }}>
            <label className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
              📱 واتساب العميل
            </label>
            <p className="text-xs font-bold mt-0.5" style={{ color: clientPhone ? "var(--accent)" : "var(--text-dim)" }}>
              {clientPhone ? `+2${clientPhone.replace(/^0+/, "")}` : "— لا يوجد رقم —"}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.96 }} onClick={onSave}
            className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all"
            style={{ background: "linear-gradient(135deg, var(--accent-dark), var(--accent))", boxShadow: "0 4px 20px rgba(var(--accent-rgb), 0.25)" }}>
            💾 حفظ الزيارة  <kbd style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.7)" }}>Ctrl+Enter</kbd>
          </motion.button>
          <div className="grid grid-cols-2 gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={onShowInvoice}
              disabled={!client || selected.length === 0}
              className="rounded-xl border py-2.5 text-[11px] font-semibold transition-all hover:shadow disabled:opacity-40"
              style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg-input)" }}>
              🧾 عرض الفاتورة
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onSendWA}
              disabled={!client || !clientPhone}
              className="rounded-xl border py-2.5 text-[11px] font-semibold transition-all hover:shadow disabled:opacity-40"
              style={{ borderColor: "rgba(var(--accent-rgb), 0.3)", color: "var(--accent)", backgroundColor: clientPhone ? "rgba(var(--accent-rgb), 0.06)" : "transparent" }}>
              💬 إرسال للعميل
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div className="rounded-xl border p-2.5" style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}>
      <span className="block text-[9px] font-medium" style={{ color: "var(--text-dim)" }}>{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
