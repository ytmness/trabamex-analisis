-- =====================================================
-- LIMPIEZA COMPLETA DE POLÍTICAS RLS DE SERVICE_ORDERS
-- =====================================================
-- Este script elimina TODAS las políticas duplicadas y conflictivas

-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- =====================================================
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON service_orders;
DROP POLICY IF EXISTS "Users can create orders" ON service_orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON service_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON service_orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON service_orders;
DROP POLICY IF EXISTS "Enable update for users based on customer_id" ON service_orders;
DROP POLICY IF EXISTS "Users can update own orders" ON service_orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON service_orders;

-- 2. VERIFICAR QUE NO QUEDEN POLÍTICAS
-- =====================================================
SELECT 
  'Políticas restantes después de limpieza:' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'service_orders';

-- 3. CREAR POLÍTICAS LIMPIAS Y SEGURAS
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
CREATE POLICY "Admins can view all orders" ON service_orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política para que los administradores actualicen todas las órdenes
CREATE POLICY "Admins can update all orders" ON service_orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. VERIFICAR LAS NUEVAS POLÍTICAS
-- =====================================================
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

-- 5. VERIFICAR QUE RLS ESTÁ HABILITADO
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS ACTIVADO'
    ELSE 'RLS DESACTIVADO'
  END as estado_rls
FROM pg_tables 
WHERE tablename = 'service_orders';

-- 6. PROBAR QUE LAS POLÍTICAS FUNCIONAN
-- =====================================================
-- Esta consulta debería mostrar exactamente 5 políticas
SELECT 
  'Verificación final:' as status,
  COUNT(*) as total_policies,
  STRING_AGG(cmd, ', ' ORDER BY cmd) as operaciones_cubiertas
FROM pg_policies 
WHERE tablename = 'service_orders';

-- 7. INSTRUCCIONES DE VERIFICACIÓN
-- =====================================================
/*
DESPUÉS DE EJECUTAR ESTE SCRIPT:

1. Deberías ver exactamente 5 políticas:
   - Users can view own orders (SELECT)
   - Users can create orders (INSERT) 
   - Users can update own orders (UPDATE)
   - Admins can view all orders (SELECT)
   - Admins can update all orders (UPDATE)

2. NO debería haber políticas con condición 'null' o 'true'

3. Los usuarios solo pueden ver/actualizar sus propias órdenes

4. Los administradores pueden ver/actualizar todas las órdenes

5. Probar que funciona:
   - Como usuario normal: solo ver sus órdenes
   - Como admin: ver y actualizar todas las órdenes
*/
