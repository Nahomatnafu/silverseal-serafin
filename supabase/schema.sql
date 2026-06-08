-- Secure Guard Force Management Tool - Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sites/Locations table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL, -- guard, bodyguard, supervisor, etc.
  profile_photo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'active', -- active, inactive
  notes TEXT,
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  -- Assignment metadata
  tour TEXT, -- 'Tour 1' | 'Tour 2' | 'Tour 3' | 'Museum'
  current_position TEXT,
  fireguard BOOLEAN DEFAULT false,
  -- Key dates
  training_start_date DATE,
  official_start_date DATE,
  date_inactive DATE,
  date_reactivated DATE,
  -- Administrative
  notice_file_url TEXT,
  -- Regular days off
  rdo_monday BOOLEAN DEFAULT false,
  rdo_tuesday BOOLEAN DEFAULT false,
  rdo_wednesday BOOLEAN DEFAULT false,
  rdo_thursday BOOLEAN DEFAULT false,
  rdo_friday BOOLEAN DEFAULT false,
  rdo_saturday BOOLEAN DEFAULT false,
  rdo_sunday BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments/Shifts table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  shift_label TEXT NOT NULL, -- e.g., "Morning Shift", "Night Watch"
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certifications table
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  cert_type TEXT NOT NULL, -- e.g., "CPR", "Armed Security License", "First Aid"
  issued_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Counseling Records table
CREATE TABLE counseling_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  infraction_datetime TIMESTAMPTZ NOT NULL,
  given_by TEXT NOT NULL,
  counseling_type TEXT NOT NULL, -- 'Verbal Warning' | 'Written Warning' | 'Final Warning' | 'Suspension' | 'Termination Warning' | 'Commendation' | 'General Counseling'
  details TEXT,
  actions_taken TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  document_type TEXT NOT NULL, -- contract, license, certificate, etc.
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT document_belongs_to_employee_or_site CHECK (
    (employee_id IS NOT NULL AND site_id IS NULL) OR
    (employee_id IS NULL AND site_id IS NOT NULL)
  )
);

-- Indexes for counseling
CREATE INDEX idx_counseling_employee ON counseling_records(employee_id);
CREATE INDEX idx_counseling_datetime ON counseling_records(infraction_datetime DESC);

-- Indexes for performance
CREATE INDEX idx_assignments_employee ON assignments(employee_id);
CREATE INDEX idx_assignments_site ON assignments(site_id);
CREATE INDEX idx_assignments_time ON assignments(start_time, end_time);
CREATE INDEX idx_certifications_employee ON certifications(employee_id);
CREATE INDEX idx_certifications_expiry ON certifications(expiry_date);
CREATE INDEX idx_sites_client ON sites(client_id);
CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_documents_site ON documents(site_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counseling_updated_at BEFORE UPDATE ON counseling_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

