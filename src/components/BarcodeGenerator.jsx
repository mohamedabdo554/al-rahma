import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import JsBarcode from "jsbarcode";

export default function BarcodeGenerator({ value, onChange, label }) {
  const svgRef = useRef(null);

  const generate = useCallback(() => {
    const ts = Date.now().toString().slice(-10);
    const rand = Math.floor(100 + Math.random() * 900).toString();
    onChange(ts + rand);
  }, [onChange]);

  useEffect(() => {
    if (value && svgRef.current) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 2.4,
          height: 50,
          displayValue: true,
          font: "monospace",
          fontSize: 16,
          margin: 8,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch {}
    }
  }, [value]);

  const printLabel = useCallback(() => {
    if (!value) return;
    const cloned = svgRef.current.cloneNode(true);
    const html = cloned.outerHTML;
    const pw = window.open("", "_blank", "width=400,height=300");
    pw.document.write(`
      <!DOCTYPE html>
      <html dir="ltr">
      <head>
        <title>طباعة الباركود</title>
        <style>
          @page { size: 50mm 30mm; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            display: flex; align-items: center; justify-content: center;
            width: 50mm; height: 30mm; overflow: hidden;
          }
          svg { max-width: 48mm; height: auto; }
        </style>
      </head>
      <body>${html}</body>
      <script>
        window.onload = function() { window.print(); window.close(); };
      <\/script>
      </html>
    `);
    pw.document.close();
  }, [value]);

  const hasValue = Boolean(value);

  return (
    <div className="rounded-xl border p-3 transition-all" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-input)" }}>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          placeholder={label || "الباركود (اختياري)"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border p-2 text-[11px] font-mono tracking-wider outline-none"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text)" }}
          dir="ltr"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={generate}
          title="توليد باركود تلقائي"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-bold text-white whitespace-nowrap"
          style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
        >
          <span>🎲</span>
          <span className="hidden sm:inline">توليد تلقائي</span>
        </motion.button>
      </div>

      {hasValue && (
        <div className="relative">
          <div className="flex items-center justify-center rounded-lg bg-white p-2" style={{ minHeight: 70 }}>
            <svg ref={svgRef} />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={printLabel}
            className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs shadow-lg transition-all hover:scale-110"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--accent)",
              color: "var(--accent)",
            }}
            title="طباعة الملصق"
          >
            🖨️
          </motion.button>
        </div>
      )}
    </div>
  );
}
