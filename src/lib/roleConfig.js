// Configuración de roles del sistema
export const ROLES = {
  USER: 'user',
  OPERATOR: 'operator',
  ADMIN: 'admin'
};

// Mapeo de emails a roles (para desarrollo/pruebas)
export const EMAIL_ROLE_MAPPING = {
  'admin@trabamex.com': ROLES.ADMIN,
  'operador@trabamex.com': ROLES.OPERATOR,
  'cliente@trabamex.com': ROLES.USER,
  'sergiooresa@outlook.com': ROLES.ADMIN,
  // Puedes agregar más emails aquí
};

// Función para determinar el rol basado en el email
export const determineRoleFromEmail = (email) => {
  if (!email) return ROLES.USER;
  
  // Verificar si el email está en el mapeo
  if (EMAIL_ROLE_MAPPING[email]) {
    return EMAIL_ROLE_MAPPING[email];
  }
  
  // Lógica adicional para determinar roles
  if (email.includes('admin') || email.includes('administrador')) {
    return ROLES.ADMIN;
  }
  
  if (email.includes('operador') || email.includes('operator') || email.includes('driver')) {
    return ROLES.OPERATOR;
  }
  
  // Por defecto, todos son usuarios
  return ROLES.USER;
};

// Función para obtener información del rol
export const getRoleInfo = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return {
        title: 'Administrador',
        description: 'Control total del sistema',
        color: 'red',
        icon: 'shield',
        permissions: ['all']
      };
    case ROLES.OPERATOR:
      return {
        title: 'Operador',
        description: 'Gestión de rutas y operaciones',
        color: 'green',
        icon: 'truck',
        permissions: ['routes', 'orders', 'incidents']
      };
    case ROLES.USER:
    default:
      return {
        title: 'Cliente',
        description: 'Panel de gestión de servicios',
        color: 'blue',
        icon: 'user',
        permissions: ['services', 'reports', 'checklist']
      };
  }
};
