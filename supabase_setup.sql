-- ============================================
-- Supabase Setup for Vet Clinic (عيادة الرحمة)
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. clients
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  animal TEXT NOT NULL,
  type TEXT,
  gender TEXT,
  phone TEXT,
  weight TEXT,
  debt NUMERIC DEFAULT 0
);

-- 2. visits
CREATE TABLE IF NOT EXISTS visits (
  id NUMERIC PRIMARY KEY,
  name TEXT NOT NULL,
  animal TEXT NOT NULL,
  date TEXT NOT NULL,
  services TEXT,
  total NUMERIC DEFAULT 0,
  paid NUMERIC DEFAULT 0,
  debt NUMERIC DEFAULT 0,
  weight TEXT,
  notes TEXT,
  audio TEXT,
  doctor TEXT,
  status TEXT
);

-- 3. appointments
CREATE TABLE IF NOT EXISTS appointments (
  id NUMERIC PRIMARY KEY,
  name TEXT NOT NULL,
  animal TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT DEFAULT '',
  reason TEXT DEFAULT 'متابعة'
);

-- ============================================
-- Row Level Security — Allow public access
-- (No auth required for clinic internal tool)
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (safe re-run)
DROP POLICY IF EXISTS "Public access" ON clients;
DROP POLICY IF EXISTS "Public access" ON visits;
DROP POLICY IF EXISTS "Public access" ON appointments;

-- Allow all operations for anon key
CREATE POLICY "Public access" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON appointments FOR ALL USING (true) WITH CHECK (true);
