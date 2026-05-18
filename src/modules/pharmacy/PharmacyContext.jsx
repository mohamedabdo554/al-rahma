import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import { savePharmacyData } from "../../storage";

const PHARMACY_CLIENTS_KEY = "vet_pharmacy_clients";
function loadPharmacyClients() {
  try { return JSON.parse(localStorage.getItem(PHARMACY_CLIENTS_KEY)) || []; } catch { return []; }
}
function savePharmacyClients(data) {
  localStorage.setItem(PHARMACY_CLIENTS_KEY, JSON.stringify(data));
}

const PharmacyCtx = createContext(null);

export function PharmacyProvider({ children, localMedicines, localPrescriptions, localItems, localSales, clients, addClientDebt, onDispense, onCompleteSale }) {
  const [medicines, setMedicines] = useState(localMedicines);
  const [prescriptions, setPrescriptions] = useState(localPrescriptions);
  const [prescriptionItems, setPrescriptionItems] = useState(localItems);
  const [sales, setSales] = useState(localSales || []);
  const [pharmacyClients, setPharmacyClients] = useState(loadPharmacyClients);
  const [syncing, setSyncing] = useState(false);

  // Pull from Supabase on mount — merge with local data (local wins for same id, remote fills gaps)
  useEffect(() => {
    async function pull() {
      try {
        setSyncing(true);
        const [mr, pr, ir, sr, si] = await Promise.allSettled([
          supabase.from("medicines").select("*"),
          supabase.from("prescriptions").select("*"),
          supabase.from("prescription_items").select("*"),
          supabase.from("sales").select("*"),
          supabase.from("sale_items").select("*"),
        ]);
        if (mr.status === "fulfilled" && mr.value.data?.length) {
          setMedicines((prev) => { const m = new Map(); prev.forEach(i => m.set(i.id, i)); mr.value.data.forEach(i => { if (!m.has(i.id)) m.set(i.id, i); }); return Array.from(m.values()); });
        }
        if (pr.status === "fulfilled" && pr.value.data?.length) {
          setPrescriptions((prev) => { const m = new Map(); prev.forEach(i => m.set(i.id, i)); pr.value.data.forEach(i => { if (!m.has(i.id)) m.set(i.id, i); }); return Array.from(m.values()); });
        }
        if (ir.status === "fulfilled" && ir.value.data?.length) {
          setPrescriptionItems((prev) => { const m = new Map(); prev.forEach(i => m.set(i.id, i)); ir.value.data.forEach(i => { if (!m.has(i.id)) m.set(i.id, i); }); return Array.from(m.values()); });
        }
        if (sr.status === "fulfilled" && sr.value.data?.length) {
          setSales((prev) => { const m = new Map(); prev.forEach(i => m.set(i.id, i)); sr.value.data.forEach(i => { if (!m.has(i.id)) m.set(i.id, i); }); return Array.from(m.values()); });
        }
        if (si.status === "fulfilled" && si.value.data?.length) {
          // sale_items aren't stored in local state, just cache for reference
          localStorage.setItem("vet_sale_items", JSON.stringify(si.value.data));
        }
      } catch (e) { console.error("Pharmacy pull error:", e); } finally { setSyncing(false); }
    }
    pull();
  }, []);

  // Persist all pharmacy data to localStorage
  useEffect(() => {
    savePharmacyData({ medicines, prescriptions, prescriptionItems, sales });
  }, [medicines, prescriptions, prescriptionItems, sales]);

  // Persist pharmacyClients & push to Supabase
  useEffect(() => {
    savePharmacyClients(pharmacyClients);
    if (pharmacyClients.length > 0) {
      supabase.from("pharmacy_clients").upsert(
        pharmacyClients.map((c) => ({ id: c.id, name: c.name, phone: c.phone || "", debt: c.debt ?? 0 }))
      ).then(({ error }) => error && console.error("pharmacy_clients sync err:", error));
    }
  }, [pharmacyClients]);

  const pendingRx = useMemo(() => prescriptions.filter((p) => p.status === "pending"), [prescriptions]);
  const totalStock = useMemo(() => medicines.reduce((s, m) => s + Math.max(0, m.quantity), 0), [medicines]);
  const lowStockItems = useMemo(() => medicines.filter((m) => m.quantity > 0 && m.quantity <= 5), [medicines]);
  const pharmacyTotalRevenue = useMemo(() => sales.reduce((s, sl) => s + Number(sl.total || 0), 0), [sales]);
  const pharmacySaleCount = sales.length;
  const todaySales = useMemo(() => {
    const t = new Date().toISOString().slice(0, 10);
    return sales.filter((s) => (s.created_at || "").slice(0, 10) === t);
  }, [sales]);

  async function addMedicine(data) {
    const localId = "med_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const entry = {
      id: localId, name: data.name,
      qr_code: data.qr_code || null, quantity: data.quantity || 0,
      purchase_price: data.purchase_price || 0, selling_price: data.selling_price || 0,
      wholesale_price: data.wholesale_price || 0, expiration_date: data.expiration_date || null,
    };
    setMedicines((prev) => [...prev, entry]);
    const { data: inserted, error } = await supabase.from("medicines").insert({
      name: data.name, qr_code: data.qr_code || null, quantity: data.quantity || 0,
      purchase_price: data.purchase_price || 0, selling_price: data.selling_price || 0,
      wholesale_price: data.wholesale_price || 0, expiration_date: data.expiration_date || null,
    }).select().single();
    if (!error && inserted) {
      setMedicines((prev) => prev.map((m) => (m.id === localId ? { ...m, id: inserted.id } : m)));
      return inserted;
    }
    if (error) console.error("Supabase insert error:", error);
    return entry;
  }

  async function updateMedicine(id, data) {
    const { error } = await supabase.from("medicines").update(data).eq("id", id);
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    if (error) console.error("Supabase update error:", error);
  }

  async function deleteMedicine(id) {
    const { error } = await supabase.from("medicines").delete().eq("id", id);
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    if (error) console.error("Supabase delete error:", error);
  }

  function lookupQR(code) {
    return medicines.find((m) => m.qr_code === code && m.quantity > 0) || null;
  }

  function searchMeds(q) {
    if (!q) return medicines;
    return medicines.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.qr_code?.includes(q));
  }

  function addPharmacyClient(name, phone, initialDebt = 0) {
    const c = { id: Date.now().toString(), name, phone: phone || "", debt: initialDebt };
    setPharmacyClients((prev) => [...prev, c]);
    return c;
  }

  function addPharmacyDebt(id, amount) {
    setPharmacyClients((prev) => prev.map((c) => (c.id === id ? { ...c, debt: (c.debt || 0) + amount } : c)));
  }

  function updatePharmacyClient(id, data) {
    setPharmacyClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    supabase.from("pharmacy_clients").update(data).eq("id", id).catch(() => {});
  }

  function deletePharmacyClient(id) {
    setPharmacyClients((prev) => prev.filter((c) => c.id !== id));
    supabase.from("pharmacy_clients").delete().eq("id", id).catch(() => {});
  }

  async function checkout({ cart, total, prescriptionId }) {
    const localSaleId = "sale_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5);

    // Always update local state first (offline-first)
    const now = new Date().toISOString();
    const localSale = { id: localSaleId, type: prescriptionId ? "prescription" : "otc", prescription_id: prescriptionId || null, total, created_at: now };
    setSales((prev) => [...prev, localSale]);
    setMedicines((prev) => {
      const updated = [...prev];
      cart.forEach((c) => {
        const idx = updated.findIndex((m) => m.id === c.id);
        if (idx !== -1) updated[idx] = { ...updated[idx], quantity: Math.max(0, updated[idx].quantity - c.qty) };
      });
      return updated;
    });
    if (prescriptionId) {
      setPrescriptions((prev) => prev.map((p) => (p.id === prescriptionId ? { ...p, status: "dispensed" } : p)));
    }

    // Try Supabase in background
    try {
      const { data: sale, error: se } = await supabase
        .from("sales").insert({ type: prescriptionId ? "prescription" : "otc", prescription_id: prescriptionId || null, total }).select().single();
      if (se || !sale) { console.error("Sale insert error:", se); return true; }
      setSales((prev) => prev.map((s) => (s.id === localSaleId ? { ...s, id: sale.id } : s)));

      const saleItems = cart.map((c) => ({ sale_id: sale.id, medicine_id: c.id, item_name: c.name, quantity: c.qty, unit_price: c.price }));
      const { error: sie } = await supabase.from("sale_items").insert(saleItems);
      if (sie) console.error("Sale items error:", sie);

      for (const c of cart) {
        const med = medicines.find((m) => m.id === c.id);
        if (med) {
          await supabase.from("medicines").update({ quantity: Math.max(0, med.quantity - c.qty) }).eq("id", c.id);
        }
      }
      if (prescriptionId) {
        await supabase.from("prescriptions").update({ status: "dispensed" }).eq("id", prescriptionId);
      }
    } catch (err) {
      console.error("Checkout Supabase sync error:", err);
    }
    return true;
  }

  return (
    <PharmacyCtx.Provider value={{
      medicines, syncing, pendingRx, totalStock, lowStockItems,
      lookupQR, searchMeds, checkout, addMedicine, updateMedicine, deleteMedicine,
      prescriptions, prescriptionItems, sales,
      pharmacyTotalRevenue, pharmacySaleCount, todaySales,
      clients, addClientDebt,
      pharmacyClients, addPharmacyClient, addPharmacyDebt, updatePharmacyClient, deletePharmacyClient,
      onDispense, onCompleteSale,
    }}>
      {children}
    </PharmacyCtx.Provider>
  );
}

export function usePharmacy() {
  const ctx = useContext(PharmacyCtx);
  if (!ctx) throw new Error("usePharmacy must be inside PharmacyProvider");
  return ctx;
}
