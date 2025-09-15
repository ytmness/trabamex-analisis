-- =====================================================
-- SOLUCIÓN ALTERNATIVA: FUNCIÓN RPC PARA ACTUALIZAR ESTADO
-- =====================================================
-- Este script crea una función RPC que evita problemas de RLS

-- 1. CREAR FUNCIÓN RPC PARA ACTUALIZAR ESTADO DE ÓRDENES
-- =====================================================
CREATE OR REPLACE FUNCTION admin_update_order_status(
  p_order_id UUID,
  p_new_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_result JSON;
BEGIN
  -- Obtener el ID del usuario autenticado
  v_user_id := auth.uid();
  
  -- Verificar que el usuario existe
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no autenticado'
    );
  END IF;
  
  -- Verificar que el usuario es administrador
  SELECT role INTO v_user_role
  FROM profiles 
  WHERE id = v_user_id;
  
  IF v_user_role IS NULL OR v_user_role != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Solo los administradores pueden cambiar el estado de las órdenes'
    );
  END IF;
  
  -- Verificar que la orden existe
  IF NOT EXISTS (SELECT 1 FROM service_orders WHERE id = p_order_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Orden no encontrada'
    );
  END IF;
  
  -- Actualizar el estado de la orden
  UPDATE service_orders 
  SET 
    status = p_new_status,
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Verificar que se actualizó correctamente
  IF FOUND THEN
    -- Crear evento de tracking
    INSERT INTO tracking_events (
      service_order_id,
      event_type,
      description,
      created_at
    ) VALUES (
      p_order_id,
      p_new_status,
      'Estado cambiado por administrador a: ' || p_new_status,
      NOW()
    );
    
    RETURN json_build_object(
      'success', true,
      'message', 'Estado actualizado correctamente',
      'order_id', p_order_id,
      'new_status', p_new_status,
      'updated_at', NOW()
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'No se pudo actualizar la orden'
    );
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 2. CONCEDER PERMISOS PARA EJECUTAR LA FUNCIÓN
-- =====================================================
GRANT EXECUTE ON FUNCTION admin_update_order_status(UUID, TEXT) TO authenticated;

-- 3. CREAR FUNCIÓN RPC PARA OBTENER ESTADO ACTUAL
-- =====================================================
CREATE OR REPLACE FUNCTION get_order_status(p_order_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_order_data JSON;
BEGIN
  -- Obtener el ID del usuario autenticado
  v_user_id := auth.uid();
  
  -- Verificar que el usuario existe
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no autenticado'
    );
  END IF;
  
  -- Verificar que el usuario es administrador o el propietario de la orden
  SELECT role INTO v_user_role
  FROM profiles 
  WHERE id = v_user_id;
  
  -- Si es admin, puede ver cualquier orden
  -- Si no es admin, solo puede ver sus propias órdenes
  IF v_user_role = 'admin' THEN
    SELECT json_build_object(
      'id', id,
      'status', status,
      'customer_id', customer_id,
      'created_at', created_at,
      'updated_at', updated_at
    ) INTO v_order_data
    FROM service_orders 
    WHERE id = p_order_id;
  ELSE
    SELECT json_build_object(
      'id', id,
      'status', status,
      'customer_id', customer_id,
      'created_at', created_at,
      'updated_at', updated_at
    ) INTO v_order_data
    FROM service_orders 
    WHERE id = p_order_id AND customer_id = v_user_id;
  END IF;
  
  IF v_order_data IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Orden no encontrada o acceso denegado'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'order', v_order_data
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 4. CONCEDER PERMISOS PARA LA FUNCIÓN DE LECTURA
-- =====================================================
GRANT EXECUTE ON FUNCTION get_order_status(UUID) TO authenticated;

-- 5. VERIFICAR QUE LAS FUNCIONES SE CREARON CORRECTAMENTE
-- =====================================================
SELECT 
  proname as function_name,
  proargnames as parameters,
  prorettype::regtype as return_type
FROM pg_proc 
WHERE proname IN ('admin_update_order_status', 'get_order_status')
ORDER BY proname;

-- 6. PROBAR LAS FUNCIONES (EJECUTAR COMO ADMIN)
-- =====================================================
-- Para probar la función de actualización:
-- SELECT admin_update_order_status('uuid-de-la-orden', 'COLLECTED');

-- Para probar la función de lectura:
-- SELECT get_order_status('uuid-de-la-orden');

-- 7. INSTRUCCIONES DE USO
-- =====================================================
/*
INSTRUCCIONES PARA USAR ESTAS FUNCIONES:

1. En lugar de hacer UPDATE directo en service_orders, usar:
   SELECT admin_update_order_status('uuid-orden', 'nuevo-estado');

2. Para verificar el estado actual:
   SELECT get_order_status('uuid-orden');

3. Estas funciones evitan problemas de RLS porque usan SECURITY DEFINER

4. Solo los administradores pueden cambiar el estado

5. Se crea automáticamente un evento de tracking

VENTAJAS:
- Evita problemas de políticas RLS
- Más seguro y controlado
- Registra automáticamente los cambios
- Validaciones integradas
*/
