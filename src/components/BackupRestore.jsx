import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BackupRestore({ onImport }) {
  const [preview, setPreview] = useState(null);

  function handleExport() {
    try {
      const raw = localStorage.getItem("vet_clinic_data");
      const blob = new Blob([raw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vet-clinic-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.clients && data.visits) {
          setPreview(data);
        }
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function confirmImport() {
    if (preview) {
      onImport(preview);
      setPreview(null);
    }
  }

  return (
    <div className="glass-card p-4">
      <h2 className="mb-3 text-xs font-bold flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px]" style={{ backgroundColor: "rgba(100,116,139,0.12)" }}>💾</span>
        النسخ الاحتياطي
      </h2>

      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleExport}
          className="flex-1 rounded-lg border py-2.5 text-[11px] font-semibold transition-all hover:shadow"
          style={{ borderColor: "var(--border)", color: "var(--accent)" }}
        >
          📥 تصدير
        </motion.button>
        <label
          className="flex-1 cursor-pointer rounded-lg border py-2.5 text-center text-[11px] font-semibold transition-all hover:shadow"
          style={{ borderColor: "var(--border)", color: "var(--accent2)" }}
        >
          📤 استيراد
          <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
        </label>
      </div>

      {/* Import Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div
              className="rounded-xl border p-3 text-[11px] space-y-1.5"
              style={{ borderColor: "rgba(var(--accent-rgb), 0.2)", backgroundColor: "rgba(var(--accent-rgb), 0.04)" }}
            >
              <div className="font-semibold" style={{ color: "var(--text)" }}>🔍 معاينة البيانات:</div>
              <div className="flex gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span>👥 {preview.clients?.length || 0} عميل</span>
                <span>📋 {preview.visits?.length || 0} زيارة</span>
                <span>📅 {preview.appointments?.length || 0} موعد</span>
              </div>
              <div className="flex gap-2 pt-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmImport}
                  className="flex-1 rounded-lg py-1.5 text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
                >
                  ✅ تأكيد الاستيراد
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPreview(null)}
                  className="rounded-lg border px-3 py-1.5 text-[10px]"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  إلغاء
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
