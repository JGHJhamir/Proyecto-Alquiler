-- ==========================================
-- CONSULTAS GENERALES PARA SUPABASE - PROYECTO ALQUILER
-- ==========================================

-- 1. CONSULTAS DE ALQUILERES (BOOKINGS)
-- Ver todos los alquileres recientes
SELECT * FROM public.bookings ORDER BY created_at DESC LIMIT 20;

-- Ver alquileres con detalles de usuario y vehículo (JOIN)
SELECT 
  b.id,
  b.status,
  b.total_price,
  b.start_time,
  b.end_time,
  p.full_name as cliente,
  p.email as cliente_email,
  v.make,
  v.model,
  v.license_plate
FROM public.bookings b
JOIN public.profiles p ON b.user_id = p.id
JOIN public.vehicles v ON b.vehicle_id = v.id
ORDER BY b.created_at DESC;

-- Contar alquileres por estado
SELECT status, COUNT(*) 
FROM public.bookings 
GROUP BY status;

-- 2. GESTIÓN DE VEHÍCULOS
-- Ver todos los vehículos disponibles
SELECT * FROM public.vehicles WHERE status = 'available';

-- Ver vehículos por propietario
SELECT v.id, v.make, v.model, p.full_name as propietario
FROM public.vehicles v
JOIN public.profiles p ON v.owner_id = p.id;

-- 3. GESTIÓN DE USUARIOS (PERFILES)
-- Ver todos los perfiles de usuarios
SELECT * FROM public.profiles ORDER BY created_at DESC;

-- Buscar usuario por email (en public.profiles)
SELECT * FROM public.profiles WHERE email ILIKE '%ejemplo@email.com%';

-- Ver administradores u otros roles especiales
SELECT * FROM public.profiles WHERE role IN ('admin', 'owner', 'seller');

-- 4. SEGURIDAD Y PERMISOS
-- Ver políticas RLS (Row Level Security) activas
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public';

-- 5. AUDITORÍA
-- Ver últimas acciones registradas
SELECT * FROM public.audit_logs ORDER BY created_at DESC LIMIT 50;

-- 6. UTILIDADES/MANTENIMIENTO
-- Verificar tamaño de tablas (aproximado)
SELECT 
  table_name, 
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as total_size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;

-- Resetear una reserva atascada (Ejemplo de Update)
-- UPDATE public.bookings SET status = 'cancelled' WHERE id = 'UUID_DE_LA_RESERVA';

-- Cambiar rol de usuario a admin (Ejemplo de Update)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'usuario@email.com';
