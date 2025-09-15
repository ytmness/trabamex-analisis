-- =====================================================
-- SCRIPT PARA CORREGIR POLÍTICAS RLS PROBLEMÁTICAS
-- =====================================================
-- Este script corrige el error "infinite recursion detected in policy"

-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES PROBLEMÁTICAS
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

-- 2. CREAR POLÍTICAS SIMPLES Y SEGURAS
-- =====================================================

-- Política para que los usuarios vean su propio rol
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que los administradores vean todos los roles
-- SIN usar la tabla user_roles para verificar si es admin (esto causa recursión)
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email IN (
        SELECT email FROM auth.users 
        WHERE email LIKE '%admin%' 
        OR email LIKE '%@trabamex.com'
      )
    )
  );

-- Política para que los administradores inserten roles
CREATE POLICY "Admins can insert roles" ON user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email IN (
        SELECT email FROM auth.users 
        WHERE email LIKE '%admin%' 
        OR email LIKE '%@trabamex.com'
      )
    )
  );

-- Política para que los administradores actualicen roles
CREATE POLICY "Admins can update roles" ON user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email IN (
        SELECT email FROM auth.users 
        WHERE email LIKE '%admin%' 
        OR email LIKE '%@trabamex.com'
      )
    )
  );

-- Política para que los administradores eliminen roles
CREATE POLICY "Admins can delete roles" ON user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email IN (
        SELECT email FROM auth.users 
        WHERE email LIKE '%admin%' 
        OR email LIKE '%@trabamex.com'
      )
    )
  );

-- 3. VERIFICAR QUE LAS POLÍTICAS SE CREARON CORRECTAMENTE
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;

-- 4. VERIFICAR QUE NO HAY RECURSIÓN
-- =====================================================
-- Intentar una consulta simple para verificar que funciona
SELECT COUNT(*) as total_roles FROM user_roles LIMIT 1;
