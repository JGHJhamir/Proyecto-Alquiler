-- ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- CREAR POLÍTICA SIMPLE: Permitir que TODOS los usuarios autenticados vean TODAS las reservas
CREATE POLICY "Allow authenticated users to view all bookings"
ON bookings FOR SELECT
TO authenticated
USING (true);

-- CREAR POLÍTICA SIMPLE: Permitir que TODOS los usuarios autenticados vean TODOS los perfiles
CREATE POLICY "Allow authenticated users to view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);
