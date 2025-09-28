// src/contexts/SupabaseAuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import supabase from '../lib/customSupabaseClient'

const AuthContext = createContext(null)

export const SupabaseAuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null) // rol actual (user_roles)
  const [profile, setProfile] = useState(null) // perfil del usuario

  // ====== REGISTRO (email/password con verificación) ======
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName } // metadata temporal
      }
    })
    return { data, error }
  }

  // ====== LOGIN / LOGOUT ======
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // ====== PERFIL + ROL (asegurar en primer login) ======
  const ensureProfileExists = async (supaUser) => {
    if (!supaUser) return
    const uid = supaUser.id

    // 1) Verificar si ya existe profile y obtenerlo completo
    const { data: existingProfile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle()

    if (pErr) {
      console.error('Error verificando profile:', pErr)
      return
    }

    // 2) Si no existe, crearlo con datos básicos
    if (!existingProfile) {
      const fullName =
        (supaUser.user_metadata && supaUser.user_metadata.full_name) ||
        (supaUser.email ? supaUser.email.split('@')[0] : 'Sin nombre')

      const { data: newProfile, error: insErr } = await supabase.from('profiles').insert({
        id: uid, // MUY IMPORTANTE: igual a auth.users.id
        full_name: fullName,
        email: supaUser.email,
        role: 'user', // opcional si mantienes esta columna
      }).select().single()

      if (insErr) {
        console.error('Error insertando profile:', insErr)
        return
      }
      setProfile(newProfile)
    } else {
      setProfile(existingProfile)
    }

    // 3) Asegurar rol en user_roles (si no hay activo, setear user)
    const { data: activeRole, error: rErr } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', uid)
      .eq('is_active', true)
      .maybeSingle()

    if (rErr) {
      console.error('Error verificando user_roles:', rErr)
      return
    }

    if (!activeRole) {
      const { error: setRoleErr } = await supabase.from('user_roles').insert({
        user_id: uid,
        role: 'user',
        is_active: true,
      })
      if (setRoleErr) console.error('Error creando rol por defecto:', setRoleErr)
      else setRole('user')
    } else {
      setRole(activeRole.role)
    }
  }

  // ====== Cargar sesión inicial y suscribirse a cambios ======
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session || null)
      setUser(data.session?.user || null)
      if (data.session?.user) {
        await ensureProfileExists(data.session.user)
      }
      setLoading(false)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user || null)

      if (event === 'SIGNED_IN' && currentSession?.user) {
        await ensureProfileExists(currentSession.user)
      }
      if (event === 'SIGNED_OUT') {
        setRole(null)
        setProfile(null)
      }
    })

    return () => sub.subscription?.unsubscribe()
  }, [])

  const value = {
    session,
    user,
    role, // rol activo desde user_roles
    profile, // perfil completo del usuario
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

// Exportar también como AuthProvider para compatibilidad
export const AuthProvider = SupabaseAuthProvider
