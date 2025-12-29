-- Verificar estructura de la tabla profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Verificar estructura de la tabla bookings
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings';

-- Verificar si existen reservas (sin JOIN)
SELECT 
    id,
    user_id,
    vehicle_id,
    status,
    total_price,
    created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 10;

-- Contar total de reservas
SELECT COUNT(*) as total_reservas FROM bookings;

-- Ver todos los perfiles
SELECT * FROM profiles LIMIT 5;
