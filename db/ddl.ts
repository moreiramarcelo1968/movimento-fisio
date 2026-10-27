/**
 * DDL idempotente. É executado no primeiro acesso ao banco, tanto no PGlite
 * (desenvolvimento local) quanto no Neon (produção).
 */
export const DDL_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (lower(email))`,

  `CREATE TABLE IF NOT EXISTS patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    birth_date date,
    cpf text,
    address text,
    notes text,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS patients_name_idx ON patients (name)`,

  `CREATE TABLE IF NOT EXISTS service_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    duration_min integer NOT NULL DEFAULT 50,
    price_cents integer NOT NULL DEFAULT 0,
    color text NOT NULL DEFAULT 'teal',
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS service_types_name_key ON service_types (lower(name))`,

  `CREATE TABLE IF NOT EXISTS appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    service_type_id uuid NOT NULL REFERENCES service_types(id) ON DELETE RESTRICT,
    scheduled_at timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'scheduled',
    price_cents integer NOT NULL DEFAULT 0,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT appointments_status_check CHECK (status IN ('scheduled', 'completed', 'no_show', 'canceled')),
    CONSTRAINT appointments_price_check CHECK (price_cents >= 0)
  )`,
  `CREATE INDEX IF NOT EXISTS appointments_scheduled_at_idx ON appointments (scheduled_at)`,
  `CREATE INDEX IF NOT EXISTS appointments_patient_idx ON appointments (patient_id, scheduled_at)`,
  `CREATE INDEX IF NOT EXISTS appointments_service_type_idx ON appointments (service_type_id)`,

  `CREATE TABLE IF NOT EXISTS settings (
    id integer PRIMARY KEY DEFAULT 1,
    clinic_name text NOT NULL DEFAULT 'Clínica Movimento',
    professional_name text NOT NULL DEFAULT '',
    phone text,
    address text,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
];
