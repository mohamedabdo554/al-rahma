import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function InvoiceModal({
  client, selected, servicesTotal, discount, paid, remaining,
  notes, method, patientHistory, today, theme, onClose, doctor,
}) {
  const invoiceNum = "INV-" + Date.now().toString().slice(-6);

  async function exportPDF() {
    try {
      const wrap = document.createElement("div");
      wrap.id = "pdf-invoice-tmp";
      wrap.style.cssText = "position:fixed;top:0;left:0;width:210mm;background:#fff;direction:rtl;font-family:'Cairo','Segoe UI',sans-serif;z-index:-999;opacity:0;pointer-events:none;";
      wrap.innerHTML = `
        <div style="padding:20px 25px;direction:rtl;text-align:right;color:#0f172a;">
          <div style="text-align:center;margin-bottom:18px;padding-bottom:14px;border-bottom:3px solid #059669;">
            <div style="font-size:22px;font-weight:900;color:#059669;">عيادة الرحمة البيطرية</div>
            <div style="font-size:10px;color:#64748b;margin-top:2px;">خلف المركز — 📞 01028423304 ${doctor ? "— 👨‍⚕️ " + doctor : ""}</div>
          </div>
          <div style="display:flex;justify-content:space-between;background:#f1f5f9;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:12px;">
            <div><div style="font-size:9px;color:#64748b;">العميل</div><div style="font-weight:700;">${client?.name || ""}</div></div>
            <div><div style="font-size:9px;color:#64748b;">الحيوان</div><div style="font-weight:700;">${client?.animal || ""}${client?.type ? " (" + client.type + ")" : ""}</div></div>
            ${client?.weight ? `<div><div style="font-size:9px;color:#64748b;">الوزن</div><div style="font-weight:700;">${client.weight} كجم</div></div>` : ""}
            ${client?.phone ? `<div><div style="font-size:9px;color:#64748b;">الهاتف</div><div style="font-weight:700;direction:ltr;text-align:left;">${client.phone}</div></div>` : ""}
            <div><div style="font-size:9px;color:#64748b;">الفاتورة</div><div style="font-weight:700;">${invoiceNum}</div></div>
            <div><div style="font-size:9px;color:#64748b;">التاريخ</div><div style="font-weight:700;">${today}</div></div>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:14px;text-align:right;">
            <thead><tr>
              <th style="background:#f1f5f9;padding:9px 12px;font-size:10px;color:#64748b;font-weight:700;text-align:right;border-bottom:2px solid #e2e8f0;">الخدمة</th>
              <th style="background:#f1f5f9;padding:9px 12px;font-size:10px;color:#64748b;font-weight:700;text-align:left;width:100px;border-bottom:2px solid #e2e8f0;">السعر</th>
            </tr></thead>
            <tbody>
              ${selected.map(s => `<tr>
                <td style="padding:8px 12px;font-size:12px;font-weight:600;border-bottom:1px solid #f1f5f9;text-align:right;">${s.name}</td>
                <td style="padding:8px 12px;font-size:12px;font-weight:700;text-align:left;border-bottom:1px solid #f1f5f9;">${s.price} ج.م</td>
              </tr>`).join("")}
            </tbody>
          </table>
          <div style="margin-right:auto;width:260px;">
            <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid #e2e8f0;">
              <span style="color:#64748b;">الإجمالي</span><span style="font-weight:700;">${servicesTotal} ج.م</span>
            </div>
            ${Number(discount) > 0 ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid #e2e8f0;color:#d97706;">
              <span>الخصم</span><span style="font-weight:700;">-${discount} ج.م</span>
            </div>` : ""}
            ${Number(paid) > 0 ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid #e2e8f0;color:#059669;">
              <span>المدفوع</span><span style="font-weight:700;">${paid} ج.م</span>
            </div>` : ""}
            <div style="display:flex;justify-content:space-between;padding:8px 0 4px;font-size:16px;font-weight:900;border-top:2px solid #0f172a;margin-top:3px;">
              <span>${remaining > 0 ? "المتبقي" : "الحالة"}</span>
              <span style="color:${remaining > 0 ? "#dc2626" : "#059669"};">${remaining > 0 ? remaining + " ج.م" : "مدفوع بالكامل ✓"}</span>
            </div>
            ${method ? `<div style="font-size:10px;color:#94a3b8;margin-top:3px;text-align:left;">طريقة الدفع: ${method}</div>` : ""}
          </div>
          ${notes.trim() ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;margin-top:14px;">
            <strong style="font-size:10px;color:#d97706;display:block;margin-bottom:3px;">📋 الروشتة</strong>
            <p style="font-size:11px;color:#92400e;line-height:1.5;margin:0;">${notes}</p>
          </div>` : ""}
          ${patientHistory.length > 0 ? `<div style="margin-top:14px;font-size:10px;color:#94a3b8;text-align:center;">عدد الزيارات السابقة: ${patientHistory.length}</div>` : ""}
          <div style="text-align:center;padding:12px 0 0;margin-top:14px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;">نشكركم على ثقتكم — عيادة الرحمة البيطرية 🐾</div>
        </div>
      `;
      document.body.appendChild(wrap);

      const canvas = await html2canvas(wrap, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        logging: false,
        allowTaint: true,
        width: 794,
        height: wrap.scrollHeight,
      });
      document.body.removeChild(wrap);

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const imgW = pw;
      const imgH = (canvas.height * pw) / canvas.width;
      if (imgH <= ph) {
        pdf.addImage(imgData, "JPEG", 0, 0, imgW, imgH);
      } else {
        const pageH = (canvas.width * ph) / pw;
        let srcY = 0;
        let page = 0;
        while (srcY < canvas.height) {
          if (page > 0) pdf.addPage();
          const chunk = document.createElement("canvas");
          chunk.width = canvas.width;
          chunk.height = Math.min(pageH, canvas.height - srcY);
          const ctx = chunk.getContext("2d");
          ctx.drawImage(canvas, 0, srcY, canvas.width, chunk.height, 0, 0, canvas.width, chunk.height);
          pdf.addImage(chunk.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, imgW, (chunk.height * imgW) / canvas.width);
          srcY += pageH;
          page++;
        }
      }
      pdf.save(`فاتورة-${invoiceNum}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("حدث خطأ أثناء تصدير PDF. راجع وحدة التحكم (F12) للتفاصيل.");
    }
  }

  function handlePrint() {
    const el = document.getElementById("premium-invoice");
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>فاتورة ${invoiceNum}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
      @page { margin: 8mm; size: A4; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Cairo', sans-serif; background: #f8fafc; color: #0f172a; padding: 0; direction: rtl; }
      .invoice-wrap { max-width: 210mm; margin: 0 auto; background: #fff; min-height: 297mm; position: relative; }
      .header-bg { background: linear-gradient(135deg, #059669 0%, #10b981 40%, #34d399 100%); padding: 32px 40px 28px; color: #fff; position: relative; overflow: hidden; }
      .header-bg::before { content: ''; position: absolute; top: -60%; right: -20%; width: 300px; height: 300px; border-radius: 50%; background: rgba(255,255,255,0.06); }
      .header-bg::after { content: ''; position: absolute; bottom: -40%; left: -10%; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,0.04); }
      .header-content { display: flex; justify-content: space-between; align-items: flex-start; position: relative; z-index: 1; }
      .clinic-name { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
      .clinic-sub { font-size: 11px; opacity: 0.85; margin-top: 2px; }
      .invoice-badge { text-align: left; }
      .invoice-badge .num { font-size: 13px; font-weight: 700; opacity: 0.9; }
      .invoice-badge .date { font-size: 11px; opacity: 0.7; }
      .body-section { padding: 28px 40px 20px; }
      .info-grid { display: flex; justify-content: space-between; background: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
      .info-item label { font-size: 10px; color: #64748b; display: block; letter-spacing: 0.3px; }
      .info-item span { font-size: 14px; font-weight: 700; color: #0f172a; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background: #f1f5f9; padding: 12px 16px; text-align: right; font-size: 11px; color: #64748b; font-weight: 700; letter-spacing: 0.3px; }
      td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
      tr:last-child td { border-bottom: none; }
      .service-name { font-weight: 600; }
      .service-price { text-align: left; font-weight: 700; }
      .totals { margin-right: auto; width: 280px; }
      .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
      .totals-row:last-child { border-bottom: none; }
      .totals-row.final { font-size: 18px; font-weight: 900; padding: 12px 0; border-top: 2px solid #0f172a; margin-top: 4px; }
      .totals-row.discount { color: #d97706; }
      .totals-row.debt { color: #dc2626; }
      .totals-row.paid { color: #059669; }
      .notes-section { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; margin-top: 20px; }
      .notes-section strong { font-size: 11px; color: #d97706; display: block; margin-bottom: 4px; }
      .notes-section p { font-size: 12px; color: #92400e; line-height: 1.6; }
      .footer { text-align: center; padding: 20px 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; margin-top: 20px; }
    </style></head><body>`);
    win.document.write(el.innerHTML);
    win.document.write(`</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-[210mm] rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: "#ffffff", direction: "rtl" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Invoice */}
        <div id="premium-invoice" className="invoice-wrap bg-white text-gray-900" style={{ fontFamily: "'Cairo', 'Segoe UI', sans-serif" }}>
          {/* Header */}
          <div className="header-bg" style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 40%, #34d399 100%)" }}>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>عيادة الرحمة البيطرية</div>
                <div style={{ fontSize: 11, opacity: 0.85, color: "#fff", marginTop: 2 }}>خلف المركز</div>
                <div className="flex gap-4 mt-2 text-[10px]" style={{ opacity: 0.7, color: "#fff" }}>
                  <span>📍 خلف المركز</span>
                  <span>📞 01028423304</span>
                  {doctor && <span>👨‍⚕️ {doctor}</span>}
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9, color: "#fff" }}>#{invoiceNum}</div>
                <div style={{ fontSize: 11, opacity: 0.7, color: "#fff", marginTop: 2 }}>{today}</div>
                <div style={{ marginTop: 8, padding: "4px 12px", background: "rgba(255,255,255,0.15)", borderRadius: 20, fontSize: 10, color: "#fff", display: "inline-block" }}>
                  {remaining > 0 ? "متبقي: " + remaining + " ج.م" : "مدفوع بالكامل ✓"}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 32px 16px" }}>
            {/* Client Info */}
            <div style={{ display: "flex", justifyContent: "space-between", background: "#f1f5f9", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 10, color: "#64748b", display: "block" }}>العميل</label>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{client?.name || ""}</span>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#64748b", display: "block" }}>الحيوان</label>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{client?.animal || ""} ({client?.type || ""})</span>
              </div>
              {client?.weight && (
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block" }}>الوزن</label>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{client.weight} كجم</span>
                </div>
              )}
              {client?.phone && (
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block" }}>الهاتف</label>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{client.phone}</span>
                </div>
              )}
            </div>

            {/* Services Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ background: "#f1f5f9", padding: "10px 14px", textAlign: "right", fontSize: 11, color: "#64748b", fontWeight: 700 }}>الخدمة</th>
                  <th style={{ background: "#f1f5f9", padding: "10px 14px", textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 700, width: 120 }}>السعر</th>
                </tr>
              </thead>
              <tbody>
                {selected.map((s) => (
                  <tr key={s.uid}>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: 13, fontWeight: 700, textAlign: "left" }}>{s.price} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ marginRight: "auto", width: 280 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ color: "#64748b" }}>الإجمالي</span>
                <span style={{ fontWeight: 700 }}>{servicesTotal} ج.م</span>
              </div>
              {Number(discount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: "1px solid #e2e8f0", color: "#d97706" }}>
                  <span>الخصم</span>
                  <span style={{ fontWeight: 700 }}>-{discount} ج.م</span>
                </div>
              )}
              {Number(paid) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: "1px solid #e2e8f0", color: "#059669" }}>
                  <span>المدفوع</span>
                  <span style={{ fontWeight: 700 }}>{paid} ج.م</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 6px", fontSize: 18, fontWeight: 900, borderTop: "2px solid #0f172a", marginTop: 4 }}>
                <span>{remaining > 0 ? "المتبقي" : "الحالة"}</span>
                <span style={{ color: remaining > 0 ? "#dc2626" : "#059669" }}>
                  {remaining > 0 ? `${remaining} ج.م` : "مدفوع بالكامل ✓"}
                </span>
              </div>
              {method && (
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, textAlign: "left" }}>
                  طريقة الدفع: {method}
                </div>
              )}
            </div>

            {/* Notes */}
            {notes.trim() && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginTop: 16 }}>
                <strong style={{ fontSize: 11, color: "#d97706", display: "block", marginBottom: 4 }}>📋 الروشتة</strong>
                <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6, margin: 0 }}>{notes}</p>
              </div>
            )}

            {/* History */}
            {patientHistory.length > 0 && (
              <div style={{ marginTop: 16, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
                عدد الزيارات السابقة: {patientHistory.length}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", padding: "14px 32px", fontSize: 10, color: "#94a3b8", borderTop: "1px solid #e2e8f0" }}>
            نشكركم على ثقتكم — عيادة الرحمة البيطرية 🐾
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t" style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}>
          <button onClick={handlePrint} className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
            🖨️ طباعة
          </button>
          <button onClick={exportPDF} className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            📄 PDF
          </button>
          <button onClick={onClose} className="rounded-xl border px-6 py-3 text-sm font-semibold transition-all hover:shadow" style={{ borderColor: "#e2e8f0", color: "#64748b", backgroundColor: "#fff" }}>
            ✕ إغلاق
          </button>
        </div>
      </motion.div>
    </div>
  );
}
