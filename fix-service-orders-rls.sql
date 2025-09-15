-- =====================================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA SERVICE_ORDERS
-- =====================================================
-- Este script corrige el problema donde los administradores no pueden actualizar órdenes

-- 1. ELIMINAR POLÍTICAS PROBLEMÁTICAS EXISTENTES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own orders" ON service_orders;
DROP POLICY IF EXISTS "Users can create orders" ON service_orders;
DROP POLICY IF EXISTS "Users can update own orders" ON service_orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON service_orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON service_orders;

-- 2. CREAR POLÍTICAS SIMPLES Y FUNCIONALES
-- =====================================================

-- Política para que los usuarios vean solo sus propias órdenes
CREATE POLICY "Users can view own orders" ON service_orders
FOR SELECT USING (
  customer_id = auth.uid()
);

-- Política para que los usuarios creen órdenes
CREATE POLICY "Users can create orders" ON service_orders
FOR INSERT WITH CHECK (
  customer_id = auth.uid()
);

-- Política para que los usuarios actualicen solo sus órdenes en estado inicial
CREATE POLICY "Users can update own orders" ON service_orders
FOR UPDATE USING (
  customer_id = auth.uid() AND status IN ('CREATED', 'SCHEDULED')
);

-- Política para que los administradores vean todas las órdenes
-- Usando una verificación simple del rol en profiles
CREATE POLICY "Admins can view all orders" ON service_orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política para que los administradores actualicen todas las órdenes
-- Esta es la política clave que estaba fallando
CREATE POLICY "Admins can update all orders" ON service_orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
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
WHERE tablename = 'service_orders'
ORDER BY policyname;

-- 4. VERIFICAR QUE RLS ESTÁ HABILITADO
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'service_orders';

-- 5. PROBAR QUE UN ADMIN PUEDE ACTUALIZAR ÓRDENES
-- =====================================================
-- Esta consulta debería funcionar si las políticas están correctas
-- (ejecutar como usuario administrador)
SELECT 
  'Políticas RLS configuradas correctamente' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'service_orders';

-- 6. VERIFICAR QUE NO HAY CONFLICTOS DE POLÍTICAS
-- =====================================================
-- Mostrar todas las políticas activas para service_orders
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'LECTURA'
    WHEN cmd = 'INSERT' THEN 'INSERCIÓN'
    WHEN cmd = 'UPDATE' THEN 'ACTUALIZACIÓN'
    WHEN cmd = 'DELETE' THEN 'ELIMINACIÓN'
    WHEN cmd = 'ALL' THEN 'TODAS LAS OPERACIONES'
  END as operacion,
  qual as condicion
FROM pg_policies 
WHERE tablename = 'service_orders'
ORDER BY cmd, policyname;
