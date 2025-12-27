
-- Create Reference Table for Promotions
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    min_rental_hours INTEGER DEFAULT 0, -- Changed from days to hours to match UI
    vehicle_type_condition TEXT, -- 'Todos', '4x4', 'Deportivo'
    location_condition TEXT, -- 'Todas', 'Lima', 'Ica'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active promotions (public)
CREATE POLICY "Public Read Active Promotions" 
ON promotions FOR SELECT 
USING (true);

-- Policy: Authenticated users (Admins/Owners) can do everything
CREATE POLICY "Auth Users Can Manage Promotions" 
ON promotions FOR ALL 
USING (auth.role() = 'authenticated');

-- Insert Sample Data in Spanish
INSERT INTO promotions (name, code, description, discount_type, discount_value, start_date, end_date, vehicle_type_condition, location_condition, min_rental_hours)
VALUES 
('Oferta de Verano', 'VERANO2025', 'Descuento especial para la temporada de playa.', 'percentage', 15, NOW(), NOW() + INTERVAL '3 months', 'Todos', 'Todas', 24),
('Escapada de Fin de Semana', 'FINDE10', '10% de descuento en alquileres de más de 48 horas.', 'percentage', 10, NOW(), NOW() + INTERVAL '6 months', '4x4', 'Ica', 48),
('Bienvenida Nuevo Usuario', 'HOLA50', 'S/ 50 de descuento en tu primera reserva.', 'fixed', 50, NOW(), NULL, 'Todos', 'Todas', 0)
ON CONFLICT (code) DO NOTHING;
