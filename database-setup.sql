-- =====================================================
-- CONFIGURACIÓN DE LA BASE DE DATOS MIR
-- =====================================================

-- 1. CREAR BUCKET DE STORAGE PARA ARCHIVOS
-- Ejecutar en Supabase Dashboard > Storage > Create new bucket
-- Nombre: uploads
-- Public: false (privado)
-- File size limit: 10MB
-- Allowed MIME types: image/*

-- 2. POLÍTICAS RLS PARA STORAGE
-- Política para permitir subida de archivos por usuarios autenticados
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir lectura de archivos propios
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir eliminación de archivos propios
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. FUNCIÓN RPC PARA CREAR ÓRDENES DE SERVICIO (CLIENTES)
CREATE OR REPLACE FUNCTION create_service_order(
  p_residue_type TEXT,
  p_provider TEXT,
  p_quantity DECIMAL,
  p_unit TEXT,
  p_origin TEXT,
  p_scheduled_date DATE,
  p_packaging TEXT,
  p_notes TEXT,
  p_waste_keys TEXT[],
  p_evidence_files TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_user_id UUID;
BEGIN
  -- Obtener el ID del usuario autenticado
  v_user_id := auth.uid();
  
  -- Verificar que el usuario existe y tiene rol 'user'
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_user_id AND role = 'user'
  ) THEN
    RAISE EXCEPTION 'Usuario no autorizado para crear órdenes';
  END IF;
  
  -- Crear la orden de servicio
  INSERT INTO service_orders (
    customer_id,
    residue_type,
    provider,
    quantity,
    unit,
    origin,
    scheduled_date,
    packaging,
    notes,
    waste_keys,
    evidence_files,
    status,
    created_at
  ) VALUES (
    v_user_id,
    p_residue_type,
    p_provider,
    p_quantity,
    p_unit,
    p_origin,
    p_scheduled_date,
    p_packaging,
    p_notes,
    p_waste_keys,
    p_evidence_files,
    'CREATED',
    NOW()
  ) RETURNING id INTO v_order_id;
  
  -- Crear evento de tracking automáticamente
  INSERT INTO tracking_events (
    service_order_id,
    event_type,
    description,
    created_at
  ) VALUES (
    v_order_id,
    'CREATED',
    'Solicitud de recolección creada por el cliente',
    NOW()
  );
  
  RETURN v_order_id;
END;
$$;

-- 4. POLÍTICAS RLS PARA SERVICE_ORDERS
-- Permitir que los usuarios vean solo sus propias órdenes
CREATE POLICY "Users can view own orders" ON service_orders
FOR SELECT USING (
  customer_id = auth.uid()
);

-- Permitir que los usuarios creen órdenes (usando la función RPC)
CREATE POLICY "Users can create orders" ON service_orders
FOR INSERT WITH CHECK (
  customer_id = auth.uid()
);

-- Permitir que los usuarios actualicen solo sus órdenes en estado CREATED
CREATE POLICY "Users can update own orders" ON service_orders
FOR UPDATE USING (
  customer_id = auth.uid() AND status = 'CREATED'
);

-- Permitir que admins vean todas las órdenes
CREATE POLICY "Admins can view all orders" ON service_orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Permitir que admins actualicen todas las órdenes
CREATE POLICY "Admins can update all orders" ON service_orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. POLÍTICAS RLS PARA TRACKING_EVENTS
-- Permitir que los usuarios vean eventos de sus órdenes
CREATE POLICY "Users can view own tracking events" ON tracking_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM service_orders 
    WHERE id = tracking_events.service_order_id 
    AND customer_id = auth.uid()
  )
);

-- Permitir que los usuarios creen eventos para sus órdenes
CREATE POLICY "Users can create tracking events" ON tracking_events
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM service_orders 
    WHERE id = tracking_events.service_order_id 
    AND customer_id = auth.uid()
  )
);

-- Permitir que admins vean todos los eventos
CREATE POLICY "Admins can view all tracking events" ON tracking_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Permitir que admins creen eventos para cualquier orden
CREATE POLICY "Admins can create tracking events" ON tracking_events
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. POLÍTICAS RLS PARA PROFILES
-- Permitir que los usuarios vean solo su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (
  id = auth.uid()
);

-- Permitir que los usuarios actualicen solo su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (
  id = auth.uid()
);

-- Permitir que admins vean todos los perfiles
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Permitir que admins actualicen todos los perfiles
CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 7. POLÍTICAS RLS PARA ROUTES
-- Permitir que operadores vean solo sus rutas asignadas
CREATE POLICY "Operators can view assigned routes" ON routes
FOR SELECT USING (
  operator_id = auth.uid()
);

-- Permitir que admins vean todas las rutas
CREATE POLICY "Admins can view all routes" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Permitir que admins creen y actualicen rutas
CREATE POLICY "Admins can manage routes" ON routes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 8. POLÍTICAS RLS PARA ROUTE_STOPS
-- Permitir que operadores vean paradas de sus rutas
CREATE POLICY "Operators can view route stops" ON route_stops
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM routes 
    WHERE id = route_stops.route_id 
    AND operator_id = auth.uid()
  )
);

-- Permitir que admins gestionen paradas
CREATE POLICY "Admins can manage route stops" ON route_stops
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 9. POLÍTICAS RLS PARA TREATMENT_BATCHES
-- Permitir que admins gestionen lotes de tratamiento
CREATE POLICY "Admins can manage treatment batches" ON treatment_batches
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 10. POLÍTICAS RLS PARA PLANS
-- Permitir que todos vean los planes (para la página de planes)
CREATE POLICY "Everyone can view plans" ON plans
FOR SELECT USING (true);

-- Permitir que solo admins gestionen planes
CREATE POLICY "Admins can manage plans" ON plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 11. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- 12. TRIGGER PARA ACTUALIZAR ESTADO DE ÓRDENES AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION update_order_status_from_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Actualizar el estado de la orden basado en el último evento
  UPDATE service_orders 
  SET status = NEW.event_type
  WHERE id = NEW.service_order_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_order_status
  AFTER INSERT ON tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION update_order_status_from_tracking();

-- 13. FUNCIÓN PARA OBTENER USUARIOS CON PERFILES POR ROL
CREATE OR REPLACE FUNCTION get_users_with_profiles_by_role(p_role TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario es admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.role,
    p.created_at
  FROM profiles p
  WHERE p.role = p_role
  ORDER BY p.created_at DESC;
END;
$$;

-- 14. FUNCIÓN PARA CREAR ÓRDENES DESDE ADMIN
CREATE OR REPLACE FUNCTION admin_create_order(p_customer UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  -- Verificar que el usuario es admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores';
  END IF;
  
  -- Verificar que el cliente existe
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_customer AND role = 'user'
  ) THEN
    RAISE EXCEPTION 'Cliente no válido';
  END IF;
  
  -- Crear la orden
  INSERT INTO service_orders (
    customer_id,
    status,
    created_at
  ) VALUES (
    p_customer,
    'CREATED',
    NOW()
  ) RETURNING id INTO v_order_id;
  
  -- Crear evento de tracking
  INSERT INTO tracking_events (
    service_order_id,
    event_type,
    description,
    created_at
  ) VALUES (
    v_order_id,
    'CREATED',
    'Orden creada por administrador',
    NOW()
  );
  
  RETURN v_order_id;
END;
$$;

-- 15. FUNCIÓN PARA CAMBIAR ROL DE USUARIO
CREATE OR REPLACE FUNCTION set_user_role(p_user_id UUID, p_new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario es admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores';
  END IF;
  
  -- Verificar que el rol es válido
  IF p_new_role NOT IN ('user', 'operator', 'admin') THEN
    RAISE EXCEPTION 'Rol no válido';
  END IF;
  
  -- Actualizar el rol
  UPDATE profiles 
  SET role = p_new_role
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =====================================================

/*
1. EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR

2. CREAR BUCKET DE STORAGE MANUALMENTE:
   - Ir a Storage en Supabase Dashboard
   - Crear bucket "uploads"
   - Configurar como privado
   - Límite de archivo: 10MB
   - Tipos MIME permitidos: image/*

3. VERIFICAR QUE LAS TABLAS EXISTAN:
   - service_orders
   - tracking_events
   - profiles
   - routes
   - route_stops
   - treatment_batches
   - plans

4. PROBAR LAS FUNCIONES:
   - create_service_order (para clientes)
   - admin_create_order (para admins)
   - get_users_with_profiles_by_role
   - set_user_role

5. VERIFICAR RLS:
   - Los usuarios solo ven sus propias órdenes
   - Los admins ven todo
   - Los operadores ven solo sus rutas asignadas
