-- =====================================================
-- FUNCIÓN RPC CORREGIDA PARA CREAR OPERADORES
-- =====================================================

-- Esta función SOLO inserta en las tablas de negocio
-- El usuario se crea manualmente en Supabase Auth

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
    v_result JSON;
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
        -- En caso de error, retornar error
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Error al crear perfil de operador'
        );
END;
$$;

-- =====================================================
-- CONCEDER PERMISOS
-- =====================================================

-- Permitir que usuarios autenticados ejecuten la función
GRANT EXECUTE ON FUNCTION create_operator_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- =====================================================
-- POLÍTICAS RLS NECESARIAS
-- =====================================================

-- Permitir que admins inserten en user_roles
DROP POLICY IF EXISTS "Solo admins pueden crear operadores" ON user_roles;

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

-- Permitir que admins inserten en operators
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

-- =====================================================
-- USO DESDE EL FRONTEND
-- =====================================================

-- PASO 1: Crear usuario en Supabase Auth (desde el dashboard)
-- PASO 2: Llamar a esta función desde el frontend

/*
const { data, error } = await supabase.rpc('create_operator_profile', {
    p_email: 'operador@trabamex.com',
    p_full_name: 'Juan Pérez',
    p_phone: '(555) 123-4567',
    p_address: 'Av. Principal 123',
    p_license_number: 'ABC123456',
    p_vehicle_type: 'camioneta'
});

if (data.success) {
    console.log('Operador creado:', data.user_id);
} else {
    console.error('Error:', data.error);
}
*/
