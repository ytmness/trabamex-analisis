-- Script para configurar la base de datos MIR
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si existe la tabla service_orders y crearla si no existe
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PLANNED' CHECK (status IN (
        'PLANNED', 'EN_ROUTE_TO_PICKUP', 'ON_SITE_PICKUP', 'COLLECTED',
        'EN_ROUTE_TO_DEPOT', 'AT_DEPOT', 'WEIGHED_VERIFIED',
        'EN_ROUTE_TO_TREATMENT', 'IN_TREATMENT', 'TREATED', 'CERTIFIED', 'CANCELLED'
    )),
    expected_weight_kg DECIMAL(10,2),
    actual_weight_kg DECIMAL(10,2),
    waste_type TEXT,
    pickup_address TEXT,
    pickup_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Verificar si existe la tabla profiles y crearla si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'operator', 'user')),
    email TEXT,
    phone TEXT,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar si existe la tabla operators y crearla si no existe
CREATE TABLE IF NOT EXISTS public.operators (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    license_number TEXT,
    vehicle_type TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Verificar si existe la tabla routes y crearla si no existe
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id UUID REFERENCES public.operators(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status TEXT DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    vehicle_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Verificar si existe la tabla route_stops y crearla si no existe
CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE,
    planned_time TIMESTAMP WITH TIME ZONE,
    actual_time TIMESTAMP WITH TIME ZONE,
    stop_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Verificar si existe la tabla tracking_events y crearla si no existe
CREATE TABLE IF NOT EXISTS public.tracking_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE,
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    operator_id UUID REFERENCES public.operators(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_service_orders_customer_id ON public.service_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON public.service_orders(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_routes_operator_id ON public.routes(operator_id);
CREATE INDEX IF NOT EXISTS idx_routes_date ON public.routes(date);
CREATE INDEX IF NOT EXISTS idx_tracking_events_service_order_id ON public.tracking_events(service_order_id);

-- 8. Habilitar RLS (Row Level Security)
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas RLS para service_orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.service_orders;
CREATE POLICY "Users can view their own orders" ON public.service_orders
    FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON public.service_orders;
CREATE POLICY "Admins can view all orders" ON public.service_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 10. Crear políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 11. Crear políticas RLS para operators
DROP POLICY IF EXISTS "Admins can manage operators" ON public.operators;
CREATE POLICY "Admins can manage operators" ON public.operators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 12. Crear políticas RLS para routes
DROP POLICY IF EXISTS "Operators can view their routes" ON public.routes;
CREATE POLICY "Operators can view their routes" ON public.routes
    FOR SELECT USING (auth.uid() = operator_id);

DROP POLICY IF EXISTS "Admins can manage all routes" ON public.routes;
CREATE POLICY "Admins can manage all routes" ON public.routes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 13. Crear políticas RLS para tracking_events
DROP POLICY IF EXISTS "Users can view their order events" ON public.tracking_events;
CREATE POLICY "Users can view their order events" ON public.tracking_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.service_orders 
            WHERE id = service_order_id AND customer_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Operators can create events" ON public.tracking_events;
CREATE POLICY "Operators can create events" ON public.tracking_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'operator'
        )
    );

-- 14. Insertar datos de ejemplo si las tablas están vacías
INSERT INTO public.profiles (id, full_name, role, email)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(au.raw_user_meta_data->>'role', 'user'),
    au.email
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 15. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 16. Crear triggers para updated_at
DROP TRIGGER IF EXISTS update_service_orders_updated_at ON public.service_orders;
CREATE TRIGGER update_service_orders_updated_at
    BEFORE UPDATE ON public.service_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_operators_updated_at ON public.operators;
CREATE TRIGGER update_operators_updated_at
    BEFORE UPDATE ON public.operators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;
CREATE TRIGGER update_routes_updated_at
    BEFORE UPDATE ON public.routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 17. Verificar la estructura creada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('service_orders', 'profiles', 'operators', 'routes', 'route_stops', 'tracking_events')
ORDER BY table_name, ordinal_position;
