import supabase from './customSupabaseClient.js';

// Verificar configuración de Supabase
console.log('🔧 Configuración de Supabase:', {
  url: 'https://frzgxlawydtvppbokktg.supabase.co',
  anonKey: '✅ Configurado'
});

export class RoleService {
  // Obtener el rol del usuario actual
  static async getUserRole(userId) {
    try {
      console.log('🔍 Buscando rol para usuario:', userId);
      
      if (!userId) {
        console.error('❌ userId es undefined o null');
        return 'user';
      }
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('role', { ascending: false }) // admin primero, luego operator, luego user
        .limit(1);

      console.log('📊 Respuesta de Supabase:', { data, error });

      if (error) {
        console.error('❌ Error obteniendo rol del usuario:', error);
        console.error('❌ Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return 'user'; // Rol por defecto
      }

      // Si no hay datos, el usuario no tiene rol asignado
      if (!data || data.length === 0) {
        console.log('⚠️ Usuario sin rol asignado en user_roles, usando rol por defecto: user');
        return 'user';
      }

      // Verificar que el rol sea válido
      const validRoles = ['admin', 'operator', 'user'];
      const detectedRole = data[0]?.role;
      
      if (!validRoles.includes(detectedRole)) {
        console.log('⚠️ Rol inválido detectado:', detectedRole, 'usando rol por defecto: user');
        return 'user';
      }

      console.log('✅ Rol obtenido exitosamente:', detectedRole);
      return detectedRole;
    } catch (error) {
      console.error('💥 Error inesperado en getUserRole:', error);
      console.error('💥 Stack trace:', error.stack);
      return 'user';
    }
  }

  // Verificar si un usuario es admin
  static async isAdmin(userId) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .eq('is_active', true)
        .single();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }

  // Obtener todos los usuarios con sus roles (solo para admins)
  static async getAllUsersWithRoles() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          is_active,
          assigned_at,
          user_id,
          users:auth.users!user_id(
            id,
            email,
            created_at
          )
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo usuarios con roles:', error);
      throw error;
    }
  }

  // Asignar rol a un usuario (solo para admins)
  static async assignRole(userId, role, assignedBy) {
    try {
      // Primero desactivar roles existentes del usuario
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Luego asignar el nuevo rol
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          assigned_by: assignedBy,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error asignando rol:', error);
      throw error;
    }
  }

  // Cambiar rol de un usuario (solo para admins)
  static async changeUserRole(userId, newRole, changedBy) {
    try {
      // Desactivar rol actual
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Asignar nuevo rol
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
          assigned_by: changedBy,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error cambiando rol:', error);
      throw error;
    }
  }

  // Obtener estadísticas de roles
  static async getRoleStats() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      const stats = {
        admin: 0,
        operator: 0,
        user: 0
      };

      data.forEach(item => {
        if (stats.hasOwnProperty(item.role)) {
          stats[item.role]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de roles:', error);
      return { admin: 0, operator: 0, user: 0 };
    }
  }

  // Verificar permisos del usuario actual
  static async checkPermissions(userId, requiredRole) {
    try {
      const userRole = await this.getUserRole(userId);
      
      const roleHierarchy = {
        'admin': 3,
        'operator': 2,
        'user': 1
      };

      return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }
}

export default RoleService;
