import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const params = useParams();

  console.log('🛡️ ProtectedRoute - Ruta:', location.pathname);
  console.log('🛡️ ProtectedRoute - Parámetros:', params);
  console.log('🛡️ ProtectedRoute - Usuario:', user?.email);
  console.log('🛡️ ProtectedRoute - Loading:', loading);
  console.log('🛡️ ProtectedRoute - Perfil:', profile);
  console.log('🛡️ ProtectedRoute - Roles permitidos:', allowedRoles);
  console.log('🛡️ ProtectedRoute - Rol del usuario:', profile?.role);

  if (loading) {
    console.log('🛡️ ProtectedRoute - Mostrando loader...');
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) {
    console.log('🛡️ ProtectedRoute - Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si no hay perfil aún, mostrar loader
  if (!profile || !profile.role) {
    console.log('🛡️ ProtectedRoute - Sin perfil o sin rol, mostrando loader...');
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-red-600" />
      </div>
    );
  }

  // Verificar que el usuario tenga el rol correcto para acceder a esta ruta
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    console.log('🛡️ ProtectedRoute - Usuario no tiene rol permitido, mostrando mensaje de acceso denegado');
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">
            Tu cuenta es de tipo <span className="font-semibold text-blue-600">{profile.role}</span>, 
            no tienes permisos para acceder a esta sección.
          </p>
          <button 
            onClick={() => window.location.href = `/mir/${profile.role}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Ir a mi Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Si la ruta actual es /mir/undefined, redirigir al rol correcto del usuario
  if (params.role === 'undefined' && profile?.role) {
    console.log('🛡️ ProtectedRoute - Ruta undefined detectada, redirigiendo a:', `/mir/${profile.role}`);
    return <Navigate to={`/mir/${profile.role}`} replace />;
  }

  // Mejorar la validación de rutas para evitar falsos positivos
  // Solo validar si estamos en una ruta que requiere verificación de rol
  if (params.role && params.role !== profile.role) {
    // Verificar si la ruta actual es una subruta válida del usuario
    const currentPath = location.pathname;
    const expectedBasePath = `/mir/${profile.role}`;
    
    // Si la ruta actual comienza con la ruta base esperada, permitir acceso
    if (currentPath.startsWith(expectedBasePath)) {
      console.log('🛡️ ProtectedRoute - Ruta válida detectada, permitiendo acceso');
      return children;
    }
    
    // Si no es una ruta válida, mostrar mensaje de ruta incorrecta
    console.log('🛡️ ProtectedRoute - Ruta no coincide con rol, mostrando mensaje');
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
          <div className="text-orange-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ruta Incorrecta</h2>
          <p className="text-gray-600 mb-4">
            Estás intentando acceder a <span className="font-semibold text-orange-600">/{params.role}</span>, 
            pero tu cuenta es de tipo <span className="font-semibold text-blue-600">{profile.role}</span>.
          </p>
          <button 
            onClick={() => window.location.href = `/mir/${profile.role}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Ir a mi Dashboard
          </button>
        </div>
      </div>
    );
  }

  console.log('🛡️ ProtectedRoute - Acceso permitido, renderizando children');
  return children;
};

export default ProtectedRoute;
