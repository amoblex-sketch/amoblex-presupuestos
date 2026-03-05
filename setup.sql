-- ═══════════════════════════════════════════════
-- AMOBLEX — Setup de Base de Datos Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════

-- Tabla principal: key-value para todos los datos de la app
CREATE TABLE IF NOT EXISTS app_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_app_data_updated ON app_data(updated_at DESC);

-- Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_data_timestamp
  BEFORE UPDATE ON app_data
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Habilitar Row Level Security (seguridad)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Política: permitir todo a usuarios autenticados por anon key (la app maneja auth internamente)
CREATE POLICY "Allow all for anon" ON app_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insertar datos iniciales vacíos
INSERT INTO app_data (key, value) VALUES
  ('v2pr3', '{}'),
  ('v2ac', '[]'),
  ('v2cl', '[]'),
  ('v2ps', '[]'),
  ('v2pu', '""'),
  ('v2bk', '[]'),
  ('v2man', '[]'),
  ('v2pag', '[]'),
  ('v2ock', '{}')
ON CONFLICT (key) DO NOTHING;

-- ═══ LISTO ═══
-- Después de ejecutar esto, copiá:
-- 1. Project URL (Settings → API → Project URL)
-- 2. anon/public key (Settings → API → anon public)
-- Y pegalos en el archivo .env de tu proyecto
