-- Ver todas las reservas que existen
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10;

-- Contar total de reservas
SELECT COUNT(*) as total FROM bookings;
