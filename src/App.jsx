import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { loadData, saveData, loadServices, loadDoctors, blobToBase64, loadPharmacyData, loadPharmacyClients } from "./storage";
import { supabase } from "./supabaseClient";

import { PharmacyProvider, PharmacyDashboard } from "./modules/pharmacy";

import Toast from "./components/Toast";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ClientSelector from "./components/ClientSelector";
import ServicesPanel from "./components/ServicesPanel";
import InvoiceSidebar from "./components/InvoiceSidebar";
import InvoiceModal from "./components/InvoiceModal";
import VisitDetailModal from "./components/VisitDetailModal";
import MedicalReport from "./components/MedicalReport";
import VisitHistory from "./components/VisitHistory";
import Charts from "./components/Charts";
import RevenueChart from "./components/RevenueChart";
import StatsCards from "./components/StatsCards";
import TodaySummary from "./components/TodaySummary";

import AppointmentsList from "./components/AppointmentsList";
import VisitsList from "./components/VisitsList";
import DebtorsList from "./components/DebtorsList";
import FloatingStats from "./components/FloatingStats";
import BackupRestore from "./components/BackupRestore";
import AppointmentMarquee from "./components/AppointmentMarquee";
import MedicalTimeline from "./components/MedicalTimeline";

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const normSep = (s) => (s || "").split(/[،,]\s*/).filter(Boolean).join("، ");

function sendNotification(title, body) {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "SHOW_NOTIFICATION", title, body, tag: "vet-reminder" });
  } else if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, tag: "vet-reminder", vibrate: [200, 100, 200], requireInteraction: true });
  }
}

