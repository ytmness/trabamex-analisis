import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/customSupabaseClient.js';
import { getRoleInfo } from '../lib/roleConfig.js';
import RoleService from '../lib/roleService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para crear perfil en la base de datos si no existe
  const ensureProfileExists = async (user) => {
    try {
      console.log('🔍 Verificando/creando perfil para usuario:', user.id);
      
      // Verificar si ya existe un perfil
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error verificando perfil existente:', profileError);
        throw profileError;
      }

      // Si no existe perfil, crearlo
      if (!existingProfile) {
        console.log('📝 Creando nuevo perfil para usuario:', user.id);
        
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
        
        // Crear perfil en la tabla profiles
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: fullName,
            email: user.email,
            role: 'user' // Rol por defecto
          });

        if (insertProfileError) {
          console.error('❌ Error creando perfil:', insertProfileError);
          throw insertProfileError;
        }

        // Crear rol por defecto en user_roles
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'user',
            assigned_by: user.id, // Se auto-asigna el rol
            is_active: true
          });

        if (insertRoleError) {
          console.error('❌ Error creando rol por defecto:', insertRoleError);
          // No lanzamos error aquí porque el perfil ya se creó
        }

        console.log('✅ Perfil y rol creados exitosamente');
      } else {
        console.log('✅ Perfil ya existe para usuario:', user.id);
      }
    } catch (error) {
      console.error('❌ Error en ensureProfileExists:', error);
      // No lanzamos el error para no romper el flujo de login
    }
  };

  // Función para crear perfil con rol desde la base de datos
  const createProfileWithRole = async (user) => {
    try {
      console.log('🔍 Creando perfil para usuario:', user.id);
      
      // Asegurar que el perfil existe en la base de datos
      await ensureProfileExists(user);
      
      // Obtener rol desde la base de datos
      const role = await RoleService.getUserRole(user.id);
      console.log('🔍 Rol obtenido de la base de datos:', role);
      
      const roleInfo = getRoleInfo(role);
      
      // Obtener nombre completo del perfil o metadata
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
      
      const userProfile = {
        id: user.id,
        full_name: fullName,
        role: role,
        email: user.email,
        roleInfo: roleInfo
      };
      
      console.log('🔍 Perfil creado exitosamente:', userProfile);
      return userProfile;
    } catch (error) {
      console.error('❌ Error obteniendo rol del usuario:', error);
      
      // Fallback al rol por defecto
      const fallbackProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
        role: 'user',
        email: user.email,
        roleInfo: getRoleInfo('user')
      };
      
      console.log('⚠️ Usando perfil por defecto:', fallbackProfile);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    // Obtener sesión inicial
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const userProfile = await createProfileWithRole(session.user);
          setProfile(userProfile);
          console.log('🔐 Usuario autenticado:', userProfile);
          console.log('🔐 Rol del perfil:', userProfile?.role);
        }
      } catch (error) {
        console.error('Error obteniendo sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Cambio de estado de autenticación:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          const userProfile = await createProfileWithRole(session.user);
          setProfile(userProfile);
          console.log('Perfil creado:', userProfile);
        } else {
          setUser(null);
          setProfile(null);
          console.log('Usuario desconectado');
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      console.log('Intentando iniciar sesión con:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Login exitoso para:', email);
      return { data, error: null };
    } catch (error) {
      console.error('Error en sign in:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Cerrando sesión...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error en sign out:', error);
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      console.log('📝 Intentando registrar usuario:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        console.error('❌ Error en registro:', error);
        throw error;
      }

      console.log('✅ Registro exitoso para:', email);
      console.log('📧 Usuario creado, se requiere confirmación de email');
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error en signUp:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
