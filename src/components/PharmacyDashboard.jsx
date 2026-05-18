import useHardwareScanner from "../hooks/useHardwareScanner";
import MedicineCabinet from "./MedicineCabinet";
import PrescriptionQueue from "./PrescriptionQueue";
import POSCheckout from "./POSCheckout";

export default function PharmacyDashboard({
  medicines, onAddMedicine, onDeleteMedicine,
  prescriptions, prescriptionItems, onDispense,
  onCompleteSale,
}) {
  // Global scanner sends scanned code to POS input
  useHardwareScanner((code) => {
    const input = document.querySelector("[data-pos-scanner]");
    if (input) {
      const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      nativeSetter.call(input, code);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <PosStats medicines={medicines} prescriptions={prescriptions} />
          <PrescriptionQueue prescriptions={prescriptions} items={prescriptionItems} onDispense={onDispense} />
          <POSCheckout medicines={medicines} onCompleteSale={onCompleteSale} />
        </div>
        <div className="lg:col-span-1 space-y-5">
          <MedicineCabinet medicines={medicines} onAdd={onAddMedicine} onDelete={onDeleteMedicine} />
        </div>
      </div>
    </div>
  );
}

function PosStats({ medicines, prescriptions }) {
  const totalStock = medicines.reduce((s, m) => s + Math.max(0, m.quantity), 0);
  const lowStock = medicines.filter((m) => m.quantity > 0 && m.quantity <= 5).length;
  const pending = prescriptions.filter((p) => p.status === "pending").length;

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: "💊", label: "إجمالي المخزون", value: totalStock, color: "var(--accent)" },
        { icon: "⚠️", label: "منخفض", value: lowStock, color: "var(--warning)" },
        { icon: "📋", label: "وصفات معلقة", value: pending, color: "var(--info)" },
      ].map((s) => (
        <div key={s.label} className="card-premium p-3 text-center">
          <div className="text-lg mb-1">{s.icon}</div>
          <div className="text-sm font-black" style={{ color: s.color }}>{s.value}</div>
          <div className="text-[8px]" style={{ color: "var(--text-dim)" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
