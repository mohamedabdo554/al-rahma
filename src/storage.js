const KEY = "vet_clinic_data";
const PHARMACY_KEY = "vet_pharmacy_data";

const DEFAULT_SERVICES = [
  { id: "s1", name: "كشف", price: 80 },
  { id: "s2", name: "متابعه", price: 20 },
  { id: "s3", name: "استشاره", price: 30 },
  { id: "s4", name: "تطعيم ديدان قط", price: 80 },
  { id: "s5", name: "تطعيم ديدان قط puncure", price: 60 },
  { id: "s6", name: "تطعيم ديدان كلاب puncure", price: 60 },
  { id: "s7", name: "تطعيم كلاب ١ قرص", price: 80 },
  { id: "s8", name: "تطعيم كلاب ٢ قرص", price: 150 },
  { id: "s9", name: "تطعيم كلاب ٣ قرص", price: 200 },
  { id: "s10", name: "تطعيم كلاب ٤ قرص", price: 250 },
  { id: "s11", name: "تطعيم دورنتال قطط", price: 180 },
  { id: "s12", name: "تطعيم دورنتال كلاب", price: 180 },
  { id: "s13", name: "اموكسي قطط", price: 30 },
  { id: "s14", name: "اموكسي كلاب", price: 50 },
  { id: "s15", name: "ديكسا قطط", price: 30 },
  { id: "s16", name: "ديكسا كلاب", price: 50 },
  { id: "s17", name: "ديفيدري", price: 40 },
  { id: "s18", name: "ميتافوسفان", price: 50 },
  { id: "s19", name: "اوكسي توسين", price: 30 },
  { id: "s20", name: "اتروبين", price: 30 },
  { id: "s21", name: "انتودين", price: 30 },
  { id: "s22", name: "دانسيت", price: 30 },
  { id: "s23", name: "بيكوزيم", price: 30 },
  { id: "s24", name: "اعطاء محاليل", price: 40 },
  { id: "s25", name: "كانيولا", price: 80 },
  { id: "s26", name: "تطعيم سعار", price: 350 },
  { id: "s27", name: "تطعيم رباعي", price: 550 },
  { id: "s28", name: "تطعيم ثنائي", price: 400 },
  { id: "s29", name: "تطعيم خماسي", price: 450 },
  { id: "s30", name: "تطعيم ثماني", price: 500 },
  { id: "s31", name: "تعقيم ولد", price: 500 },
  { id: "s32", name: "تعقيم بنت", price: 1200 },
  { id: "s33", name: "ديكتو كلاب ١ سنتي", price: 100 },
  { id: "s34", name: "ديكتو كلاب ٢ سنتي", price: 150 },
  { id: "s35", name: "اكتو ميثرين", price: 40 },
  { id: "s36", name: "غيار على جرح", price: 50 },
  { id: "s37", name: "جلسه بخار", price: 40 },
  { id: "s38", name: "ازاله جسم غريب", price: 1200 },
  { id: "s39", name: "سحب عينه بسرنجه", price: 30 },
  { id: "s40", name: "سحب عينه بكانيولا", price: 50 },
  { id: "s41", name: "رفع حراره", price: 50 },
  { id: "s42", name: "تفضيه غذه", price: 30 },
  { id: "s43", name: "عمليه قيصري", price: 1500 },
  { id: "s44", name: "صوره دم", price: 450 },
  { id: "s45", name: "طفيليات دم", price: 300 },
  { id: "s46", name: "يوريا", price: 150 },
  { id: "s47", name: "كريات", price: 150 },
  { id: "s48", name: "خياطه جرح", price: 300 },
  { id: "s49", name: "تنظيف جرح", price: 70 },
  { id: "s50", name: "حلاقه قط زيرو", price: 150 },
  { id: "s51", name: "حلاقه قط تخفيف", price: 250 },
  { id: "s52", name: "حلاقه كلب صغير", price: 150 },
  { id: "s53", name: "حلاقه كلب وسط", price: 200 },
  { id: "s54", name: "حلاقه كلب كبير", price: 250 },
  { id: "s55", name: "قص اضافر قطط", price: 30 },
  { id: "s56", name: "قص اضافر كلاب", price: 40 },
  { id: "s57", name: "قص شعر الكفوف", price: 30 },
  { id: "s58", name: "قص شعر تحت الذيل", price: 30 },
  { id: "s59", name: "قص شعر تحت البطن", price: 30 },
  { id: "s60", name: "تخفيف كلب وسط", price: 250 },
  { id: "s61", name: "امبول حشرات قطط", price: 110 },
  { id: "s62", name: "امبول حشرات كلاب", price: 110 },
  { id: "s63", name: "حموم قط عادي", price: 150 },
  { id: "s64", name: "حموم قط علاجي", price: 175 },
  { id: "s65", name: "اقامه عادي", price: 50, daily: true },
  { id: "s66", name: "اقامه علاجي", price: 75, daily: true },
  { id: "s67", name: "اورني", price: 50 },
  { id: "s68", name: "اعطاء حقنه", price: 20 },
  { id: "s69", name: "لينكو", price: 30 },
  { id: "s70", name: "هستا قطط", price: 30 },
  { id: "s71", name: "هستا كلاب", price: 40 },
  { id: "s72", name: "تنظيف اذن", price: 40 },
  { id: "s73", name: "ديكتو قطط", price: 80 },
];

