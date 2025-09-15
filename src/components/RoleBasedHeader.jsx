import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Truck,
  LogOut,
  Settings,
  ArrowLeft,
  Home
} from 'lucide-react';

const RoleBasedHeader = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!profile) {
    return null;
  }

  const getRoleInfo = () => {
    switch (profile.role) {
      case 'user':
        return {
          title: 'Cliente',
          icon: User,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: 'Panel de gestión de servicios'
        };
      case 'admin':
        return {
          title: 'Administrador',
          icon: Shield,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          description: 'Control total del sistema'
        };
      case 'operator':
        return {
          title: 'Operador',
          icon: Truck,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'Gestión de rutas y operaciones'
        };
      default:
        return {
          title: 'Usuario',
          icon: User,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          description: 'Panel de usuario'
        };
    }
  };

  const roleInfo = getRoleInfo();
  const Icon = roleInfo.icon;

  // Funciones de navegación rápida
  const goToUserPanel = () => {
    navigate('/mir/user');
  };

  const goToAdminPanel = () => {
    navigate('/mir/admin');
  };

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate('/mir');
  };

  // Determinar si estamos en panel de admin o usuario
  const isInAdminPanel = location.pathname.includes('/admin');
  const isInUserPanel = location.pathname.includes('/user');

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${roleInfo.bgColor}`}>
            <Icon className={`h-6 w-6 ${roleInfo.color}`} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {roleInfo.title} - {profile.full_name || 'Usuario'}
            </h1>
            <p className="text-sm text-gray-600">{roleInfo.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Botones de navegación rápida */}
          <div className="flex items-center space-x-2 border-r border-gray-200 pr-3">
            {/* Botón Regresar */}
            <button 
              onClick={goBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Regresar"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Regresar</span>
            </button>

            {/* Botón Inicio */}
            <button 
              onClick={goHome}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Inicio"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Inicio</span>
            </button>

            {/* Botón Panel de Cliente */}
            {profile.role === 'admin' && (
              <button 
                onClick={goToUserPanel}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isInUserPanel 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
                title="Panel de Cliente"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Cliente</span>
              </button>
            )}

            {/* Botón Panel de Admin */}
            {profile.role === 'admin' && (
              <button 
                onClick={goToAdminPanel}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isInAdminPanel 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-600 hover:text-red-700 hover:bg-red-50'
                }`}
                title="Panel de Administrador"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>

          {/* Botones existentes */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="h-5 w-5" />
          </button>
          <button 
            onClick={signOut}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default RoleBasedHeader;
