-- Run this in the Neon SQL Editor (console.neon.tech → your project → SQL Editor)

CREATE TABLE IF NOT EXISTS machines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  serial_number TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  location TEXT,
  notes TEXT,
  responsible_name TEXT,
  responsible_phone TEXT,
  responsible_email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  performed_by TEXT,
  date DATE NOT NULL,
  next_due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
