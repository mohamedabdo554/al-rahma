-- ============================================
-- Pharmacy Module Schema for Vet Clinic
-- Run in Supabase SQL Editor after supabase_setup.sql
-- ============================================

-- 1. medicines — inventory
CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY,
  qr_code TEXT UNIQUE DEFAULT '',
  name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 0,
  purchase_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  expiration_date TEXT DEFAULT ''
);

-- 2. prescriptions — doctor writes, pharmacist dispenses
DO $$ BEGIN
  CREATE TYPE prescription_status AS ENUM ('pending', 'dispensed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_animal TEXT NOT NULL,
  doctor_name TEXT DEFAULT '',
  diagnosis TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','dispensed')),
  created_at TEXT NOT NULL
);

-- 3. prescription_items — line items per prescription
CREATE TABLE IF NOT EXISTS prescription_items (
  id TEXT PRIMARY KEY,
  prescription_id TEXT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_id TEXT NOT NULL REFERENCES medicines(id),
  medicine_name TEXT NOT NULL,
  dosage TEXT DEFAULT '',
  quantity_prescribed NUMERIC DEFAULT 1
);

-- 4. sales — checkout transactions (OTC or dispensed)
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'otc' CHECK (type IN ('otc','prescription')),
  prescription_id TEXT,
  total NUMERIC DEFAULT 0,
  created_at TEXT NOT NULL
);

-- 5. sale_items — line items per sale
CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  medicine_id TEXT
);

-- RLS: public access (same pattern as clinic tables)
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access" ON medicines;
DROP POLICY IF EXISTS "Public access" ON prescriptions;
DROP POLICY IF EXISTS "Public access" ON prescription_items;
DROP POLICY IF EXISTS "Public access" ON sales;
DROP POLICY IF EXISTS "Public access" ON sale_items;

CREATE POLICY "Public access" ON medicines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON prescriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON prescription_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON sale_items FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
