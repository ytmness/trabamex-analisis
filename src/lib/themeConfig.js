// Configuración de temas por rol
export const THEME_CONFIG = {
  admin: {
    primary: '#dc2626',      // Rojo
    secondary: '#991b1b',    // Rojo oscuro
    accent: '#fca5a5',       // Rojo claro
    background: '#000000',   // Negro
    surface: '#1f1f1f',      // Gris muy oscuro
    text: '#ffffff',         // Blanco
    border: '#dc2626',       // Rojo
    success: '#22c55e',      // Verde
    warning: '#f59e0b',      // Amarillo
    error: '#ef4444',        // Rojo claro
    gradient: 'from-red-600 via-red-800 to-black',
    cardGradient: 'from-red-700 to-red-900',
    buttonGradient: 'from-red-600 to-red-700'
  },
  operator: {
    primary: '#16a34a',      // Verde
    secondary: '#15803d',    // Verde oscuro
    accent: '#86efac',       // Verde claro
    background: '#000000',   // Negro
    surface: '#1f1f1f',      // Gris muy oscuro
    text: '#ffffff',         // Blanco
    border: '#16a34a',       // Verde
    success: '#22c55e',      // Verde
    warning: '#f59e0b',      // Amarillo
    error: '#ef4444',        // Rojo
    gradient: 'from-green-600 via-green-800 to-black',
    cardGradient: 'from-green-700 to-green-900',
    buttonGradient: 'from-green-600 to-green-700'
  },
  user: {
    primary: '#3b82f6',      // Azul
    secondary: '#1d4ed8',    // Azul oscuro
    accent: '#93c5fd',       // Azul claro
    background: '#ffffff',   // Blanco
    surface: '#f8fafc',      // Gris muy claro
    text: '#1e293b',         // Azul oscuro
    border: '#3b82f6',       // Azul
    success: '#22c55e',      // Verde
    warning: '#f59e0b',      // Amarillo
    error: '#ef4444',        // Rojo
    gradient: 'from-blue-600 via-blue-800 to-white',
    cardGradient: 'from-blue-700 to-blue-900',
    buttonGradient: 'from-blue-600 to-blue-700'
  }
};

// Funciones específicas por rol
export const ROLE_FUNCTIONS = {
  admin: {
    title: 'Panel de Control Administrativo',
    subtitle: 'Control total del sistema MIR',
    functions: [
      { name: 'Gestionar Clientes', icon: 'Users', route: '/mir/admin/clientes', color: 'blue' },
      { name: 'Crear Operadores', icon: 'UserPlus', route: '/mir/admin/crear-operador', color: 'green' },
      { name: 'Gestionar Operadores', icon: 'Truck', route: '/mir/admin/operadores', color: 'green' },
      { name: 'Gestionar Órdenes', icon: 'Package', route: '/mir/admin/ordenes', color: 'purple' },
      { name: 'Gestionar Rutas', icon: 'BarChart3', route: '/mir/admin/rutas', color: 'orange' },
      { name: 'Reportes del Sistema', icon: 'FileText', route: '/mir/admin/reportes', color: 'indigo' }
    ],
    permissions: ['all']
  },
  operator: {
    title: 'Panel de Control Operativo',
    subtitle: 'Gestión de rutas y operaciones',
    functions: [
      { name: 'Mis Rutas Asignadas', icon: 'Map', route: '/mir/operator/rutas', color: 'green' },
      { name: 'Órdenes Pendientes', icon: 'Package', route: '/mir/operator/ordenes', color: 'yellow' },
      { name: 'Reportar Incidentes', icon: 'AlertTriangle', route: '/mir/operator/incidentes', color: 'red' },
      { name: 'Checklist de Servicio', icon: 'CheckSquare', route: '/mir/operator/checklist', color: 'blue' },
      { name: 'Historial de Servicios', icon: 'Clock', route: '/mir/operator/historial', color: 'gray' }
    ],
    permissions: ['routes', 'orders', 'incidents', 'checklist']
  },
  user: {
    title: 'Panel de Cliente',
    subtitle: 'Gestión de servicios y solicitudes',
    functions: [
          { name: 'Mi Plan de Servicio', icon: 'CreditCard', route: '/mir/user/plan', color: 'blue' },
    { name: 'Solicitudes Activas', icon: 'Package', route: '/mir/user/solicitudes', color: 'green' },
    { name: 'Próxima Recolección', icon: 'Calendar', route: '/mir/user/proxima-recoleccion', color: 'yellow' },
    { name: 'Manifiestos', icon: 'FileText', route: '/mir/user/manifiestos', color: 'purple' },
    { name: 'Historial de Recolecciones', icon: 'History', route: '/mir/user/historial', color: 'gray' },
              { name: 'Checklist de Insumos', icon: 'CheckSquare', route: '/mir/user/checklist', color: 'indigo' },
        { name: 'Reportes', icon: 'BarChart3', route: '/mir/user/reportes', color: 'orange' }
    ],
    permissions: ['services', 'reports', 'checklist', 'history']
  }
};
