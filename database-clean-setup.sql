-- =====================================================
-- CONFIGURACIÓN LIMPIA DE LA BASE DE DATOS TRABAMEX
-- =====================================================
-- Este archivo contiene SOLO las tablas necesarias
-- Fecha: $(Get-Date)
-- =====================================================

-- 1. TABLA DE ROLES DE USUARIO (NUEVA - SISTEMA AUTOMÁTICO)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator', 'user')),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin' 
      AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin' 
      AND ur.is_active = true
    )
  );

-- 2. TABLA DE CLIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'México',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE OPERADORES
-- =====================================================
CREATE TABLE IF NOT EXISTS operators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  license_number VARCHAR(100),
  vehicle_type VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE ÓRDENES DE SERVICIO
-- =====================================================
CREATE TABLE IF NOT EXISTS service_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES operators(id),
  status VARCHAR(50) DEFAULT 'PENDIENTE' CHECK (
    status IN (
      'PENDIENTE', 'EN_PROCESO', 'EN_RUTA', 'RECOLECTADO', 
      'EN_TRATAMIENTO', 'COMPLETADO', 'CANCELADO'
    )
  ),
  pickup_address TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME,
  expected_weight_kg DECIMAL(10,2),
  actual_weight_kg DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE RUTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES operators(id),
  route_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'PLANIFICADA' CHECK (
    status IN ('PLANIFICADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA')
  ),
  planned_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_distance_km DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA DE PARADAS DE RUTA
-- =====================================================
CREATE TABLE IF NOT EXISTS route_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  service_order_id UUID REFERENCES service_orders(id),
  stop_order INTEGER NOT NULL,
  estimated_arrival TIME,
  actual_arrival TIME,
  estimated_departure TIME,
  actual_departure TIME,
  status VARCHAR(50) DEFAULT 'PENDIENTE' CHECK (
    status IN ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA')
  ),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA DE INCIDENCIAS
-- =====================================================
CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES operators(id),
  incident_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  severity VARCHAR(20) DEFAULT 'BAJA' CHECK (
    severity IN ('BAJA', 'MEDIA', 'ALTA', 'CRÍTICA')
  ),
  status VARCHAR(50) DEFAULT 'REPORTADA' CHECK (
    status IN ('REPORTADA', 'EN_INVESTIGACION', 'RESUELTA', 'CERRADA')
  ),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLA DE PLANES DE SUSCRIPCIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2) NOT NULL,
  included_weight_kg DECIMAL(10,2) NOT NULL,
  pickup_frequency VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABLA DE CERTIFICADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status VARCHAR(50) DEFAULT 'ACTIVO' CHECK (
    status IN ('ACTIVO', 'EXPIRADO', 'REVOCADO')
  ),
  certificate_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABLA DE TRATAMIENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS treatments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  treatment_type VARCHAR(100),
  duration_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM user_roles 
    WHERE user_id = user_uuid 
    AND is_active = true 
    ORDER BY 
      CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'operator' THEN 2 
        WHEN 'user' THEN 3 
      END
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'admin' 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para asignar rol por defecto a nuevos usuarios
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role, assigned_by)
  VALUES (NEW.id, 'user', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_default_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar plan de suscripción por defecto
INSERT INTO subscription_plans (name, description, monthly_price, included_weight_kg, pickup_frequency)
VALUES (
  'Plan Básico',
  'Plan de recolección mensual con 20kg incluidos',
  299.99,
  20.0,
  'Mensual'
) ON CONFLICT DO NOTHING;

-- Insertar tratamientos básicos
INSERT INTO treatments (name, description, treatment_type, duration_hours)
VALUES 
  ('Reciclaje de Papel', 'Procesamiento de papel y cartón', 'Reciclaje', 24),
  ('Reciclaje de Plástico', 'Procesamiento de plásticos', 'Reciclaje', 48),
  ('Compostaje', 'Procesamiento de residuos orgánicos', 'Compostaje', 72)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================
COMMENT ON TABLE user_roles IS 'Tabla para gestionar roles de usuario en el sistema';
COMMENT ON TABLE clients IS 'Información de clientes del sistema';
COMMENT ON TABLE operators IS 'Operadores y conductores del sistema';
COMMENT ON TABLE service_orders IS 'Órdenes de servicio de recolección';
COMMENT ON TABLE routes IS 'Rutas de recolección';
COMMENT ON TABLE route_stops IS 'Paradas específicas en las rutas';
COMMENT ON TABLE incidents IS 'Incidentes reportados durante las operaciones';
COMMENT ON TABLE subscription_plans IS 'Planes de suscripción disponibles';
COMMENT ON TABLE certificates IS 'Certificados de tratamiento emitidos';
COMMENT ON TABLE treatments IS 'Tipos de tratamiento disponibles';

-- =====================================================
-- FIN DEL ARCHIVO
-- =====================================================
