-- =====================================================
-- SCRIPT PARA VERIFICAR Y CORREGIR USER_ROLES
-- =====================================================
-- Este script verifica la configuración de la tabla user_roles
-- y corrige problemas comunes que pueden causar errores de redirección

-- 1. VERIFICAR SI LA TABLA EXISTE
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE NOTICE '❌ La tabla user_roles NO existe. Creándola...';
        
        CREATE TABLE user_roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator', 'user')),
            assigned_by UUID REFERENCES auth.users(id),
            assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_active BOOLEAN DEFAULT true,
            UNIQUE(user_id, role)
        );
        
        -- Crear índices
        CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
        CREATE INDEX idx_user_roles_role ON user_roles(role);
        CREATE INDEX idx_user_roles_active ON user_roles(is_active);
        
        -- Habilitar RLS
        ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE '✅ Tabla user_roles creada exitosamente';
    ELSE
        RAISE NOTICE '✅ La tabla user_roles ya existe';
    END IF;
END $$;

-- 2. VERIFICAR POLÍTICAS RLS
-- =====================================================
DO $$
BEGIN
    -- Verificar si existe la política de lectura
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' 
        AND policyname = 'Admins can view all user roles'
    ) THEN
        RAISE NOTICE '❌ Política de lectura no existe. Creándola...';
        
        CREATE POLICY "Admins can view all user roles" ON user_roles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM user_roles ur 
                    WHERE ur.user_id = auth.uid() 
                    AND ur.role = 'admin' 
                    AND ur.is_active = true
                )
            );
        
        RAISE NOTICE '✅ Política de lectura creada';
    ELSE
        RAISE NOTICE '✅ Política de lectura ya existe';
    END IF;
    
    -- Verificar si existe la política de gestión
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' 
        AND policyname = 'Admins can manage user roles'
    ) THEN
        RAISE NOTICE '❌ Política de gestión no existe. Creándola...';
        
        CREATE POLICY "Admins can manage user roles" ON user_roles
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM user_roles ur 
                    WHERE ur.user_id = auth.uid() 
                    AND ur.role = 'admin' 
                    AND ur.is_active = true
                )
            );
        
        RAISE NOTICE '✅ Política de gestión creada';
    ELSE
        RAISE NOTICE '✅ Política de gestión ya existe';
    END IF;
END $$;

-- 3. VERIFICAR USUARIOS SIN ROL ASIGNADO
-- =====================================================
DO $$
DECLARE
    user_count INTEGER;
    role_count INTEGER;
BEGIN
    -- Contar usuarios autenticados
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    -- Contar usuarios con roles asignados
    SELECT COUNT(DISTINCT user_id) INTO role_count FROM user_roles WHERE is_active = true;
    
    RAISE NOTICE '📊 Usuarios autenticados: %', user_count;
    RAISE NOTICE '📊 Usuarios con roles: %', role_count;
    
    IF user_count > role_count THEN
        RAISE NOTICE '⚠️ Hay % usuarios sin rol asignado', (user_count - role_count);
        
        -- Asignar rol 'user' por defecto a usuarios sin rol
        INSERT INTO user_roles (user_id, role, assigned_by, is_active)
        SELECT 
            u.id, 
            'user', 
            u.id, 
            true
        FROM auth.users u
        WHERE NOT EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = u.id AND ur.is_active = true
        )
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE '✅ Roles por defecto asignados a usuarios sin rol';
    ELSE
        RAISE NOTICE '✅ Todos los usuarios tienen roles asignados';
    END IF;
END $$;

-- 4. VERIFICAR INTEGRIDAD DE DATOS
-- =====================================================
DO $$
DECLARE
    invalid_role_count INTEGER;
    inactive_role_count INTEGER;
BEGIN
    -- Verificar roles inválidos
    SELECT COUNT(*) INTO invalid_role_count 
    FROM user_roles 
    WHERE role NOT IN ('admin', 'operator', 'user');
    
    IF invalid_role_count > 0 THEN
        RAISE NOTICE '❌ Encontrados % roles inválidos', invalid_role_count;
        
        -- Corregir roles inválidos a 'user'
        UPDATE user_roles 
        SET role = 'user' 
        WHERE role NOT IN ('admin', 'operator', 'user');
        
        RAISE NOTICE '✅ Roles inválidos corregidos a "user"';
    ELSE
        RAISE NOTICE '✅ Todos los roles son válidos';
    END IF;
    
    -- Verificar roles inactivos
    SELECT COUNT(*) INTO inactive_role_count 
    FROM user_roles 
    WHERE is_active = false;
    
    IF inactive_role_count > 0 THEN
        RAISE NOTICE '⚠️ Encontrados % roles inactivos', inactive_role_count;
    ELSE
        RAISE NOTICE '✅ Todos los roles están activos';
    END IF;
END $$;

-- 5. MOSTRAR RESUMEN FINAL
-- =====================================================
SELECT 
    'RESUMEN DE VERIFICACIÓN' as info,
    COUNT(*) as total_roles,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'operator' THEN 1 END) as operator_count,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_roles
FROM user_roles;
