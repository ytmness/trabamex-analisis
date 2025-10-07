import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { LogOut, Loader2 } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient';
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    suppliesRequests: { total: 0, pending: 0, approved: 0 },
    treatments: { total: 0, active: 0, completed: 0 },
    certificates: { total: 0, valid: 0, expired: 0 },
    users: { clients: 0, operators: 0, total: 0 },
    assignments: { total: 0, pending: 0, assigned: 0 },
    incidents: { total: 0, open: 0, resolved: 0 },
    configuration: { total: 0, active: 0, inactive: 0 },
    plans: { total: 0, active: 0, expired: 0 }
  });

  // Función para cargar estadísticas
  const fetchStats = async () => {
    try {
      setLoading(true);

      // 1. Solicitudes de Insumos
      const { data: suppliesRequests, error: suppliesError } = await supabase
        .from('supplies_requests')
        .select('status');

      if (suppliesError) throw suppliesError;

      const suppliesStats = {
        total: suppliesRequests?.length || 0,
        pending: suppliesRequests?.filter(r => r.status === 'pending').length || 0,
        approved: suppliesRequests?.filter(r => r.status === 'approved' || r.status === 'completed').length || 0
      };

      // 2. Usuarios (clientes y operadores)
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('role');

      if (usersError) throw usersError;

      const userStats = {
        clients: users?.filter(u => u.role === 'user').length || 0,
        operators: users?.filter(u => u.role === 'operador').length || 0,
        total: users?.length || 0
      };

      // 3. Órdenes de servicio (tratamientos)
      const { data: orders, error: ordersError } = await supabase
        .from('service_orders')
        .select('status, treatment_completed_at');

      if (ordersError) throw ordersError;

      const treatmentStats = {
        total: orders?.length || 0,
        active: orders?.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').length || 0,
        completed: orders?.filter(o => o.treatment_completed_at !== null).length || 0
      };

      // 4. Planes
      const { data: plans, error: plansError } = await supabase
        .from('plans')
        .select('status');

      if (plansError) throw plansError;

      const planStats = {
        total: plans?.length || 0,
        active: plans?.filter(p => p.status === 'ACTIVE').length || 0,
        expired: plans?.filter(p => p.status === 'INACTIVE' || p.status === 'EXPIRED').length || 0
      };

      // 5. Certificados (basado en órdenes con certificados generados)
      const certificateStats = {
        total: orders?.filter(o => o.certificate_url !== null).length || 0,
        valid: orders?.filter(o => o.certificate_url !== null).length || 0,
        expired: 0 // Por ahora no hay lógica de expiración
      };

      // 6. Asignaciones (basado en órdenes con operador asignado)
      const assignmentStats = {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.status === 'PENDING' && o.operator_id === null).length || 0,
        assigned: orders?.filter(o => o.operator_id !== null).length || 0
      };

      // 7. Incidencias
      const { data: incidents, error: incidentsError } = await supabase
        .from('incidents')
        .select('status');

      if (incidentsError) throw incidentsError;

      const incidentStats = {
        total: incidents?.length || 0,
        open: incidents?.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length || 0,
        resolved: incidents?.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length || 0
      };

      // 8. Configuración (planes de suscripción)
      const { data: subscriptionPlans, error: subscriptionError } = await supabase
        .from('subscription_plans')
        .select('is_active');

      if (subscriptionError) throw subscriptionError;

      const configStats = {
        total: subscriptionPlans?.length || 0,
        active: subscriptionPlans?.filter(p => p.is_active === true).length || 0,
        inactive: subscriptionPlans?.filter(p => p.is_active === false).length || 0
      };

      setStats({
        suppliesRequests: suppliesStats,
        treatments: treatmentStats,
        certificates: certificateStats,
        users: userStats,
        assignments: assignmentStats,
        incidents: incidentStats,
        configuration: configStats,
        plans: planStats
      });

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas del dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const adminSections = [
    {
      title: 'Solicitudes de Insumos',
      description: 'Gestionar solicitudes de materiales y suministros',
      icon: Package,
      color: 'bg-red-500',
      href: '/mir/admin/supplies-requests',
      stats: {
        total: stats.suppliesRequests.total,
        pending: stats.suppliesRequests.pending,
        approved: stats.suppliesRequests.approved
      }
    },
    {
      title: 'Tratamientos',
      description: 'Administrar tratamientos y servicios',
      icon: FileText,
      color: 'bg-blue-500',
      href: '/mir/admin/tratamientos',
      stats: {
        total: stats.treatments.total,
        active: stats.treatments.active,
        completed: stats.treatments.completed
      }
    },
    {
      title: 'Certificados',
      description: 'Gestionar certificados y documentación',
      icon: ClipboardList,
      color: 'bg-green-500',
      href: '/mir/admin/certificados',
      stats: {
        total: stats.certificates.total,
        valid: stats.certificates.valid,
        expired: stats.certificates.expired
      }
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar clientes, operadores y permisos',
      icon: Users,
      color: 'bg-purple-500',
      href: '/mir/admin/clientes',
      stats: {
        clients: stats.users.clients,
        operators: stats.users.operators,
        total: stats.users.total
      }
    },
    {
      title: 'Asignaciones',
      description: 'Asignar operadores a recolecciones e insumos',
      icon: UserPlus,
      color: 'bg-yellow-500',
      href: '/mir/admin/asignaciones',
      stats: {
        total: stats.assignments.total,
        pending: stats.assignments.pending,
        assigned: stats.assignments.assigned
      }
    },
    {
      title: 'Incidencias',
      description: 'Gestionar incidencias y reportes del sistema',
      icon: BarChart3,
      color: 'bg-orange-500',
      href: '/mir/admin/incidencias',
      stats: {
        total: stats.incidents.total,
        open: stats.incidents.open,
        resolved: stats.incidents.resolved
      }
    },
    {
      title: 'Configuración',
      description: 'Configuración del sistema',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/mir/admin/settings',
      stats: {
        total: stats.configuration.total,
        active: stats.configuration.active,
        inactive: stats.configuration.inactive
      }
    },
    {
      title: 'Gestión de Planes',
      description: 'Asignar y gestionar planes de usuarios',
      icon: Package,
      color: 'bg-indigo-500',
      href: '/mir/admin/gestion-planes',
      stats: {
        total: stats.plans.total,
        active: stats.plans.active,
        expired: stats.plans.expired
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
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
            </div>
          )}
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white border-2 border-red-500 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-red-600">
                    ¡Bienvenido al Panel de Administración!
                  </h2>
                  <p className="text-gray-700">
                    Gestiona todas las operaciones del sistema desde aquí
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-red-500" />
              </div>
            </div>
          </motion.div>

          {/* Admin Sections Grid */}
          {!loading && (
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
          )}

          {/* Quick Actions */}
          {!loading && (
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
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
