export default function MedicalReport({ visit, client, onClose }) {
  if (!visit) return null;

  function handlePrint() {
    const servicesList = visit.services ? visit.services.split("، ").filter(Boolean) : [];
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>تقرير طبي</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
      @page { margin: 8mm; size: A4; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Cairo', sans-serif; background: #fff; color: #0f172a; padding: 40px; direction: rtl; }
      .header { text-align: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #059669; }
      .header h1 { font-size: 22px; color: #059669; }
      .header p { font-size: 12px; color: #64748b; margin-top: 4px; }
      .report-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 20px; text-align: center; }
      .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
      .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
      .info-box label { font-size: 10px; color: #64748b; display: block; }
      .info-box span { font-size: 14px; font-weight: 700; color: #0f172a; }
      .section-title { font-size: 13px; font-weight: 700; color: #059669; margin: 20px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
      .services-list { list-style: none; padding: 0; }
      .services-list li { padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
      .notes-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0; }
      .notes-box strong { font-size: 11px; color: #d97706; display: block; margin-bottom: 6px; }
      .notes-box p { font-size: 13px; color: #92400e; line-height: 1.7; }
      .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
      @media print { body { padding: 20px; } }
    </style></head><body>
      <div class="header">
        <h1>عيادة الرحمة</h1>
        <p>تقرير طبي</p>
      </div>
      <div class="report-title">تقرير الزيارة — ${visit.date}</div>
      <div class="info-grid">
        <div class="info-box"><label>العميل</label><span>${client?.name || visit.name}</span></div>
        <div class="info-box"><label>الحيوان</label><span>${visit.animal} (${client?.type || ""})</span></div>
        ${client?.weight ? `<div class="info-box"><label>الوزن</label><span>${client.weight} كجم</span></div>` : ""}
        ${client?.phone ? `<div class="info-box"><label>الهاتف</label><span>${client.phone}</span></div>` : ""}
      </div>
      <div class="section-title">💉 الخدمات المقدمة</div>
      <ul class="services-list">${servicesList.map((s) => `<li>${s}</li>`).join("")}</ul>
      <div class="section-title">💳 الحساب</div>
      <div style="font-size:13px;display:flex;justify-content:space-between;max-width:300px;">
        <span style="color:#64748b;">الإجمالي:</span><span style="font-weight:700;">${visit.total} ج.م</span>
      </div>
      ${visit.paid > 0 ? `<div style="font-size:13px;display:flex;justify-content:space-between;max-width:300px;color:#059669;"><span>المدفوع:</span><span style="font-weight:700;">${visit.paid} ج.م</span></div>` : ""}
      ${visit.debt > 0 ? `<div style="font-size:13px;display:flex;justify-content:space-between;max-width:300px;color:#dc2626;"><span>المتبقي:</span><span style="font-weight:700;">${visit.debt} ج.م</span></div>` : ""}
      ${visit.notes ? `<div class="notes-box"><strong>📋 الروشتة</strong><p>${visit.notes}</p></div>` : ""}
      <div class="footer">عيادة الرحمة للطب البيطري — نشكركم على ثقتكم 🐾</div>
      <script>try{window.print()}catch(e){console.error("Print error:",e)}<\/script>
    </body></html>`);
    win.document.close();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl text-center"
        style={{ backgroundColor: "var(--bg-card-solid)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-3xl mb-3">🖨️</div>
        <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>تقرير طبي</h3>
        <p className="text-[10px] mb-4" style={{ color: "var(--text-muted)" }}>
          هيتم فتح التقرير في نافذة جديدة للطباعة
        </p>
        <button
          onClick={handlePrint}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-white mb-2"
          style={{ background: "linear-gradient(135deg, var(--accent-dark), var(--accent))" }}
        >
          🖨️ طباعة التقرير
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-xl border py-2 text-xs font-semibold"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
