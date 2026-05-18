import { useState } from "react";
import { motion } from "framer-motion";

export default function VisitDetailModal({ visit, client, onClose, onMedicalReport }) {
  const [playing, setPlaying] = useState(null);
  if (!visit) return null;
  const servicesList = visit.services ? visit.services.split("، ").filter(Boolean) : [];

  function playAudio(dataUrl) {
    if (playing) { playing.pause(); playing.currentTime = 0; }
    const audio = new Audio(dataUrl);
    audio.play();
    setPlaying(audio);
    audio.onended = () => setPlaying(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--bg-card-solid)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-5 flex items-center justify-between"
          style={{
            background: visit.status === "مدفوع بالكامل ✓"
              ? "linear-gradient(135deg, rgba(var(--accent-rgb), 0.12), rgba(var(--accent-rgb), 0.04))"
              : "linear-gradient(135deg, rgba(var(--danger-rgb), 0.12), rgba(var(--danger-rgb), 0.04))",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>
              {visit.name}
              <span className="text-xs font-normal mr-2" style={{ color: "var(--text-muted)" }}>
                ({visit.animal})
              </span>
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {visit.date}
              {visit.doctor && <span className="mr-2" style={{ color: "var(--accent3)" }}>👨‍⚕️ {visit.doctor}</span>}
              {visit.weight && <span style={{ color: "var(--warning-dark)" }} className="mr-2">⚖️ {visit.weight} كجم</span>}
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold"
            style={{
              backgroundColor: visit.status === "مدفوع بالكامل ✓"
                ? "rgba(var(--accent-rgb), 0.12)"
                : "rgba(var(--danger-rgb), 0.12)",
              color: visit.status === "مدفوع بالكامل ✓" ? "var(--accent)" : "var(--danger)",
              border: "1px solid",
              borderColor: visit.status === "مدفوع بالكامل ✓"
                ? "rgba(var(--accent-rgb), 0.2)"
                : "rgba(var(--danger-rgb), 0.2)",
            }}
          >
            {visit.status}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Services */}
          <div>
            <h4 className="text-[10px] font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--accent3)" }}>
              <span>💉</span> الخدمات المقدمة
            </h4>
            <div className="space-y-1.5">
              {servicesList.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-2 text-xs"
                  style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}
                >
                  <span style={{ color: "var(--text)" }}>{s}</span>
                </div>
              ))}
              {servicesList.length === 0 && (
                <p className="text-[11px]" style={{ color: "var(--text-dim)" }}>—</p>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div>
            <h4 className="text-[10px] font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
              <span>💳</span> ملخص الحساب
            </h4>
            <div
              className="rounded-xl border p-3 space-y-2"
              style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}
            >
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>إجمالي الخدمات</span>
                <span style={{ color: "var(--text)" }} className="font-bold">{visit.total} ج.م</span>
              </div>
              {visit.paid > 0 && (
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--text-muted)" }}>المدفوع</span>
                  <span className="font-bold" style={{ color: "var(--accent)" }}>{visit.paid} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-xs pt-1 border-t" style={{ borderColor: "var(--border-light)" }}>
                <span style={{ color: "var(--text-muted)" }}>الحالة</span>
                <span className="font-bold" style={{ color: visit.debt > 0 ? "var(--danger)" : "var(--accent)" }}>
                  {visit.debt > 0 ? `${visit.debt} ج.م` : "مدفوع بالكامل ✓"}
                </span>
              </div>
            </div>
          </div>

          {/* Audio Note */}
          {visit.audio && (
            <div>
              <h4 className="text-[10px] font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--accent3)" }}>
                <span>🎤</span> ملاحظة صوتية
              </h4>
              <div
                className="rounded-xl border p-3 flex items-center gap-3"
                style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}
              >
                <button
                  onClick={() => playAudio(visit.audio)}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: playing ? "rgba(var(--danger-rgb), 0.12)" : "rgba(var(--accent-rgb), 0.12)",
                    color: playing ? "var(--danger)" : "var(--accent)",
                  }}
                >
                  {playing ? "⏹" : "▶️"}
                </button>
                <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: "var(--border-light)" }}>
                  <div className="h-full w-1/2 rounded-full" style={{ backgroundColor: "var(--accent)", width: "30%" }} />
                </div>
                <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>تسجيل</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {visit.notes && (
            <div>
              <h4 className="text-[10px] font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--warning-dark)" }}>
                <span>📋</span> الروشتة
              </h4>
              <div
                className="rounded-xl border p-3 text-xs leading-relaxed"
                style={{
                  borderColor: "rgba(var(--warning-rgb), 0.2)",
                  backgroundColor: "rgba(var(--warning-rgb), 0.04)",
                  color: "var(--text)",
                }}
              >
                {visit.notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-3 flex gap-2 border-t"
          style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onMedicalReport?.(visit)}
            className="rounded-xl border px-4 py-2 text-[10px] font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--warning)" }}
          >
            🖨️ تقرير طبي
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 rounded-xl border py-2 text-xs font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            ✕ إغلاق
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
