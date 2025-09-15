// Configuración de rutas para producción
// Este archivo se genera automáticamente durante el despliegue
// Servidor: 144.202.72.150

export const ROUTE_CONFIG = {
  // Rutas base
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CONTACT: '/contacto',
  
  // Rutas del dashboard
  DASHBOARD: '/mir',
  USER_DASHBOARD: '/mir/user',
  ADMIN_DASHBOARD: '/mir/admin',
  OPERATOR_DASHBOARD: '/mir/operator',
  
  // Rutas de usuario
  USER_SERVICES: '/mir/user/servicios',
  USER_REQUEST: '/mir/user/solicitar',
  USER_PLANS: '/mir/user/planes',
  USER_CHECKLIST: '/mir/user/checklist',
  USER_MANIFESTS: '/mir/user/manifiestos',
  USER_SUPPLIES: '/mir/user/solicitar-insumos',
  USER_INCIDENTS: '/mir/user/incidencias',
  
  // Rutas de operador
  OPERATOR_ROUTE: '/mir/operator/route',
  OPERATOR_INCIDENT: '/mir/operator/incident/new',
  
  // Rutas de admin
  ADMIN_CLIENTS: '/mir/admin/clientes',
  ADMIN_OPERATORS: '/mir/admin/operadores',
  ADMIN_ORDERS: '/mir/admin/ordenes',
  ADMIN_ROUTES: '/mir/admin/rutas',
  ADMIN_PLANS: '/mir/admin/planes-admin',
  ADMIN_INCIDENTS: '/mir/admin/incidencias',
  ADMIN_TREATMENTS: '/mir/admin/tratamientos',
  ADMIN_CERTIFICATES: '/mir/admin/certificados',
  
  // API base URL - IP específica del servidor
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://144.202.72.150',
  
  // Configuración de Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Función para obtener la URL completa de una ruta
export const getFullUrl = (route) => {
  const baseUrl = ROUTE_CONFIG.API_BASE_URL;
  return `${baseUrl}${route}`;
};

// Función para verificar si estamos en producción
export const isProduction = () => {
  return import.meta.env.PROD;
};

// Función para obtener la URL base
export const getBaseUrl = () => {
  return ROUTE_CONFIG.API_BASE_URL;
}; 