-- Script para limpiar tablas (Eliminar todos los datos)
-- ADVERTENCIA: Esto eliminará permanentemente los datos de las tablas seleccionadas.
-- Ejecuta este script en el Editor SQL de Supabase.

-- Limpiar logs de auditoría
TRUNCATE TABLE public.audit_logs CASCADE;

-- Limpiar reservas (bookings)
-- Nota: Usamos CASCADE para borrar también registros dependientes si los hubiera.
TRUNCATE TABLE public.bookings CASCADE;

-- OPCIONAL: Limpiar otras tablas (Descomentar si es necesario)

-- Limpiar vehículos (Cuidado: Eliminará el catálogo de vehículos)
-- TRUNCATE TABLE public.vehicles CASCADE;

-- Limpiar perfiles de usuario (Cuidado: Puede romper la integridad con auth.users)
-- TRUNCATE TABLE public.profiles CASCADE;
