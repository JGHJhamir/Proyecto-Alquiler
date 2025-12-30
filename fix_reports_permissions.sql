
-- 1. Eliminar politicas anteriores si existen (para evitar el error "already exists")
drop policy if exists "Admin and Owner view all bookings" on bookings;
drop policy if exists "Admin_Owner_View_Bookings" on bookings;
drop policy if exists "Admin and Owner view all profiles" on profiles;
drop policy if exists "Admin_Owner_View_Profiles" on profiles;

-- 2. Crear las políticas nuevamente (CORREGIDAS)
create policy "Admin and Owner view all bookings"
on bookings for select
using (
  auth.uid() in (
    select id from profiles where role in ('admin', 'owner')
  )
);

create policy "Admin and Owner view all profiles"
on profiles for select
using (
  auth.uid() in (
    select id from profiles where role in ('admin', 'owner')
  )
);
