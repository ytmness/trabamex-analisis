import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Calendar, 
  FileText, 
  History, 
  CheckSquare, 
  Box, 
  BarChart3,
  Users,
  Truck,
  Settings,
  Map,
  AlertTriangle,
  FlaskConical,
  Shield
} from 'lucide-react';

const RoleBasedNavigation = () => {
  const { profile } = useAuth();
  const location = useLocation();

  if (!profile || !profile.role) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const getNavigationItems = () => {
    switch (profile.role) {
      case 'user':
        return [
          { path: '/mir/user', label: 'Dashboard', icon: Home },
          { path: '/mir/user/servicios', label: 'Servicios', icon: Package },
          { path: '/mir/user/solicitar', label: 'Nueva Solicitud', icon: FileText },
          { path: '/mir/user/planes', label: 'Mis Planes', icon: BarChart3 },
          { path: '/mir/user/checklist', label: 'Checklist', icon: CheckSquare },
          { path: '/mir/user/manifiestos', label: 'Manifiestos', icon: History },
          { path: '/mir/user/solicitar-insumos', label: 'Solicitar Insumos', icon: Box },
          { path: '/mir/user/reportes', label: 'Reportes', icon: BarChart3 },
        ];

      case 'operator':
        return [
          { path: '/mir/operator', label: 'Dashboard', icon: Home },
          { path: '/mir/operator/route', label: 'Mis Rutas', icon: Map },
          { path: '/mir/operator/incident/new', label: 'Reportar Incidente', icon: AlertTriangle },
        ];

      case 'admin':
        return [
          { path: '/mir/admin', label: 'Dashboard', icon: Home },
          { path: '/mir/admin/clientes', label: 'Clientes', icon: Users },
          { path: '/mir/admin/operadores', label: 'Operadores', icon: Truck },
          { path: '/mir/admin/ordenes', label: 'Órdenes', icon: Package },
          { path: '/mir/admin/rutas', label: 'Rutas', icon: Map },
          { path: '/mir/admin/planes-admin', label: 'Planes', icon: BarChart3 },
          { path: '/mir/admin/incidencias', label: 'Incidencias', icon: AlertTriangle },
          { path: '/mir/admin/tratamientos', label: 'Tratamientos', icon: FlaskConical },
          { path: '/mir/admin/certificados', label: 'Certificados', icon: Shield },
        ];

      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path)
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default RoleBasedNavigation;
