-- Add new columns to vehicles table for advanced details
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS vehicle_type text, -- 'PLAYA' or 'CIUDAD'
ADD COLUMN IF NOT EXISTS transmission text, -- 'Automática', 'Mecánica'
ADD COLUMN IF NOT EXISTS fuel_type text, -- 'Gasolina', 'Eléctrico', etc.
ADD COLUMN IF NOT EXISTS passengers integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS engine_power text; -- '400 HP', '1000cc'

-- Create an index for faster filtering by type
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type);

-- Optional: Update existing rows to have a default type if NULL
UPDATE vehicles SET vehicle_type = 'CIUDAD' WHERE vehicle_type IS NULL;
