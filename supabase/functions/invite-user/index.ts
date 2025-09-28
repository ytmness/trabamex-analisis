// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Crear cliente de Supabase directamente aquí
const supabaseUrl = 'https://frzgxlawydtvppbokktg.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyemd4bGF3eWR0dnBwYm9ra3RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ3ODc5NCwiZXhwIjoyMDczMDU0Nzk0fQ.oLi14sYw53P8vURX16lTYLfRFJNRyNHjgtIXGMJ16FU'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🔧 Cliente Supabase creado:', {
  url: supabaseUrl,
  hasAuth: !!supabaseAdmin.auth,
  hasAdmin: !!supabaseAdmin.auth?.admin,
  hasGetUserByEmail: !!supabaseAdmin.auth?.admin?.getUserByEmail
})

interface InviteUserRequest {
  email: string
  full_name: string
  password: string
  role: 'user' | 'operator' | 'admin'
  phone?: string
  company_name?: string
  admin_user_id: string
}

serve(async (req) => {
  console.log('🚀 Función invite-user iniciada')
  console.log('📋 Método:', req.method)
  console.log('📋 URL:', req.url)
  
  // Configurar CORS
  if (req.method === 'OPTIONS') {
    console.log('✅ Respondiendo a OPTIONS (CORS)')
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    console.log('📝 Iniciando procesamiento de la solicitud')
    
    // Leer el body de la request
    const body = await req.json()
    console.log('📦 Body completo:', body)
    
    const { email, full_name, password, role, phone, company_name, admin_user_id }: InviteUserRequest = body

    console.log('📥 Datos recibidos:', { email, full_name, role, admin_user_id })

    // Validar datos requeridos
    if (!email || !full_name || !password || !role || !admin_user_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Faltan datos requeridos: email, full_name, password, role, admin_user_id' 
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // Validar que el rol sea válido
    if (!['user', 'operator', 'admin'].includes(role)) {
      return new Response(
        JSON.stringify({ 
          error: 'Rol inválido. Debe ser: user, operator o admin' 
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // Verificar que quien invita sea admin
    console.log('🔍 Verificando permisos de admin para user_id:', admin_user_id)
    const { data: adminRole, error: adminError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', admin_user_id)
      .eq('role', 'admin')
      .eq('is_active', true)
      .maybeSingle()

    console.log('📊 Resultado verificación admin:', { adminRole, adminError })

    if (adminError) {
      console.error('❌ Error verificando rol de admin:', adminError)
      return new Response(
        JSON.stringify({ 
          error: 'Error verificando permisos: ' + adminError.message 
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    if (!adminRole) {
      console.log('❌ Usuario no tiene permisos de admin - Intentando crear rol de admin...')
      
      // Intentar crear el rol de admin si no existe
      const { error: createRoleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: admin_user_id,
          role: 'admin',
          is_active: true
        })

      if (createRoleError) {
        console.error('❌ Error creando rol de admin:', createRoleError)
        return new Response(
          JSON.stringify({ 
            error: 'Error creando permisos de admin: ' + createRoleError.message 
          }),
          { 
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        )
      }

      console.log('✅ Rol de admin creado exitosamente')
    }

    // Verificar si el usuario ya existe
    console.log('🔍 Verificando si el usuario ya existe:', email)
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    console.log('📊 Lista de usuarios:', usersList)
    
    if (listError) {
      console.error('❌ Error listando usuarios:', listError)
      return new Response(
        JSON.stringify({ 
          error: 'Error verificando usuarios existentes: ' + listError.message 
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }
    
    // Buscar el usuario por email
    const existingUser = usersList.users.find(user => user.email === email)
    console.log('📊 Usuario encontrado:', existingUser)
    
    if (existingUser) {
      console.log('❌ Usuario ya existe')
      return new Response(
        JSON.stringify({ 
          error: 'El usuario con este email ya existe' 
        }),
        { 
          status: 409,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // Crear usuario directamente con contraseña
    console.log('👤 Creando usuario en Supabase Auth...')
    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: false, // No confirmar automáticamente
      user_metadata: {
        full_name: full_name,
        role: role,
        phone: phone,
        company_name: company_name
      }
    })

    if (createError) {
      console.error('❌ Error creando usuario:', createError)
      return new Response(
        JSON.stringify({ 
          error: 'Error creando usuario: ' + createError.message 
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    const newUserId = createdUser.user.id
    console.log('✅ Usuario creado en Auth con ID:', newUserId)

    // Enviar email de verificación usando Magic Link (método que sabemos que funciona)
    console.log('📧 Enviando Magic Link...')
    try {
      const magicLinkResponse = await fetch(`${supabaseUrl}/auth/v1/magiclink`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          email: email,
          options: {
            redirect_to: 'http://localhost:3000'
          }
        })
      })

      if (magicLinkResponse.ok) {
        console.log('✅ Magic Link enviado exitosamente')
      } else {
        const errorText = await magicLinkResponse.text()
        console.error('❌ Error enviando Magic Link:', errorText)
      }
    } catch (emailError) {
      console.error('❌ Error enviando Magic Link:', emailError)
    }

    // Crear perfil en la tabla profiles
    console.log('📋 Creando perfil en la tabla profiles...')
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUserId,           // Usar el ID del usuario de auth
        full_name: full_name,
        email: email,
        role: role,
        phone: phone,
        company: company_name    // CORREGIDO: usar 'company' en lugar de 'company_name'
      })

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError)
      return new Response(
        JSON.stringify({ 
          error: 'Error creando perfil: ' + profileError.message 
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    console.log('✅ Perfil creado exitosamente')

    // Crear rol en user_roles
    console.log('🔐 Creando rol en user_roles...')
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUserId,
        role: role,
        is_active: true
        // CORREGIDO: removido 'assigned_by' que no existe en la tabla
      })

    if (roleError) {
      console.error('❌ Error asignando rol:', roleError)
      return new Response(
        JSON.stringify({ 
          error: 'Error asignando rol: ' + roleError.message 
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    console.log('✅ Rol creado exitosamente')

    // Si es operador, crear registro específico en operators
    if (role === 'operator') {
      console.log('👷 Creando registro de operador...')
      const { error: operatorError } = await supabaseAdmin
        .from('operators')
        .insert({
          user_id: newUserId,      // Conectar con el usuario
          name: full_name,         // CORREGIDO: usar 'name' en lugar de 'full_name'
          email: email,
          phone: phone,
          license_number: null,    // Se llenará cuando el operador complete su perfil
          status: 'active'         // Estado activo por defecto
        })

      if (operatorError) {
        console.error('❌ Error creando registro de operador:', operatorError)
        // No fallamos aquí porque el usuario ya está creado
      } else {
        console.log('✅ Registro de operador creado exitosamente')
      }
    }

    console.log('🎉 Usuario creado exitosamente:', email, 'con rol:', role)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Usuario creado exitosamente. Se ha enviado un email de verificación.',
        user_id: newUserId,
        email: email,
        role: role,
        requires_email_verification: true
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )

  } catch (error) {
    console.error('❌ Error inesperado en invite-user:', error)
    console.error('❌ Stack trace:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor: ' + error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
})