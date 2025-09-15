-- =====================================================
-- SCRIPT SIMPLE PARA CORREGIR POLÍTICAS RLS
-- =====================================================
-- Este script evita consultar auth.users y usa políticas básicas

-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES PROBLEMÁTICAS
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

-- 2. CREAR POLÍTICAS MUY SIMPLES Y SEGURAS
-- =====================================================

-- Política básica: cualquier usuario autenticado puede ver su propio rol
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Política básica: cualquier usuario autenticado puede insertar su propio rol
CREATE POLICY "Users can insert own role" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política básica: cualquier usuario autenticado puede actualizar su propio rol
CREATE POLICY "Users can update own role" ON user_roles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política básica: cualquier usuario autenticado puede eliminar su propio rol
CREATE POLICY "Users can delete own role" ON user_roles
  FOR DELETE USING (auth.uid() = user_id);

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

-- 5. VERIFICAR QUE UN USUARIO PUEDE VER SU PROPIO ROL
-- =====================================================
-- Esto debería funcionar sin errores
SELECT role FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
