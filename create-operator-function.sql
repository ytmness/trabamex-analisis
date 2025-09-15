-- =====================================================
-- FUNCIÓN RPC PARA CREAR OPERADORES DESDE EL ADMIN
-- =====================================================

-- Esta función permite crear operadores desde el frontend de forma segura

CREATE OR REPLACE FUNCTION create_operator(
    p_email TEXT,
    p_password TEXT,
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

    -- Crear usuario en auth.users usando la función de Supabase
    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at
    ) VALUES (
        p_email,
        crypt(p_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW()
    ) RETURNING id INTO v_user_id;

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
    v_result := json_build_object(
        'success', true,
        'user_id', v_user_id,
        'message', 'Operador creado exitosamente'
    );

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, hacer rollback y retornar error
        v_result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Error al crear operador'
        );
        RETURN v_result;
END;
$$;

-- =====================================================
-- CONCEDER PERMISOS
-- =====================================================

-- Permitir que usuarios autenticados ejecuten la función
GRANT EXECUTE ON FUNCTION create_operator(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- =====================================================
-- POLÍTICA RLS PARA LA FUNCIÓN
-- =====================================================

-- Solo los admins pueden ejecutar esta función
CREATE POLICY "Solo admins pueden crear operadores" ON user_roles
    FOR INSERT
    TO authenticated
    USING (
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

-- Desde el frontend, llamar así:
/*
const { data, error } = await supabase.rpc('create_operator', {
    p_email: 'operador@trabamex.com',
    p_password: 'TempPass123!',
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
