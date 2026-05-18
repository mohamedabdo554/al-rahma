-- ============================================
-- Pharmacy Module v2 — Vet Clinic
-- Run in Supabase SQL Editor (overrides v1)
-- ============================================

DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TYPE IF EXISTS rx_status;

CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT UNIQUE DEFAULT '',
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  purchase_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  expiration_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_medicines_qr ON medicines (qr_code);
CREATE INDEX idx_medicines_name ON medicines (name);

CREATE TYPE rx_status AS ENUM ('pending','dispensed');

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_animal TEXT NOT NULL,
  doctor_name TEXT DEFAULT '',
  diagnosis TEXT DEFAULT '',
  status rx_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  quantity_prescribed INTEGER DEFAULT 1
);

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'otc' CHECK (type IN ('otc','prescription')),
  prescription_id UUID REFERENCES prescriptions(id),
  total NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines(id),
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC DEFAULT 0
);

-- RLS: public access (same pattern as clinic)
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
