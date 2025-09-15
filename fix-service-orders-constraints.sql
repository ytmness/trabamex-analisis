-- =====================================================
-- CORRECCIÓN DE CONSTRAINTS DE SERVICE_ORDERS
-- =====================================================
-- Este script corrige el constraint de validación del campo status

-- 1. VERIFICAR EL CONSTRAINT ACTUAL
-- =====================================================
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'service_orders'::regclass 
AND contype = 'c';

-- 2. VERIFICAR LA ESTRUCTURA ACTUAL DE LA TABLA
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'service_orders' 
AND column_name = 'status';

-- 3. ELIMINAR EL CONSTRAINT PROBLEMÁTICO
-- =====================================================
-- Primero necesitamos saber el nombre exacto del constraint
-- Luego lo eliminamos
ALTER TABLE service_orders DROP CONSTRAINT IF EXISTS service_orders_status_check;

-- 4. CREAR UN NUEVO CONSTRAINT CON TODOS LOS ESTADOS VÁLIDOS
-- =====================================================
ALTER TABLE service_orders ADD CONSTRAINT service_orders_status_check 
CHECK (status IN (
  'SCHEDULED',
  'EN_ROUTE_TO_PICKUP', 
  'ON_SITE_PICKUP',
  'COLLECTED',
  'EN_ROUTE_TO_DEPOT',
  'AT_DEPOT',
  'WEIGHED_VERIFIED',
  'EN_ROUTE_TO_TREATMENT',
  'IN_TREATMENT',
  'TREATED',
  'CERTIFIED',
  'CANCELLED'
));

-- 5. VERIFICAR QUE EL NUEVO CONSTRAINT SE CREÓ CORRECTAMENTE
-- =====================================================
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'service_orders'::regclass 
AND contype = 'c';

-- 6. PROBAR QUE FUNCIONA
-- =====================================================
-- Intentar actualizar el estado a ON_SITE_PICKUP
-- (Esto debería funcionar ahora)
UPDATE service_orders 
SET status = 'ON_SITE_PICKUP' 
WHERE id = 'f0266a11-1653-4ef1-91c5-1de987d60c5b';

-- 7. VERIFICAR QUE SE ACTUALIZÓ
-- =====================================================
SELECT 
  id,
  status,
  updated_at
FROM service_orders 
WHERE id = 'f0266a11-1653-4ef1-91c5-1de987d60c5b';

-- 8. REVERTIR PARA LA DEMOSTRACIÓN (OPCIONAL)
-- =====================================================
-- Si quieres volver al estado anterior para probar
UPDATE service_orders 
SET status = 'SCHEDULED' 
WHERE id = 'f0266a11-1653-4ef1-91c5-1de987d60c5b';

-- 9. INSTRUCCIONES DE VERIFICACIÓN
-- =====================================================
/*
DESPUÉS DE EJECUTAR ESTE SCRIPT:

1. El constraint anterior se habrá eliminado
2. Se creará un nuevo constraint que permite TODOS los estados del timeline
3. Podrás cambiar el estado a cualquier valor válido
4. Probar que funciona desde el panel de administrador

ESTADOS PERMITIDOS:
- SCHEDULED (Planificado)
- EN_ROUTE_TO_PICKUP (En Camino)
- ON_SITE_PICKUP (En el Sitio)
- COLLECTED (Recolectado)
- EN_ROUTE_TO_DEPOT (En Ruta al Depósito)
- AT_DEPOT (En Depósito)
- WEIGHED_VERIFIED (Pesado y Verificado)
- EN_ROUTE_TO_TREATMENT (En Transporte)
- IN_TREATMENT (Tratamiento)
- TREATED (Disposición Final)
- CERTIFIED (Certificado)
- CANCELLED (Cancelado)
*/
