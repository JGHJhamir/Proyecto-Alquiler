-- Verificar vehículos sin ciudad
SELECT 
    id,
    make,
    model,
    year,
    location_city,
    category
FROM vehicles
WHERE location_city IS NULL OR location_city = ''
ORDER BY created_at DESC;

-- Ver todos los vehículos con sus ubicaciones
SELECT 
    id,
    make,
    model,
    year,
    location_city,
    category
FROM vehicles
ORDER BY created_at DESC
LIMIT 20;
