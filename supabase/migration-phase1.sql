-- Phase 1 migration: applies to an existing employees table that still uses a
-- single `name` column and is missing the new Main Information fields.
-- Run once in the Supabase SQL editor.

BEGIN;

-- 1. Split `name` into first_name / last_name.
ALTER TABLE employees ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_name TEXT;

UPDATE employees
SET
  first_name = COALESCE(first_name, split_part(name, ' ', 1)),
  last_name  = COALESCE(
    last_name,
    NULLIF(regexp_replace(name, '^\S+\s*', ''), '')
  )
WHERE name IS NOT NULL;

-- Fill any remaining nulls so we can enforce NOT NULL.
UPDATE employees SET first_name = 'Unknown' WHERE first_name IS NULL OR first_name = '';
UPDATE employees SET last_name  = 'Unknown' WHERE last_name  IS NULL OR last_name  = '';

ALTER TABLE employees ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE employees ALTER COLUMN last_name  SET NOT NULL;

ALTER TABLE employees DROP COLUMN IF EXISTS name;

-- 2. Address fields.
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS city          TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS state         TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS postal_code   TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS country       TEXT;

-- 3. Assignment metadata.
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tour             TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS current_position TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS fireguard        BOOLEAN DEFAULT false;

-- 4. Key dates.
ALTER TABLE employees ADD COLUMN IF NOT EXISTS training_start_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS official_start_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS date_inactive       DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS date_reactivated    DATE;

-- 5. Administrative file upload.
ALTER TABLE employees ADD COLUMN IF NOT EXISTS notice_file_url TEXT;

COMMIT;
