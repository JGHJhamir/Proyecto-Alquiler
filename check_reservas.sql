-- Verificar si existen reservas en la base de datos
SELECT 
    b.id,
    b.user_id,
    b.vehicle_id,
    b.status,
    b.total_price,
    b.start_date,
    b.end_date,
    b.created_at,
    v.make,
    v.model,
    p.full_name,
    p.email
FROM bookings b
LEFT JOIN vehicles v ON b.vehicle_id = v.id
LEFT JOIN profiles p ON b.user_id = p.id
ORDER BY b.created_at DESC
LIMIT 10;

-- Contar total de reservas
SELECT COUNT(*) as total_reservas FROM bookings;

-- Verificar el usuario admin actual
SELECT id, email, role FROM profiles WHERE role = 'admin';
