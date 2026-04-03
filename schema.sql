-- Run in Neon SQL Editor (console.neon.tech → project → SQL Editor)

CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'bedrift',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machines (
  id SERIAL PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  owner_organization_id INTEGER NOT NULL REFERENCES organizations(id),
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  responsible_name TEXT,
  responsible_phone TEXT,
  responsible_email TEXT,
  notes TEXT,
  image_url TEXT,
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

CREATE TABLE IF NOT EXISTS loan_requests (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  requester_organization_id INTEGER NOT NULL REFERENCES organizations(id),
  requester_name TEXT NOT NULL,
  requester_phone TEXT,
  requester_email TEXT,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  response_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  loan_request_id INTEGER REFERENCES loan_requests(id),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  borrower_organization_id INTEGER NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW()
);