const DEFAULT_DOCTORS = ["د. عبدالرحمن", "د. محمود"];

const DEFAULTS = {
  clients: [],
  visits: [],
  appointments: [],
  expenses: [],
};

const PHARMACY_DEFAULTS = {
  medicines: [],
  prescriptions: [],
  prescriptionItems: [],
  sales: [],
  saleItems: [],
};

export function loadServices() {
  try {
    const raw = localStorage.getItem("vet_clinic_services");
    if (raw) return JSON.parse(raw);
  } catch {}
  // First load: save defaults
  try { localStorage.setItem("vet_clinic_services", JSON.stringify(DEFAULT_SERVICES)); } catch {}
  return DEFAULT_SERVICES;
}

export function saveServices(data) {
  try { localStorage.setItem("vet_clinic_services", JSON.stringify(data)); } catch {}
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        clients: parsed.clients ?? DEFAULTS.clients,
        visits: parsed.visits ?? DEFAULTS.visits,
        appointments: (parsed.appointments ?? DEFAULTS.appointments).map(a => ({ ...a, status: a.status || "pending" })),
        expenses: parsed.expenses ?? DEFAULTS.expenses,
      };
    }
  } catch { /* ignore */ }
  return DEFAULTS;
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function loadDoctors() {
  try { const r = localStorage.getItem("vet_doctors"); if (r) { const p = JSON.parse(r); if (Array.isArray(p) && p.length > 0) return p; } } catch {}
  return DEFAULT_DOCTORS;
}

export function saveDoctors(docs) {
  try { localStorage.setItem("vet_doctors", JSON.stringify(docs)); } catch {}
}

export function blobToBase64(blob) {
  return new Promise((resolve) => {
    if (!blob) resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export function loadPharmacyData() {
  try {
    const raw = localStorage.getItem(PHARMACY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        medicines: parsed.medicines ?? PHARMACY_DEFAULTS.medicines,
        prescriptions: parsed.prescriptions ?? [],
        prescriptionItems: parsed.prescriptionItems ?? [],
        sales: parsed.sales ?? [],
        saleItems: parsed.saleItems ?? [],
      };
    }
  } catch { /* ignore */ }
  return PHARMACY_DEFAULTS;
}

export function savePharmacyData(data) {
  try {
    localStorage.setItem(PHARMACY_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function loadPharmacyClients() {
  try { return JSON.parse(localStorage.getItem("vet_pharmacy_clients")) || []; } catch { return []; }
}
