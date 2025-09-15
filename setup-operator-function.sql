-- =====================================================
-- CONFIGURAR FUNCIÓN RPC PARA CREAR OPERADORES
-- =====================================================

-- Ejecuta esto en tu SQL Editor de Supabase

-- 1. Crear la función RPC
CREATE OR REPLACE FUNCTION create_operator_profile(
    p_email TEXT,
    p_full_name TEXT,
    p_phone TEXT,
    p_address TEXT,
    p_license_number TEXT,
    p_vehicle_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Verificar que el usuario actual sea admin
    IF NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Solo los administradores pueden crear operadores';
    END IF;

    -- Buscar el usuario en auth.users por email
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = p_email;

    -- Si no existe el usuario, retornar error
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuario no encontrado en Supabase Auth. Crea primero el usuario en Authentication → Users.',
            'message', 'Crea el usuario en Supabase Auth antes de continuar'
        );
    END IF;

    -- Verificar que no exista ya un rol para este usuario
    IF EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = v_user_id
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El usuario ya tiene un rol asignado',
            'message', 'Este usuario ya existe en el sistema'
        );
    END IF;

    -- Insertar rol en user_roles
    INSERT INTO user_roles (user_id, role, is_active) 
    VALUES (v_user_id, 'operator', true);

    -- Insertar en operators
    INSERT INTO operators (
        user_id, 
        full_name, 
        email, 
        phone, 
        address, 
        license_number, 
        vehicle_type, 
        is_active
    ) VALUES (
        v_user_id,
        p_full_name,
        p_email,
        p_phone,
        p_address,
        p_license_number,
        p_vehicle_type,
        true
    );

    -- Retornar resultado exitoso
    RETURN json_build_object(
        'success', true,
        'user_id', v_user_id,
        'message', 'Perfil de operador creado exitosamente'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Error al crear perfil de operador'
        );
END;
$$;

-- 2. Conceder permisos
GRANT EXECUTE ON FUNCTION create_operator_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 3. Crear políticas RLS si no existen
DROP POLICY IF EXISTS "Admins pueden insertar roles" ON user_roles;
CREATE POLICY "Admins pueden insertar roles" ON user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Admins pueden insertar operadores" ON operators;
CREATE POLICY "Admins pueden insertar operadores" ON operators
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- 4. Verificar que se creó correctamente
SELECT 
    proname as function_name,
    proargnames as parameters
FROM pg_proc 
WHERE proname = 'create_operator_profile';
