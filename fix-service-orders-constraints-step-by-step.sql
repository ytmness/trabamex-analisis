-- =====================================================
-- CORRECCIÓN PASO A PASO DE CONSTRAINTS DE SERVICE_ORDERS
-- =====================================================
-- Este script identifica y corrige datos problemáticos antes de actualizar constraints

-- 1. VERIFICAR EL CONSTRAINT ACTUAL
-- =====================================================
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'service_orders'::regclass 
AND contype = 'c';

-- 2. IDENTIFICAR QUÉ ESTADOS EXISTEN ACTUALMENTE EN LA TABLA
-- =====================================================
SELECT 
  status,
  COUNT(*) as cantidad_registros
FROM service_orders 
GROUP BY status 
ORDER BY status;

-- 3. IDENTIFICAR REGISTROS CON ESTADOS PROBLEMÁTICOS
-- =====================================================
-- Ver todos los registros para entender qué estados tenemos
SELECT 
  id,
  status,
  customer_id,
  created_at,
  updated_at
FROM service_orders 
ORDER BY created_at DESC
LIMIT 20;

-- 4. VERIFICAR SI HAY ESTADOS QUE NO ESTÁN EN NUESTRA LISTA PERMITIDA
-- =====================================================
SELECT DISTINCT status
FROM service_orders 
WHERE status NOT IN (
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
);

-- 5. CORREGIR ESTADOS PROBLEMÁTICOS (SI EXISTEN)
-- =====================================================
-- Si encontramos estados como 'PLANNED', 'CREATED', etc., los convertimos a 'SCHEDULED'
-- Si encontramos estados como 'COMPLETED', 'FINISHED', etc., los convertimos a 'CERTIFIED'

-- Ejemplo de correcciones (ajustar según lo que encontremos):
-- UPDATE service_orders SET status = 'SCHEDULED' WHERE status = 'PLANNED';
-- UPDATE service_orders SET status = 'SCHEDULED' WHERE status = 'CREATED';
-- UPDATE service_orders SET status = 'CERTIFIED' WHERE status = 'COMPLETED';
-- UPDATE service_orders SET status = 'CERTIFIED' WHERE status = 'FINISHED';

-- 6. VERIFICAR QUE TODOS LOS ESTADOS SON VÁLIDOS
-- =====================================================
SELECT DISTINCT status
FROM service_orders 
WHERE status NOT IN (
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
);

-- 7. SOLO SI NO HAY ESTADOS PROBLEMÁTICOS, ACTUALIZAR EL CONSTRAINT
-- =====================================================
-- Primero eliminamos el constraint anterior
ALTER TABLE service_orders DROP CONSTRAINT IF EXISTS service_orders_status_check;

-- Luego creamos el nuevo constraint
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

-- 8. VERIFICAR QUE EL NUEVO CONSTRAINT FUNCIONA
-- =====================================================
-- Probar que podemos actualizar a ON_SITE_PICKUP
UPDATE service_orders 
SET status = 'ON_SITE_PICKUP' 
WHERE id = 'f0266a11-1653-4ef1-91c5-1de987d60c5b';

-- 9. VERIFICAR QUE SE ACTUALIZÓ
-- =====================================================
SELECT 
  id,
  status,
  updated_at
FROM service_orders 
WHERE id = 'f0266a11-1653-4ef1-91c5-1de987d60c5b';

-- 10. REVERTIR PARA LA DEMOSTRACIÓN (OPCIONAL)
-- =====================================================
UPDATE service_orders 
SET status = 'SCHEDULED' 
WHERE id = 'f0266a11-1653-4ef1-91c5-1de987d60c5b';

-- 11. VERIFICAR EL CONSTRAINT FINAL
-- =====================================================
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'service_orders'::regclass 
AND contype = 'c';

-- 12. INSTRUCCIONES IMPORTANTES
-- =====================================================
/*
INSTRUCCIONES DE EJECUCIÓN:

1. EJECUTAR SOLO LOS PASOS 1-4 PRIMERO
2. REVISAR QUÉ ESTADOS PROBLEMÁTICOS EXISTEN
3. EJECUTAR EL PASO 5 (correcciones) según lo encontrado
4. VERIFICAR CON EL PASO 6 que no hay estados problemáticos
5. SOLO ENTONCES ejecutar los pasos 7-11

SI ENCUENTRAS ESTADOS COMO:
- 'PLANNED' → convertir a 'SCHEDULED'
- 'CREATED' → convertir a 'SCHEDULED'  
- 'COMPLETED' → convertir a 'CERTIFIED'
- 'FINISHED' → convertir a 'CERTIFIED'
- 'PENDING' → convertir a 'SCHEDULED'

NO EJECUTES TODO EL SCRIPT DE UNA VEZ.
EJECUTA PASO A PASO Y REVISA LOS RESULTADOS.
*/