export default function App() {
  const initial = loadData();
  const [clients, setClients] = useState(initial.clients);
  const [visits, setVisits] = useState(initial.visits);
  const [appointments, setAppointments] = useState(initial.appointments);
  const [services, setServices] = useState(() => loadServices());
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selected, setSelected] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [method, setMethod] = useState("كاش");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState("");
  const [visitWeight, setVisitWeight] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("vet_theme") || "light");
  const [showInvoice, setShowInvoice] = useState(false);
  const [visitDetail, setVisitDetail] = useState(null);
  const [reportVisit, setReportVisit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("vet_activeTab") || "clinic");
  const [medicalTimelineClient, setMedicalTimelineClient] = useState(null);

  const [doctors, setDoctors] = useState(() => loadDoctors());
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0] || "د. عبدالرحمن");
  const [expenses, setExpenses] = useState(initial.expenses || []);
  const [financeUnlocked, setFinanceUnlocked] = useState(() => localStorage.getItem("vet_finance_unlocked") === "true");
  const [syncing, setSyncing] = useState(false);

  // Pharmacy module state (initial load only — PharmacyContext manages persistence)
  const phInitial = loadPharmacyData();
  const [medicines, setMedicines] = useState(phInitial.medicines);
  const [prescriptions, setPrescriptions] = useState(phInitial.prescriptions);
  const [prescriptionItems, setPrescriptionItems] = useState(phInitial.prescriptionItems);
  const [role, setRole] = useState(() => localStorage.getItem("vet_role") || "doctor");

  useEffect(() => { saveData({ clients, visits, appointments, expenses }); }, [clients, visits, appointments, expenses]);

  function handleRoleChange(newRole) {
    setRole(newRole);
    localStorage.setItem("vet_role", newRole);
    if (newRole === "pharmacist") setActiveTab("pharmacy");
    else setActiveTab("clinic");
  }

  // Sync theme to <html> so body + all elements inherit CSS variables
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  // Persist activeTab
  useEffect(() => { localStorage.setItem("vet_activeTab", activeTab); }, [activeTab]);

  // Notification: request permission + check appointments on mount & periodically
  function checkAppointmentsAndNotify() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission();
    if (Notification.permission !== "granted") return;
    const today = new Date().toISOString().slice(0, 10);
    const todayApps = appointments.filter((a) => a.date === today && a.status !== "completed");
    const notified = JSON.parse(sessionStorage.getItem("vet_notified") || "[]");
    todayApps.forEach((app) => {
      if (!notified.includes(app.id)) {
        sendNotification(`📅 موعد اليوم: ${app.name}`, `${app.animal} — ${app.reason}`);
        notified.push(app.id);
      }
    });
    sessionStorage.setItem("vet_notified", JSON.stringify(notified));
  }

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
    checkAppointmentsAndNotify();
    const interval = setInterval(checkAppointmentsAndNotify, 60000);
    return () => clearInterval(interval);
  }, [appointments]);

  const client = clients.find((c) => c.id === selectedClientId);
  const prevDebt = client ? client.debt : 0;
  const servicesTotal = selected.reduce((s, i) => s + Number(i.price) * (i.qty || 1), 0);
  const remaining = prevDebt + servicesTotal - Number(discount) - Number(paid);

  const today = new Date().toISOString().slice(0, 10);
  const dailyRevenue = visits.filter((v) => v.status === "مدفوع بالكامل ✓").reduce((s, v) => s + v.total, 0);
  const totalDebts = clients.reduce((s, c) => s + c.debt, 0);
  const todayPatients = visits.filter((v) => v.date === today).length;
  const todayRevenue = visits.filter((v) => v.date === today && v.status === "مدفوع بالكامل ✓").reduce((s, v) => s + v.total, 0);

  const weekFollowUps = useMemo(() => {
    const end = new Date(); end.setDate(end.getDate() + 7);
    return appointments.filter((a) => a.date >= today && a.date <= end.toISOString().slice(0, 10) && a.status !== "completed").length;
  }, [appointments, today]);

  const patientHistory = useMemo(
    () => client ? visits.filter((v) => v.name === client.name && v.animal === client.animal) : [],
    [client, visits]
  );

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalRevenue = useMemo(() => visits.filter((v) => v.status === "مدفوع بالكامل ✓").reduce((s, v) => s + v.total, 0), [visits]);
  const netProfit = totalRevenue - totalExpenses;

  const show = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); }, []);

  // Sync from Supabase on mount — merge with local data (local wins for same id, remote fills gaps)
  useEffect(() => {
    let cancelled = false;
    async function pull() {
      try {
        setSyncing(true);
        console.log("🔄 Pulling from Supabase...");
        const [cl, vs, ap, sv] = await Promise.allSettled([
          supabase.from("clients").select("*"),
          supabase.from("visits").select("*"),
          supabase.from("appointments").select("*"),
          supabase.from("services").select("*"),
        ]);
        if (cancelled) return;
        console.log("📥 Pull results:", {
          clients: cl.status + " " + (cl.value?.data?.length ?? 0) + " rows",
          visits: vs.status + " " + (vs.value?.data?.length ?? 0) + " rows",
          appointments: ap.status + " " + (ap.value?.data?.length ?? 0) + " rows",
          services: sv.status + " " + (sv.value?.data?.length ?? 0) + " rows",
        });
        if (cl.status === "fulfilled" && cl.value.data?.length) {
          setClients((prev) => { const m = new Map(); prev.forEach(i => m.set(i.id, i)); const add = cl.value.data.filter(i => !m.has(i.id)); console.log("➕ merged clients:", add.length); add.forEach(i => m.set(i.id, i)); return Array.from(m.values()); });
        }
        if (vs.status === "fulfilled" && vs.value.data?.length) {
          setVisits((prev) => { const m = new Map(); prev.forEach(i => m.set(i.id, i)); const add = vs.value.data.filter(i => !m.has(i.id)); console.log("➕ merged visits:", add.length); add.forEach(i => m.set(i.id, i)); return Array.from(m.values()); });
        }
        if (ap.status === "fulfilled" && ap.value.data?.length) {
          setAppointments((prev) => { const m = new Map(); prev.forEach(i => m.set(i.id, i)); const add = ap.value.data.filter(i => !m.has(i.id)); console.log("➕ merged appointments:", add.length); add.forEach(i => m.set(i.id, i)); return Array.from(m.values()); });
        }
        if (sv.status === "fulfilled" && sv.value.data?.length) {
          setServices((prev) => { const m = new Map(); prev.forEach(i => m.set(i.id, i)); const add = sv.value.data.filter(i => !m.has(i.id)); console.log("➕ merged services:", add.length); add.forEach(i => m.set(i.id, i)); return Array.from(m.values()); });
        }
      } catch (e) { console.error("❌ Pull error:", e); } finally {
        if (!cancelled) setSyncing(false);
      }
    }
    pull();
    return () => { cancelled = true; };
  }, []);

  // Debounced push to Supabase when data changes (3s after last change)
  const pushTimer = useRef(null);
  useEffect(() => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      // Only send exact columns that exist in Supabase tables — no extra fields
      const clientsForDB = clients.map(c => ({
        id: c.id, name: c.name, animal: c.animal, type: c.type || "",
        gender: c.gender || "", phone: c.phone || "",
        weight: c.weight || "", debt: c.debt ?? 0,
      }));
      const visitsForDB = visits.map(({ audio, ...rest }) => ({
        id: rest.id,
        date: rest.date, services: rest.services || "",
        total: Number(rest.total) || 0, paid: Number(rest.paid) || 0, debt: Number(rest.debt) || 0,
        weight: rest.weight || "", notes: rest.notes || "",
      }));
      const appsForDB = appointments.map(a => ({
        id: a.id, name: a.name, animal: a.animal,
        date: a.date, time: a.time || "", reason: a.reason || "متابعة",
      }));
      try {
        setSyncing(true);
        // Test connection with a simple GET
        const test = await supabase.from("clients").select("id", { count: "exact", head: true });
        if (test.error) {
          console.error("❌ Supabase connection FAILED:", test.error);
          return;
        }
        console.log("✅ Supabase connected — pushing data...");
        // Push each table individually and log errors
        const r1 = await supabase.from("clients").upsert(clientsForDB);
        if (r1.error) console.error("❌ clients push error:", JSON.stringify(r1.error)); else console.log("✅ clients pushed");
        const r2 = await supabase.from("visits").upsert(visitsForDB);
        if (r2.error) console.error("❌ visits push error:", JSON.stringify(r2.error)); else console.log("✅ visits pushed");
        const r3 = await supabase.from("appointments").upsert(appsForDB);
        if (r3.error) console.error("❌ appointments push error:", JSON.stringify(r3.error)); else console.log("✅ appointments pushed");
        // Push services
        const servicesForDB = services.map(s => ({ id: s.id, name: s.name, price: s.price ?? 0, daily: s.daily ?? false }));
        const r4 = await supabase.from("services").upsert(servicesForDB);
        if (r4.error) console.error("❌ services push error:", JSON.stringify(r4.error)); else console.log("✅ services pushed");
      } catch (e) {
        console.error("❌ Supabase sync crashed:", e?.message || e);
      } finally {
        setSyncing(false);
      }
  }, 3000);
  return () => { if (pushTimer.current) clearTimeout(pushTimer.current); };
}, [clients, visits, appointments, services]);

  function addClient({ name, animal, type, phone, weight }) {
    const c = { id: Date.now().toString(), name, animal, type, phone, weight, debt: 0 };
    setClients((p) => [...p, c]);
    setSelectedClientId(c.id);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ["#6366f1"] });
    show("✅ تم إضافة العميل");
  }

  function updateClient(id, data) {
    setClients((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)));
    show("✅ تم تعديل العميل");
  }

  function addClientDebt(id, amount) {
    setClients((p) => p.map((c) => (c.id === id ? { ...c, debt: (c.debt || 0) + amount } : c)));
  }

  function deleteClient(id) {
    setClients((p) => p.filter((c) => c.id !== id));
    if (selectedClientId === id) setSelectedClientId("");
    show("🗑️ تم حذف العميل");
  }

  function addServiceToInvoice(item) { setSelected((p) => [...p, item]); }
  function removeService(uid) { setSelected((p) => p.filter((i) => i.uid !== uid)); }
  function changePrice(uid, price) { setSelected((p) => p.map((i) => (i.uid === uid ? { ...i, price } : i))); }
  function changeQty(uid, qty) { setSelected((p) => p.map((i) => (i.uid === uid ? { ...i, qty } : i))); }
  function undoLast() { setSelected((p) => p.slice(0, -1)); }

  // WhatsApp — get formatted number for a client
  function waNumber(phone) {
    if (!phone?.trim()) return null;
    return phone.replace(/^0+/, "20").replace(/[^0-9]/g, "");
  }

  // Send invoice to client via WhatsApp
  function sendWA() {
    if (!selectedClientId) return;
    const t = [
      "عيادة الرحمة 🐾",
      "━━━━━━━━━━━",
      `العميل: ${client.name}`,
      `الحيوان: ${client.animal}`,
      client.weight ? `الوزن: ${client.weight} كجم` : null,
      "━━━━━━━━━━━",
      `إجمالي الخدمات: ${servicesTotal} ج.م`,
      `الخصم: ${discount} ج.م`,
      `المدفوع: ${paid} ج.م`,
      `المتبقي: ${remaining} ج.م`,
      "━━━━━━━━━━━",
      "نشكركم على ثقتكم",
    ].filter(Boolean).join("\n");
    const num = waNumber(client?.phone);
    const url = num
      ? `https://wa.me/${num}?text=${encodeURIComponent(t)}`
      : `https://wa.me/?text=${encodeURIComponent(t)}`;
    window.open(url, "_blank");
  }

  // Send debt reminder to a specific client
  function sendDebtWA(c) {
    const num = waNumber(c?.phone);
    if (!num) { show("⚠️ العميل ليس لديه رقم هاتف"); return; }
    const t = `عيادة الرحمة 🐾\n━━━━━━━━━━━\nأستاذ ${c.name}،\nمديونيتك الحالية: ${c.debt} ج.م\nنرجو التكرم بسدادها في أقرب وقت.\n━━━━━━━━━━━\nنشكركم على ثقتكم`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(t)}`, "_blank");
  }

  // Send appointment reminder via WhatsApp
  function remindWA(app) {
    const c = clients.find((cl) => cl.name === app.name && cl.animal === app.animal);
    const num = waNumber(c?.phone);
    const t = `مرحباً أستاذ ${app.name}، نذكركم بموعد إعادة الكشف لـ ${app.animal} غداً في عيادة الرحمة لمتابعة: ${app.reason}. تشرفنا زيارتكم 📅`;
    const url = num
      ? `https://wa.me/${num}?text=${encodeURIComponent(t)}`
      : `https://wa.me/?text=${encodeURIComponent(t)}`;
    window.open(url, "_blank");
  }

  // Save visit
  async function save() {
    if (!selectedClientId) { show("⚠️ اختر عميل أولاً"); return; }
    if (selected.length === 0) { show("⚠️ أضف خدمة واحدة على الأقل"); return; }
    setSaving(true);
    try {
      const svc = normSep(selected.map((s) => s.qty && s.qty > 1 ? `${s.name} × ${s.qty} أيام` : s.name).join("، ")) || "كشف";
      const debt = Math.max(0, remaining);
      const weight = visitWeight || client?.weight || "";
      const savedNotesTrim = notes.trim();
      let audioBase64 = null;
      if (audioBlob) audioBase64 = await blobToBase64(audioBlob);

      const v = {
        id: Date.now(), name: client.name, animal: client.animal, date: today,
        services: svc, total: servicesTotal, paid: Number(paid), debt,
        weight, notes: savedNotesTrim, audio: audioBase64,
        doctor: selectedDoctor,
        status: debt <= 0 ? "مدفوع بالكامل ✓" : "عليه مديونية",
      };
      setSavedNotes(savedNotesTrim);
      setVisits((p) => [v, ...p]);
      setClients((p) => p.map((c) => (c.id === selectedClientId ? { ...c, debt, weight } : c)));
      if (followUpDate) {
        setAppointments((p) => [{ id: Date.now(), name: client.name, animal: client.animal, date: followUpDate, time: followUpTime || "", reason: followUpReason || "متابعة" }, ...p]);
      }
      setSelected([]); setDiscount(0); setPaid(0); setNotes("");
      setVisitWeight(""); setAudioBlob(null);
      setFollowUpDate(""); setFollowUpTime(""); setFollowUpReason("");
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.55 }, colors: ["#10b981", "#6366f1", "#d946ef", "#f59e0b"] });
      show("✅ تم حفظ الزيارة بنجاح");
      setShowInvoice(true);
    } finally { setSaving(false); }
  }

  function completeAppointment(app) {
    setAppointments((p) => p.map((a) => a.id === app.id ? { ...a, status: "completed" } : a));
    show("✅ تم إنجاز الموعد");
  }
  function deleteAppointment(id) {
    setAppointments((p) => p.filter((a) => a.id !== id));
    supabase.from("appointments").delete().eq("id", id).catch(() => {});
    show("🗑️ تم حذف الموعد");
  }

  function toggleTheme() {
    setTheme((p) => { const n = p === "dark" ? "light" : "dark"; localStorage.setItem("vet_theme", n); return n; });
  }

  function handleImport(data) {
    if (data.clients) setClients(data.clients);
    if (data.visits) setVisits(data.visits);
    if (data.appointments) setAppointments(data.appointments);
    if (data.expenses) setExpenses(data.expenses);
    show("✅ تم استيراد البيانات");
  }

  function exportBackup() {
    const payload = { clients, visits, appointments, expenses, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vet-clinic-backup-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    show("📥 تم تحميل النسخة الاحتياطية");
  }

  function escCSV(v) {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function exportToExcel() {
    const BOM = "\uFEFF";
    const rows = [];

    // Section 1: clients
    rows.push("العملاء والحيوانات");
    rows.push(["الاسم", "الأليف", "الفصيلة", "الجنس", "الهاتف", "الوزن", "المديونية"].join(","));
    clients.forEach((c) => {
      rows.push([c.name, c.animal, c.type || "", c.gender || "", c.phone || "", c.weight || "", c.debt ?? 0].map(escCSV).join(","));
    });

    rows.push(""); // empty separator

    // Section 2: visits
    rows.push("سجل الزيارات الطبية");
    rows.push(["التاريخ", "العميل", "الأليف", "الخدمات", "الإجمالي", "المدفوع", "المتبقي", "الملاحظات والروشتة", "الطبيب المعالج", "الحالة"].join(","));
    visits.forEach((v) => {
      rows.push([v.date, v.name, v.animal, v.services || "", v.total ?? 0, v.paid ?? 0, v.debt ?? 0, v.notes || "", v.doctor || "", v.status || ""].map(escCSV).join(","));
    });

    rows.push("");

    // Section 3: appointments
    rows.push("المواعيد القادمة");
    rows.push(["التاريخ", "الوقت", "الاسم", "الأليف", "السبب"].join(","));
    appointments.forEach((a) => {
      rows.push([a.date, a.time || "", a.name, a.animal, a.reason || ""].map(escCSV).join(","));
    });

    rows.push("");

    // Section 4: pharmacy medicines
    const phData = loadPharmacyData();
    rows.push("المخزون — الأدوية");
    rows.push(["الاسم", "الباركود", "الكمية", "سعر الشراء", "سعر البيع", "سعر الجملة", "تاريخ الصلاحية"].join(","));
    (phData.medicines || []).forEach((m) => {
      rows.push([m.name, m.qr_code || "", m.quantity ?? 0, m.purchase_price ?? 0, m.selling_price ?? 0, m.wholesale_price ?? 0, m.expiration_date || ""].map(escCSV).join(","));
    });

    rows.push("");

    // Section 5: pharmacy sales
    rows.push("المبيعات — الصيدلية");
    rows.push(["التاريخ", "نوع", "الإجمالي"].join(","));
    (phData.sales || []).forEach((s) => {
      const d = s.created_at ? s.created_at.slice(0, 10) : "";
      rows.push([d, s.type || "", s.total ?? 0].map(escCSV).join(","));
    });

    rows.push("");

    // Section 6: pharmacy clients
    const phClients = loadPharmacyClients();
    rows.push("عملاء الصيدلية");
    rows.push(["الاسم", "الهاتف", "المديونية"].join(","));
    phClients.forEach((c) => {
      rows.push([c.name, c.phone || "", c.debt ?? 0].map(escCSV).join(","));
    });

    const csv = BOM + rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;header=present" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vet-clinic-backup-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    show("📥 تم تحميل ملف Excel");
  }

  function unlockFinance() {
    const pass = prompt("🔒 أدخل كلمة المرور للمالية:");
    if (pass === "1234") {
      setFinanceUnlocked(true);
      localStorage.setItem("vet_finance_unlocked", "true");
    } else if (pass !== null) {
      show("⚠️ كلمة المرور غير صحيحة");
    }
  }

  function lockFinance() {
    setFinanceUnlocked(false);
    localStorage.setItem("vet_finance_unlocked", "false");
  }

  function addExpense(name, amount) {
    setExpenses((p) => [...p, { id: Date.now(), name, amount: Number(amount), date: today }]);
    show("✅ تم إضافة المصروف");
  }

  function deleteExpense(id) {
    setExpenses((p) => p.filter((e) => e.id !== id));
    show("🗑️ تم حذف المصروف");
  }

  // Pharmacy CRUD
  function addMedicine(data) {
    setMedicines((p) => [...p, data]);
    show("💊 تم إضافة الدواء");
  }

  function deleteMedicine(id) {
    setMedicines((p) => p.filter((m) => m.id !== id));
    show("🗑️ تم حذف الدواء");
  }

  function dispensePrescription(rxId) {
    const rx = prescriptions.find((p) => p.id === rxId);
    if (!rx) return;
    // Decrement stock for each item
    const items = prescriptionItems.filter((i) => i.prescription_id === rxId);
    setMedicines((prev) => {
      let updated = [...prev];
      items.forEach((item) => {
        const idx = updated.findIndex((m) => m.id === item.medicine_id);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], quantity: Math.max(0, updated[idx].quantity - item.quantity_prescribed) };
        }
      });
      return updated;
    });
    setPrescriptions((p) => p.map((r) => (r.id === rxId ? { ...r, status: "dispensed" } : r)));
    show("✅ تم صرف الوصفة");
  }

  function completeSale(cart, total) {
    // Decrement stock
    setMedicines((prev) => {
      let updated = [...prev];
      cart.forEach((item) => {
        const idx = updated.findIndex((m) => m.id === item.id);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], quantity: Math.max(0, updated[idx].quantity - item.qty) };
        }
      });
      return updated;
    });
    show(`✅ تم البيع — ${total} ج.م`);
  }

  function handleQuickAction(key) {
    switch (key) {
      case "newClient": document.querySelector("[placeholder='الاسم']")?.focus(); break;
      case "newVisit": document.querySelector("[placeholder^='🔍']")?.focus(); break;
      case "showInvoice":
        if (client && selected.length > 0) setShowInvoice(true);
        else show("⚠️ اختر عميل وأضف خدمات");
        break;
      case "export": {
        try {
          const raw = localStorage.getItem("vet_clinic_data");
          const blob = new Blob([raw], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = `vet-clinic-backup-${today}.json`; a.click();
          URL.revokeObjectURL(url);
          show("📥 تم تصدير البيانات");
        } catch { show("⚠️ فشل التصدير"); }
        break;
      }
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      const tag = document.activeElement?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (e.key === "Escape") {
        if (showInvoice) { setShowInvoice(false); setSavedNotes(""); return; }
        if (visitDetail) { setVisitDetail(null); return; }
        if (reportVisit) { setReportVisit(null); return; }
      }
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        document.querySelector("[placeholder^='🔍']")?.focus();
        return;
      }
      if ((e.key === "Enter" && (e.ctrlKey || e.metaKey)) || e.key === "F2") {
        e.preventDefault();
        if (!saving) save();
        return;
      }
      // Single-key shortcuts (only when not in an input)
      if (!isInput) {
        const key = e.key.toLowerCase();
        if (key === "n") { e.preventDefault(); handleQuickAction("newClient"); return; }
        if (key === "v") { e.preventDefault(); handleQuickAction("newVisit"); return; }
        if (key === "i") { e.preventDefault(); handleQuickAction("showInvoice"); return; }
        if (key === "e") { e.preventDefault(); handleQuickAction("export"); return; }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div
      className="min-h-screen p-3 font-sans antialiased md:p-5"
      style={{ direction: "rtl" }}>
      <Toast msg={toast} />
      <Header theme={theme} toggleTheme={toggleTheme}
        todayPatients={todayPatients}
        totalDebts={totalDebts} totalClients={clients.length}
        activeTab={activeTab} onTabChange={setActiveTab}
        weekFollowUps={activeTab === "pharmacy" ? 0 : weekFollowUps}
        role={role} onRoleChange={handleRoleChange}
        onSendFollowUpWA={activeTab !== "pharmacy" ? () => {
          const end = new Date(); end.setDate(end.getDate() + 7);
          const followUps = appointments.filter((a) => a.date >= today && a.date <= end.toISOString().slice(0, 10) && a.status !== "completed");
          const sent = new Set();
          followUps.forEach((a) => {
            const c = clients.find((cl) => cl.name === a.name && cl.animal === a.animal);
            if (c?.phone && !sent.has(c.id)) {
              sent.add(c.id);
              setTimeout(() => {
                const num = c.phone.replace(/^0+/, "20").replace(/[^\d]/g, "");
                window.open(`https://wa.me/${num}?text=${encodeURIComponent(`عيادة الرحمة البيطرية 🐾\nتذكير بموعد إعادة الكشف للحيوان ${c.animal}.\nننتظركم في الموعد المحدد.`)}`, "_blank");
              }, sent.size * 800);
            }
          });
        } : null}
 />

      {activeTab !== "pharmacy" && (
        <AppointmentMarquee appointments={appointments} onSelect={(a) => {
          const c = clients.find((cl) => cl.name === a.name && cl.animal === a.animal);
          if (c) { setSelectedClientId(c.id); setActiveTab("clinic"); }
        }} />
      )}

      {/* Sync status indicator */}
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] backdrop-blur-xl transition-all"
        style={{
          borderColor: syncing ? "rgba(245,158,11,0.3)" : "rgba(var(--accent-rgb), 0.2)",
          backgroundColor: syncing ? "rgba(245,158,11,0.08)" : "rgba(var(--accent-rgb), 0.06)",
          color: syncing ? "#d97706" : "var(--accent)",
        }}>
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${syncing ? "animate-pulse" : ""}`}
          style={{ backgroundColor: syncing ? "#d97706" : "var(--accent)" }} />
        {syncing ? "مزامنة..." : "متصل"}
      </div>

      {activeTab !== "pharmacy" && (
        <SearchBar clients={clients} onSelect={(id) => { setSelectedClientId(id); setActiveTab("clinic"); }} />
      )}

      {/* Tab: الكشف */}
      {activeTab === "clinic" && (
        <div className={"mx-auto grid max-w-7xl grid-cols-1 gap-5" + (client && selected.length > 0 ? " lg:grid-cols-5" : "")}>
          <motion.div variants={container} initial="hidden" animate="visible" className={"space-y-5" + (client && selected.length > 0 ? " lg:col-span-3" : "")}>
            {client && prevDebt > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden rounded-xl border p-3 text-xs flex items-center gap-2"
                style={{ borderColor: "rgba(245,158,11,0.35)", backgroundColor: "rgba(245,158,11,0.06)", color: "#d97706", animation: "breathe 2s ease-in-out infinite" }}>
                <span>⚠️</span>
                <span>مديونية سابقة: <strong>{prevDebt} ج.م</strong> — تم دمجها بالفاتورة</span>
              </motion.div>
            )}

            <ClientSelector clients={clients} selectedClientId={selectedClientId}
              onSelect={setSelectedClientId} onAdd={addClient}
              onUpdate={updateClient} onDelete={deleteClient} />

            <ServicesPanel services={services} selected={selected} visits={visits}
              onAddService={addServiceToInvoice} onRemoveService={removeService}
              onPriceChange={changePrice} onQtyChange={changeQty} onUndo={undoLast}
              onServicesChange={setServices} />

            <VisitHistory client={client} visits={visits} onVisitClick={setVisitDetail}
              onTimeline={client ? () => setMedicalTimelineClient(client) : null} />
          </motion.div>

          {client && selected.length > 0 && (
            <InvoiceSidebar client={client} prevDebt={prevDebt} servicesTotal={servicesTotal}
              selected={selected} discount={discount} setDiscount={setDiscount}
              paid={paid} setPaid={setPaid} method={method} setMethod={setMethod}
              remaining={remaining}
              followUpDate={followUpDate} setFollowUpDate={setFollowUpDate}
              followUpTime={followUpTime} setFollowUpTime={setFollowUpTime}
              followUpReason={followUpReason} setFollowUpReason={setFollowUpReason}
              notes={notes} setNotes={setNotes} visitWeight={visitWeight}
              setVisitWeight={setVisitWeight} onSave={save}
              onShowInvoice={() => setShowInvoice(true)} onSendWA={sendWA}
              onAudioChange={setAudioBlob}
              doctors={doctors} selectedDoctor={selectedDoctor} onDoctorChange={setSelectedDoctor} />
          )}
        </div>
      )}

      {/* Tab: الصيدلية */}
      {activeTab === "pharmacy" && (
        <PharmacyProvider
          localMedicines={medicines} localPrescriptions={prescriptions} localItems={prescriptionItems}
          localSales={phInitial.sales} clients={clients} addClientDebt={addClientDebt}
          onDispense={dispensePrescription} onCompleteSale={completeSale}>
          <PharmacyDashboard />
        </PharmacyProvider>
      )}

      {/* Tab: السجل الطبي */}
      {activeTab === "timeline" && (
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {!client ? (
              <div className="flex flex-col items-center py-16 rounded-2xl border backdrop-blur-sm" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
                <span className="text-3xl mb-3 opacity-40">📋</span>
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>اختر عميلاً من البحث أعلاه لعرض سجله الطبي</p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-12 rounded-2xl border backdrop-blur-sm" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg">{client.animal}</span>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{client.name}</h3>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {client.type} · {client.gender === "ذكر" ? "♂ ذكر" : "♀ أنثى"}
                      {client.weight && ` · ${client.weight} كجم`}
                      {client.phone && ` · ${client.phone}`}
                    </p>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setMedicalTimelineClient(client)}
                  className="rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:shadow-xl"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}>
                  📋 عرض السجل الطبي الكامل
                </motion.button>
                <p className="mt-3 text-[10px]" style={{ color: "var(--text-dim)" }}>
                  {visits.filter((v) => v.name === client.name && v.animal === client.animal).length} زيارة سابقة
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Tab: الماليات */}
      {activeTab === "finance" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl space-y-5">
          {!financeUnlocked ? (
            <div className="flex flex-col items-center py-20 rounded-2xl border backdrop-blur-sm" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
              <span className="text-4xl mb-4 opacity-50">🔒</span>
              <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text)" }}>المالية مقفلة</h3>
              <p className="text-xs mb-6" style={{ color: "var(--text-dim)" }}>هذا القسم محمي بكلمة مرور</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={unlockFinance}
                className="rounded-xl px-8 py-3 text-sm font-bold text-white transition-all hover:shadow-xl"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}>
                🔓 فتح المالية
              </motion.button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold flex items-center gap-2" style={{ color: "var(--accent)" }}>
                  💰 الماليات
                </h2>
                <button onClick={lockFinance}
                  className="rounded-lg border px-3 py-1.5 text-[9px]"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                  🔒 إغلاق
                </button>
              </div>

              <StatsCards visits={visits} clients={clients} />
              <RevenueChart visits={visits} />

              {/* Profit Summary */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="card-premium p-4">
                  <div className="text-[9px] font-medium mb-1" style={{ color: "var(--text-dim)" }}>💰 الإيرادات</div>
                  <div className="text-lg font-black" style={{ color: "var(--accent)" }}>{totalRevenue} ج.م</div>
                </div>
                <div className="card-premium p-4">
                  <div className="text-[9px] font-medium mb-1" style={{ color: "var(--text-dim)" }}>📉 المصاريف</div>
                  <div className="text-lg font-black" style={{ color: "var(--danger)" }}>{totalExpenses} ج.م</div>
                </div>
                <div className="card-premium p-4">
                  <div className="text-[9px] font-medium mb-1" style={{ color: "var(--text-dim)" }}>📊 صافي الربح</div>
                  <div className="text-lg font-black" style={{ color: netProfit >= 0 ? "var(--accent)" : "var(--danger)" }}>
                    {netProfit >= 0 ? "+" : ""}{netProfit} ج.م
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div className="card-premium p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: "var(--danger)" }}>
                    📉 المصاريف
                  </h3>
                  <ExpenseAdder onAdd={addExpense} />
                </div>
                {expenses.length === 0 ? (
                  <div className="py-6 text-center text-[11px]" style={{ color: "var(--text-dim)" }}>
                    لا توجد مصاريف مسجلة
                  </div>
                ) : (
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {[...expenses].sort((a, b) => b.id - a.id).map((e) => (
                      <div key={e.id}
                        className="flex items-center justify-between rounded-lg border p-2.5 text-xs"
                        style={{ borderColor: "rgba(var(--danger-rgb), 0.12)", backgroundColor: "rgba(var(--danger-rgb), 0.03)" }}>
                        <div className="flex items-center gap-2">
                          <span style={{ color: "var(--text)" }}>{e.name}</span>
                          <span className="text-[9px]" style={{ color: "var(--text-dim)" }}>{e.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: "var(--danger)" }}>{e.amount} ج.م</span>
                          <button onClick={() => deleteExpense(e.id)}
                            className="text-[9px] opacity-50 hover:opacity-100" style={{ color: "var(--danger)" }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Export backup button */}
              <div className="card-premium p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl text-sm"
                    style={{ backgroundColor: "rgba(var(--accent-rgb), 0.1)" }}>📥</span>
                  <div className="flex-1">
                    <h3 className="text-[11px] font-bold" style={{ color: "var(--text)" }}>النسخ الاحتياطي</h3>
                    <p className="text-[9px]" style={{ color: "var(--text-dim)" }}>تحميل كل بيانات العيادة — العملاء، الزيارات، المواعيد، المصاريف</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                      onClick={exportBackup}
                      className="rounded-xl px-4 py-2.5 text-[10px] font-bold text-white shadow-lg transition-all"
                      style={{ background: "linear-gradient(135deg, var(--accent-dark), var(--accent))", boxShadow: "0 4px 20px rgba(var(--accent-rgb), 0.25)" }}>
                      JSON
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                      onClick={exportToExcel}
                      className="rounded-xl px-4 py-2.5 text-[10px] font-bold text-white shadow-lg transition-all"
                      style={{ background: "linear-gradient(135deg, #065f46, #059669)", boxShadow: "0 4px 20px rgba(5,150,105,0.35)" }}>
                      📥 Excel
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <Charts visits={visits} theme={theme} />

              {/* Debtor summary cards */}
              {(() => {
                const debtors = clients.filter((c) => c.debt > 0);
                const totalDebt = debtors.reduce((s, c) => s + c.debt, 0);
                const avgDebt = debtors.length > 0 ? Math.round(totalDebt / debtors.length) : 0;
                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border p-3 text-center" style={{ borderColor: "rgba(var(--danger-rgb), 0.2)", backgroundColor: "rgba(var(--danger-rgb), 0.04)" }}>
                      <div className="text-lg font-black" style={{ color: "var(--danger)" }}>{debtors.length}</div>
                      <div className="text-[9px] mt-0.5" style={{ color: "var(--text-dim)" }}>عدد المدينين</div>
                    </div>
                    <div className="rounded-xl border p-3 text-center" style={{ borderColor: "rgba(var(--warning-rgb), 0.2)", backgroundColor: "rgba(var(--warning-rgb), 0.04)" }}>
                      <div className="text-lg font-black" style={{ color: "var(--warning)" }}>{totalDebt} ج.م</div>
                      <div className="text-[9px] mt-0.5" style={{ color: "var(--text-dim)" }}>إجمالي الديون</div>
                    </div>
                    <div className="rounded-xl border p-3 text-center" style={{ borderColor: "rgba(var(--accent-rgb), 0.2)", backgroundColor: "rgba(var(--accent-rgb), 0.04)" }}>
                      <div className="text-lg font-black" style={{ color: "var(--accent)" }}>{avgDebt} ج.م</div>
                      <div className="text-[9px] mt-0.5" style={{ color: "var(--text-dim)" }}>متوسط الدين</div>
                    </div>
                  </div>
                );
              })()}

              {/* Add Client inline */}
              <AddClientInFinance onAdd={addClient} clients={clients} />

              {/* Debtors full width */}
              <DebtorsList clients={clients} onWhatsApp={sendDebtWA} />
            </>
          )}
        </motion.div>
      )}

      {/* Tab: المواعيد */}
      {activeTab === "appointments" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2"><VisitsList visits={visits} onVisitClick={setVisitDetail} /></div>
            <div className="lg:col-span-1">
              <AppointmentsList appointments={appointments.filter(a => a.status !== "completed")} onRemind={remindWA}
                onComplete={completeAppointment} onDelete={deleteAppointment} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab: التقارير */}
      {activeTab === "reports" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BackupRestore onImport={handleImport} />
            </div>
          </div>
        </motion.div>
      )}

      <FloatingStats clients={clients} visits={visits}
        dailyRevenue={dailyRevenue} totalDebts={totalDebts} appointments={appointments} />

      {medicalTimelineClient && (
        <MedicalTimeline client={medicalTimelineClient} visits={visits}
          onClose={() => setMedicalTimelineClient(null)} />
      )}

      {showInvoice && client && (
        <InvoiceModal client={client} selected={selected} servicesTotal={servicesTotal}
          discount={discount} paid={paid} remaining={remaining} notes={savedNotes}
          method={method} patientHistory={patientHistory} today={today}
          theme={theme} doctor={selectedDoctor}
          onClose={() => { setShowInvoice(false); setSavedNotes(""); }} />
      )}

      {visitDetail && (
        <VisitDetailModal visit={visitDetail} onClose={() => setVisitDetail(null)}
          onMedicalReport={setReportVisit}
          client={clients.find((c) => c.name === visitDetail.name && c.animal === visitDetail.animal)} />
      )}

      {reportVisit && (
        <MedicalReport visit={reportVisit} onClose={() => setReportVisit(null)}
          client={clients.find((c) => c.name === reportVisit.name && c.animal === reportVisit.animal)} />
      )}
    </div>
  );
}

function AddClientInFinance({ onAdd, clients }) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [animal, setAnimal] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("قطة");
  if (!show) return (
    <div className="flex items-center gap-2">
      <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
        👥 {clients.length} عميل
      </span>
      <button onClick={() => setShow(true)}
        className="rounded-lg border px-2.5 py-1 text-[9px] font-medium transition-all hover:scale-105"
        style={{ borderColor: "var(--border)", color: "var(--accent2)" }}>
        + إضافة عميل
      </button>
    </div>
  );
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: "rgba(var(--accent2-rgb), 0.2)", backgroundColor: "rgba(var(--accent2-rgb), 0.03)" }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-bold" style={{ color: "var(--accent2)" }}>➕ إضافة عميل جديد</h4>
        <button onClick={() => setShow(false)} className="text-[9px]" style={{ color: "var(--text-muted)" }}>✕</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <input placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[80px] rounded-lg border p-1.5 text-[10px] outline-none"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
        <input placeholder="الحيوان" value={animal} onChange={(e) => setAnimal(e.target.value)}
          className="flex-1 min-w-[80px] rounded-lg border p-1.5 text-[10px] outline-none"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
        <input placeholder="الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)}
          className="w-[90px] rounded-lg border p-1.5 text-[10px] outline-none"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="rounded-lg border p-1.5 text-[10px] outline-none"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }}>
          <option>قطة</option><option>كلب</option><option>طائر</option><option>أرنب</option><option>آخر</option>
        </select>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (!name.trim() || !animal.trim()) return;
            onAdd({ name: name.trim(), animal: animal.trim(), type, phone: phone.trim(), weight: "" });
            setName(""); setAnimal(""); setPhone(""); setShow(false);
          }}
          className="rounded-lg px-3 py-1.5 text-[10px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--accent2), var(--accent2-dark))" }}>
          حفظ
        </motion.button>
      </div>
    </div>
  );
}

function ExpenseAdder({ onAdd }) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  if (!show) return (
    <button onClick={() => setShow(true)}
      className="rounded-lg border px-2.5 py-1 text-[9px] font-medium"
      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
      + إضافة مصروف
    </button>
  );
  return (
    <div className="flex gap-1.5">
      <input placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)}
        className="w-24 rounded-lg border p-1.5 text-[9px] outline-none"
        style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
      <input type="number" placeholder="المبلغ" value={amount} onChange={(e) => setAmount(e.target.value)}
        className="w-20 rounded-lg border p-1.5 text-[9px] outline-none"
        style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" }} />
      <button onClick={() => { if (name.trim() && Number(amount)) { onAdd(name.trim(), amount); setName(""); setAmount(""); setShow(false); } }}
        className="rounded-lg px-2 py-1 text-[9px] font-bold text-white"
        style={{ background: "var(--accent)" }}>+</button>
      <button onClick={() => setShow(false)}
        className="rounded-lg px-2 py-1 text-[9px]"
        style={{ color: "var(--text-muted)" }}>✕</button>
    </div>
  );
}
