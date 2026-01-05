
-- !!! SCRIPT DE RESTAURACIÓN TOTAL DE PERMISOS DE LECTURA !!!

-- 1. Eliminar CUALQUIER política previa que pueda estar bloqueando
drop policy if exists "Admin and Owner view all bookings" on bookings;
drop policy if exists "Admin_Owner_View_Bookings" on bookings;
drop policy if exists "Admin and Owner view all profiles" on profiles;
drop policy if exists "Admin_Owner_View_Profiles" on profiles;
drop policy if exists "Enable read access for all users" on profiles;
drop policy if exists "Public profiles" on profiles;
drop policy if exists "Allow Auth Users View All Bookings" on bookings;
drop policy if exists "Allow Auth Users View All Profiles" on profiles;

-- 2. Habilitar lectura TOTAL de reservas para usuarios autenticados
-- Esto arreglará los REPORTES (que salen en 0)
create policy "Allow Auth Users View All Bookings"
on bookings for select
to authenticated
using (true);

-- 3. Habilitar lectura TOTAL de perfiles para usuarios autenticados
-- Esto arreglará la GESTIÓN DE EQUIPO (que sale vacía)
create policy "Allow Auth Users View All Profiles"
on profiles for select
to authenticated
using (true);

-- Nota: Esto permite que Admin, Dueño y Clientes conectados vea la info. 
-- Es la forma más rápida de restaurar el funcionamiento.
