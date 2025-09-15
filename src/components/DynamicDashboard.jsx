import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import UserDashboardPage from '../pages/UserDashboardPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import OperatorDashboardPage from '../pages/operator/OperatorDashboardPage';
import { Loader2, AlertCircle } from 'lucide-react';

const DynamicDashboard = () => {
  const { profile, user, loading } = useAuth();

  // Mostrar loading mientras se determina el rol
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar mensaje de no autenticado
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No autenticado</h1>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para acceder al dashboard.
          </p>
          <a
            href="/auth-test"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir a Login
          </a>
        </div>
      </div>
    );
  }

  // Si no hay perfil, mostrar mensaje de perfil faltante
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Perfil no encontrado</h1>
          <p className="text-gray-600 mb-6">
            Tu perfil de usuario no está configurado correctamente.
          </p>
          <p className="text-sm text-gray-500">
            ID de usuario: {user.id}
          </p>
        </div>
      </div>
    );
  }

  // Determinar qué dashboard mostrar según el rol
  switch (profile.role) {
    case 'user':
      return <UserDashboardPage />;
    case 'admin':
      return <AdminDashboardPage />;
    case 'operator':
      return <OperatorDashboardPage />;
    default:
      // Fallback para roles no reconocidos
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Rol no reconocido</h1>
            <p className="text-gray-600 mb-4">
              Tu rol actual ({profile.role}) no tiene un dashboard asignado.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              ID: {profile.id} | Nombre: {profile.full_name}
            </p>
            <p className="text-gray-600">
              Contacta al administrador del sistema para configurar tu rol correctamente.
            </p>
          </div>
        </div>
      );
  }
};

export default DynamicDashboard;
