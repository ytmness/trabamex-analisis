import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const RoleBasedRoute = ({ 
  allowedRoles, 
  children, 
  fallbackPath = '/login',
  showLoading = true 
}) => {
  const { profile, user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Si no hay perfil o rol, redirigir al login
  if (!profile || !profile.role) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar si el rol del usuario está permitido
  if (allowedRoles.includes(profile.role)) {
    return children;
  }

  // Si el rol no está permitido, redirigir al dashboard principal
  return <Navigate to={`/mir/${profile.role}`} replace />;
};

export default RoleBasedRoute;
