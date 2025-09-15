import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Home, 
  Users, 
  Truck, 
  Package, 
  Map, 
  AlertTriangle, 
  FlaskConical, 
  Shield,
  BarChart3,
  Settings,
  PlusCircle
} from 'lucide-react';

const AdminNavigationButtons = ({ 
  showBackButton = true, 
  showHomeButton = true, 
  showQuickActions = true,
  className = "mb-6" 
}) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goToAdminDashboard = () => {
    navigate('/mir/admin');
  };

  const goToUserPanel = () => {
    navigate('/mir/user');
  };

  const goHome = () => {
    navigate('/mir');
  };

  const quickActions = [
    {
      name: 'Gestionar Clientes',
      icon: Users,
      path: '/mir/admin/clientes',
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
      description: 'Administrar perfiles de clientes'
    },
    {
      name: 'Gestionar Operadores',
      icon: Truck,
      path: '/mir/admin/operadores',
      color: 'text-green-600 hover:text-green-700 hover:bg-green-50',
      description: 'Administrar operadores del sistema'
    },
    {
      name: 'Gestionar Órdenes',
      icon: Package,
      path: '/mir/admin/ordenes',
      color: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50',
      description: 'Ver y gestionar órdenes de servicio'
    },
    {
      name: 'Gestionar Rutas',
      icon: Map,
      path: '/mir/admin/rutas',
      color: 'text-orange-600 hover:text-orange-700 hover:bg-orange-50',
      description: 'Administrar rutas de recolección'
    },
    {
      name: 'Incidencias',
      icon: AlertTriangle,
      path: '/mir/admin/incidencias',
      color: 'text-red-600 hover:text-red-700 hover:bg-red-50',
      description: 'Gestionar reportes de incidencias'
    },
    {
      name: 'Tratamientos',
      icon: FlaskConical,
      path: '/mir/admin/tratamientos',
      color: 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50',
      description: 'Administrar tratamientos de residuos'
    },
    {
      name: 'Certificados',
      icon: Shield,
      path: '/mir/admin/certificados',
      color: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
      description: 'Gestionar certificados de cumplimiento'
    },
    {
      name: 'Planes',
      icon: BarChart3,
      path: '/mir/admin/planes-admin',
      color: 'text-teal-600 hover:text-teal-700 hover:bg-teal-50',
      description: 'Administrar planes de servicio'
    }
  ];

  return (
    <div className={className}>
      {/* Botones principales de navegación */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {showBackButton && (
          <Button 
            variant="outline" 
            onClick={goBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar
          </Button>
        )}

        {showHomeButton && (
          <Button 
            variant="outline" 
            onClick={goHome}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border-gray-300"
          >
            <Home className="h-4 w-4" />
            Inicio
          </Button>
        )}

        <Button 
          variant="outline" 
          onClick={goToAdminDashboard}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
        >
          <Shield className="h-4 w-4" />
          Dashboard Admin
        </Button>

        <Button 
          variant="outline" 
          onClick={goToUserPanel}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
        >
          <Users className="h-4 w-4" />
          Panel Cliente
        </Button>
      </div>

      {/* Acciones administrativas rápidas */}
      {showQuickActions && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Acciones Administrativas Rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(action.path)}
                  className={`flex flex-col items-center gap-1 p-2 h-auto min-h-[60px] ${action.color} hover:shadow-sm transition-all duration-200`}
                  title={action.description}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {action.name}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavigationButtons;
