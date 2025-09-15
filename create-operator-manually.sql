-- =====================================================
-- INSTRUCCIONES PARA CREAR OPERADORES MANUALMENTE
-- =====================================================

-- PASO 1: Crear usuario en Supabase Auth
-- Ve a: https://supabase.com/dashboard/project/[TU-PROJECT-ID]
-- Authentication → Users → Add User
-- • Email: [EMAIL_DEL_OPERADOR]
-- • Password: [CONTRASEÑA_TEMPORAL]
-- • Marca "Auto-confirm email"

-- PASO 2: Obtener el USER_ID del usuario creado
-- En la tabla auth.users, copia el ID del usuario recién creado

-- PASO 3: Insertar en user_roles
INSERT INTO user_roles (user_id, role, is_active) 
VALUES (
    '[USER_ID_DEL_USUARIO]',  -- Reemplaza con el ID real
    'operator',                -- Rol del operador
    true                       -- Activo
);

-- PASO 4: Insertar en operators
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
    '[USER_ID_DEL_USUARIO]',  -- Reemplaza con el ID real
    '[NOMBRE_COMPLETO]',      -- Reemplaza con el nombre
    '[EMAIL]',                 -- Reemplaza con el email
    '[TELEFONO]',             -- Reemplaza con el teléfono
    '[DIRECCION]',            -- Reemplaza con la dirección
    '[NUMERO_LICENCIA]',      -- Reemplaza con el número de licencia
    '[TIPO_VEHICULO]',        -- 'camioneta', 'camion', 'pickup', 'moto'
    true                       -- Activo
);

-- PASO 5: Verificar que se creó correctamente
SELECT 
    u.email,
    ur.role,
    o.full_name,
    o.phone,
    o.is_active
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN operators o ON u.id = o.user_id
WHERE u.email = '[EMAIL]';

-- =====================================================
-- EJEMPLO COMPLETO:
-- =====================================================

-- Supongamos que queremos crear un operador llamado "Juan Pérez"
-- con email "juan.perez@trabamex.com"

-- PASO 1: Crear usuario en Supabase Auth (desde el dashboard)
-- Email: juan.perez@trabamex.com
-- Password: TempPass123!

-- PASO 2: Obtener USER_ID (ejemplo: a1b2c3d4-e5f6-7890-abcd-ef1234567890)

-- PASO 3: Insertar rol
INSERT INTO user_roles (user_id, role, is_active) 
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'operator',
    true
);

-- PASO 4: Insertar operador
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
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Juan Pérez',
    'juan.perez@trabamez.com',
    '(555) 123-4567',
    'Av. Principal 123, Ciudad',
    'ABC123456',
    'camioneta',
    true
);

-- PASO 5: Verificar
SELECT 
    u.email,
    ur.role,
    o.full_name,
    o.phone,
    o.is_active
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN operators o ON u.id = o.user_id
WHERE u.email = 'juan.perez@trabamex.com';
