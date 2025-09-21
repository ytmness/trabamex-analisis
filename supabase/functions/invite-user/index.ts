import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabaseAdmin } from '../_shared/supabaseClient.ts'

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
  // Configurar CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { email, full_name, password, role, phone, company_name, admin_user_id }: InviteUserRequest = await req.json()

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
    const { data: adminRole, error: adminError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', admin_user_id)
      .eq('role', 'admin')
      .eq('is_active', true)
      .single()

    if (adminError || !adminRole) {
      return new Response(
        JSON.stringify({ 
          error: 'No tienes permisos para crear usuarios' 
        }),
        { 
          status: 403,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    
    if (existingUser.user) {
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

    // Crear usuario directamente con contraseña (requiere verificación de email)
    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: false, // Requiere verificación de email
      user_metadata: {
        full_name: full_name,
        role: role,
        phone: phone,
        company_name: company_name
      }
    })

    if (createError) {
      console.error('Error creando usuario:', createError)
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

    // Crear perfil en la tabla profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUserId,
        full_name: full_name,
        email: email,
        role: role,
        phone: phone,
        company_name: company_name
      })

    if (profileError) {
      console.error('Error creando perfil:', profileError)
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

    // Crear rol en user_roles
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUserId,
        role: role,
        assigned_by: admin_user_id,
        is_active: true
      })

    if (roleError) {
      console.error('Error asignando rol:', roleError)
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

    // Si es operador, crear registro específico en operators
    if (role === 'operator') {
      const { error: operatorError } = await supabaseAdmin
        .from('operators')
        .insert({
          user_id: newUserId,
          full_name: full_name,
          email: email,
          phone: phone,
          license_number: null, // Se llenará cuando el operador complete su perfil
          status: 'active'
        })

      if (operatorError) {
        console.error('Error creando registro de operador:', operatorError)
        // No fallamos aquí porque el usuario ya está creado
      }
    }

    console.log('✅ Usuario creado exitosamente:', email, 'con rol:', role)

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
    console.error('Error inesperado en invite-user:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor: ' + error.message 
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
