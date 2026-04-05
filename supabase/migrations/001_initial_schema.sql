-- ============================================================
-- LeadRadar — Schema inicial
-- Pega este SQL en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- ── 1. Estado de cada lead ───────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_status (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    INTEGER     NOT NULL UNIQUE,
  status     TEXT        NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','contacted','interested','not_interested','converted')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Notas por lead ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    INTEGER     NOT NULL,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Historial de prompts generados ────────────────────────
CREATE TABLE IF NOT EXISTS generated_prompts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    INTEGER     NOT NULL,
  type       TEXT        NOT NULL CHECK (type IN ('whatsapp','web')),
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Configuracion global de app (sin secretos) ──────────────
CREATE TABLE IF NOT EXISTS app_settings (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  scope                     TEXT        NOT NULL UNIQUE DEFAULT 'global',
  ai_provider               TEXT        NOT NULL DEFAULT 'groq'
                            CHECK (ai_provider IN ('groq','gemini')),
  whatsapp_model            TEXT        NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  web_model                 TEXT        NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  search_model              TEXT        NOT NULL DEFAULT 'groq/compound-mini',
  save_prompts_to_db        BOOLEAN     NOT NULL DEFAULT TRUE,
  show_leads_without_phone  BOOLEAN     NOT NULL DEFAULT TRUE,
  developer_profile         JSONB       NOT NULL DEFAULT '{
    "nombre": "David",
    "ciudad": "Madrid",
    "proyectoReferencia": "Focus Club Vallecas",
    "precioMin": 400,
    "precioMax": 800
  }'::jsonb,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Índices ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_lead_status_lead_id
  ON lead_status(lead_id);

CREATE INDEX IF NOT EXISTS idx_notes_lead_id
  ON notes(lead_id);

CREATE INDEX IF NOT EXISTS idx_notes_created
  ON notes(lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prompts_lead_id
  ON generated_prompts(lead_id);

CREATE INDEX IF NOT EXISTS idx_prompts_created
  ON generated_prompts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_app_settings_scope
  ON app_settings(scope);

-- ── RLS (Row Level Security) ──────────────────────────────────
-- La app es de un solo usuario (David) sin autenticación por ahora.
-- Deshabilitamos RLS para que el anon key pueda leer/escribir.
-- Si añades auth más adelante, actívalo y añade políticas por usuario.

ALTER TABLE lead_status       DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes             DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings      DISABLE ROW LEVEL SECURITY;
