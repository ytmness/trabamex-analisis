import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { LogOut } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Calendar,
  ClipboardList,
  Truck,
  Shield,
  Home,
  Plus,
  Eye,
  Edit,
  UserPlus,
  Trash2
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { profile, signOut } = useAuth();

  const adminSections = [
    {
      title: 'Solicitudes de Insumos',
      description: 'Gestionar solicitudes de materiales y suministros',
      icon: Package,
      color: 'bg-red-500',
      href: '/mir/admin/supplies-requests',
      stats: {
        total: '0',
        pending: '0',
        approved: '0'
      }
    },
    {
      title: 'Tratamientos',
      description: 'Administrar tratamientos y servicios',
      icon: FileText,
      color: 'bg-blue-500',
      href: '/mir/admin/tratamientos',
      stats: {
        total: '0',
        active: '0',
        completed: '0'
      }
    },
    {
      title: 'Certificados',
      description: 'Gestionar certificados y documentación',
      icon: ClipboardList,
      color: 'bg-green-500',
      href: '/mir/admin/certificados',
      stats: {
        total: '0',
        valid: '0',
        expired: '0'
      }
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar clientes, operadores y permisos',
      icon: Users,
      color: 'bg-purple-500',
      href: '/mir/admin/clientes',
      stats: {
        clients: '0',
        operators: '0',
        total: '0'
      }
    },
    {
      title: 'Asignaciones',
      description: 'Asignar operadores a recolecciones e insumos',
      icon: UserPlus,
      color: 'bg-yellow-500',
      href: '/mir/admin/asignaciones',
      stats: {
        total: '0',
        pending: '0',
        assigned: '0'
      }
    },
    {
      title: 'Incidencias',
      description: 'Gestionar incidencias y reportes del sistema',
      icon: BarChart3,
      color: 'bg-orange-500',
      href: '/mir/admin/incidencias',
      stats: {
        total: '0',
        open: '0',
        resolved: '0'
      }
    },
    {
      title: 'Configuración',
      description: 'Configuración del sistema',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/mir/admin/settings',
      stats: {
        total: '0',
        active: '0',
        inactive: '0'
      }
    },
    {
      title: 'Gestión de Planes',
      description: 'Asignar y gestionar planes de usuarios',
      icon: Package,
      color: 'bg-indigo-500',
      href: '/mir/admin/gestion-planes',
      stats: {
        total: '0',
        active: '0',
        expired: '0'
      }
    }
  ];

  return (
    <>
      <Helmet>
        <title>Panel de Administración - Trabamex</title>
        <meta name="description" content="Panel de administración para gestionar el sistema Trabamex" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-red-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                    <p className="text-sm text-gray-600">
                      Bienvenido, {profile?.full_name || 'Administrador'}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {profile?.roleInfo?.title || 'Admin'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={signOut} className="text-red-600 hover:text-red-700">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    ¡Bienvenido al Panel de Administración!
                  </h2>
                  <p className="text-red-100">
                    Gestiona todas las operaciones del sistema desde aquí
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-red-200" />
              </div>
            </div>
          </motion.div>

          {/* Admin Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <Link to={section.href} className="block p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${section.color} text-white`}>
                      <section.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Object.values(section.stats)[0]} total
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {section.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {Object.entries(section.stats).map(([key, value]) => (
                        <div key={key} className="text-xs text-gray-500">
                          <span className="font-medium">{value}</span> {key}
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/mir/admin/supplies-requests">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Package className="h-4 w-4 mr-2" />
                  Ver Solicitudes de Insumos
                </Button>
              </Link>
              <Link to="/mir/admin/asignaciones">
                <Button variant="outline" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Gestionar Asignaciones
                </Button>
              </Link>
              <Link to="/mir/admin/tratamientos">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Gestionar Tratamientos
                </Button>
              </Link>
              <Link to="/mir/admin/incidencias">
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Incidencias
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
