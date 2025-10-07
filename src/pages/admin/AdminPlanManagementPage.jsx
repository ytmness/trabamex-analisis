import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient.js';
import PlanAssignmentDialog from '@/components/admin/PlanAssignmentDialog';
import { 
  Users,
  Package,
  Calendar,
  TrendingUp,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';

const AdminPlanManagementPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Obtener usuarios con sus planes
      // Obtener usuarios básicos primero
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Obtener planes para cada usuario por separado para evitar errores de RLS
      const usersWithPlans = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: userPlans } = await supabase
            .from('plans')
            .select('id, name, status, start_date, created_at')
            .eq('customer_id', user.id);
          
          return {
            ...user,
            plans: userPlans || []
          };
        })
      );

      // Obtener estadísticas de uso para cada usuario
      const usersWithStats = await Promise.all(
        (usersWithPlans || []).map(async (user) => {
          try {
            // Obtener planes activos usando la función RPC
            const { data: activePlans, error: plansError } = await supabase.rpc('get_user_plans', {
              p_user_id: user.id
            });

            if (plansError) {
              console.error('Error fetching plans for user:', user.id, plansError);
            }
            
            if (!activePlans || activePlans.length === 0) {
              return {
                ...user,
                planStats: {
                  hasPlan: false,
                  usage: 0,
                  limit: 0,
                  percentage: 0,
                  planName: 'Sin plan',
                  plansCount: 0,
                  planDetails: []
                }
              };
            }

            // Obtener todas las órdenes completadas del usuario para calcular uso real
            const { data: userOrders, error: ordersError } = await supabase
              .from('service_orders')
              .select('plan_id, quantity, status')
              .eq('customer_id', user.id)
              .in('status', ['COMPLETED', 'CERTIFIED', 'TREATED', 'EN_TRATAMIENTO']);

            if (ordersError) {
              console.error('Error fetching orders for user:', user.id, ordersError);
            }

            // Calcular uso por plan_id
            const usageByPlan = {};
            if (userOrders && userOrders.length > 0) {
              userOrders.forEach(order => {
                if (order.plan_id && order.quantity) {
                  if (!usageByPlan[order.plan_id]) {
                    usageByPlan[order.plan_id] = 0;
                  }
                  usageByPlan[order.plan_id] += parseFloat(order.quantity) || 0;
                }
              });
            }

            // Calcular estadísticas agregadas de todos los planes activos
            let totalUsage = 0;
            let totalLimit = 0;
            let totalMonthlyPrice = 0;
            const planNames = [];

            // Sumar estadísticas de todos los planes activos y asignar uso real
            const plansWithUsage = activePlans.map(plan => {
              planNames.push(plan.plan_name);
              const limitKg = parseFloat(plan.limit_kg) || 0;
              const usageKg = usageByPlan[plan.plan_id] || 0; // Usar el uso calculado de las órdenes
              const monthlyPrice = parseFloat(plan.monthly_price) || 0;
              
              totalLimit += limitKg;
              totalMonthlyPrice += monthlyPrice;
              totalUsage += usageKg;

              return {
                ...plan,
                usage_kg: usageKg,
                limit_kg: limitKg,
                monthly_price: monthlyPrice
              };
            });

            const totalPercentage = totalLimit > 0 ? Math.min((totalUsage / totalLimit) * 100, 100) : 0;

            return {
              ...user,
              planStats: {
                hasPlan: true,
                usage: Math.round(totalUsage * 100) / 100,
                limit: totalLimit,
                percentage: Math.round(totalPercentage * 100) / 100,
                planName: activePlans.length > 1 ? `${activePlans.length} planes activos` : planNames[0] || 'Plan activo',
                monthlyPrice: totalMonthlyPrice,
                isOverLimit: totalUsage > totalLimit,
                plansCount: activePlans.length,
                planDetails: plansWithUsage
              }
            };
          } catch (error) {
            console.error('Error calculating stats for user:', user.id, error);
            return {
              ...user,
              planStats: {
                hasPlan: false,
                usage: 0,
                limit: 0,
                percentage: 0,
                planName: 'Error al calcular',
                plansCount: 0,
                planDetails: []
              }
            };
          }
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar usuarios',
        description: 'No se pudieron cargar los datos de los usuarios',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlan = (user) => {
    setSelectedUser(user);
    setShowPlanDialog(true);
  };

  const handlePlanAssigned = () => {
    setShowPlanDialog(false);
    setSelectedUser(null);
    fetchUsers(); // Recargar datos
  };

  const handleRemovePlan = async (userId, planId, planName) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el plan "${planName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId)
        .eq('customer_id', userId);

      if (error) throw error;

      toast({
        title: 'Plan eliminado',
        description: `El plan "${planName}" ha sido eliminado correctamente`,
      });

      fetchUsers(); // Recargar datos
    } catch (error) {
      console.error('Error removing plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error al eliminar plan',
        description: 'No se pudo eliminar el plan',
      });
    }
  };

  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'with_plan' && user.planStats.hasPlan) ||
                         (filterStatus === 'without_plan' && !user.planStats.hasPlan) ||
                         (filterStatus === 'over_limit' && user.planStats.isOverLimit);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (user) => {
    if (!user.planStats.hasPlan) return 'bg-gray-100 text-gray-800';
    if (user.planStats.isOverLimit) return 'bg-red-100 text-red-800';
    if (user.planStats.percentage > 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (user) => {
    if (!user.planStats.hasPlan) return 'Sin plan';
    if (user.planStats.isOverLimit) return 'Excedido';
    if (user.planStats.percentage > 80) return 'Cerca del límite';
    return 'Normal';
  };

  return (
    <>
      <Helmet>
        <title>Gestión de Planes - Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link to="/mir/admin" className="text-gray-400 hover:text-gray-600">
                  ← Volver al Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-xl font-semibold text-gray-900">Gestión de Planes</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {filteredUsers.length} usuarios
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Con Plan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.planStats.hasPlan).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sin Plan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => !u.planStats.hasPlan).length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Excedidos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.planStats.isOverLimit).length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">Todos</option>
                  <option value="with_plan">Con Plan</option>
                  <option value="without_plan">Sin Plan</option>
                  <option value="over_limit">Excedidos</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Cargando usuarios...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                        
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Planes Activos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uso Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => {
                      const isExpanded = expandedUsers.has(user.id);
                      const hasPlans = user.planStats.planDetails && user.planStats.planDetails.length > 0;
                      
                      return (
                        <React.Fragment key={user.id}>
                          {/* Main Row */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              {hasPlans && (
                                <button
                                  onClick={() => toggleUserExpansion(user.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-5 w-5" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5" />
                                  )}
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.full_name || 'Sin nombre'}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {user.planStats.plansCount > 0 ? (
                                  <span className="font-semibold">
                                    {user.planStats.plansCount} {user.planStats.plansCount === 1 ? 'plan' : 'planes'}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Sin planes</span>
                                )}
                              </div>
                              {user.planStats.hasPlan && (
                                <div className="text-xs text-gray-500">
                                  Límite total: {user.planStats.limit} kg
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {user.planStats.hasPlan ? (
                                <div className="min-w-[150px]">
                                  <div className="text-sm text-gray-900 mb-1">
                                    {user.planStats.usage} kg / {user.planStats.limit} kg
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all ${
                                        user.planStats.isOverLimit
                                          ? 'bg-red-500'
                                          : user.planStats.percentage > 80
                                          ? 'bg-yellow-500'
                                          : 'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(user.planStats.percentage, 100)}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {user.planStats.percentage}% usado
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">Sin datos</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user)}`}>
                                {getStatusText(user)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                onClick={() => handleAssignPlan(user)}
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Asignar Plan
                              </Button>
                            </td>
                          </tr>

                          {/* Expanded Details Row */}
                          {isExpanded && hasPlans && (
                            <tr>
                              <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                    Planes Asignados ({user.planStats.planDetails.length})
                                  </h4>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {user.planStats.planDetails.map((plan) => {
                                      const planUsagePercent = plan.limit_kg > 0 
                                        ? Math.min((plan.usage_kg / plan.limit_kg) * 100, 100) 
                                        : 0;
                                      const isOverLimit = plan.usage_kg > plan.limit_kg;
                                      
                                      return (
                                        <div
                                          key={plan.plan_id}
                                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                        >
                                          <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                              <h5 className="text-sm font-semibold text-gray-900">
                                                {plan.plan_name}
                                              </h5>
                                              <p className="text-xs text-gray-500 mt-1">
                                                {plan.plan_type}
                                              </p>
                                            </div>
                                            <button
                                              onClick={() => handleRemovePlan(user.id, plan.plan_id, plan.plan_name)}
                                              className="text-red-600 hover:text-red-800 transition-colors"
                                              title="Eliminar plan"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>

                                          <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                              <span className="text-gray-600">Uso:</span>
                                              <span className="font-medium text-gray-900">
                                                {plan.usage_kg} / {plan.limit_kg} kg
                                              </span>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                              <div
                                                className={`h-2 rounded-full transition-all ${
                                                  isOverLimit
                                                    ? 'bg-red-500'
                                                    : planUsagePercent > 80
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                                }`}
                                                style={{ width: `${planUsagePercent}%` }}
                                              ></div>
                                            </div>

                                            <div className="flex justify-between text-xs">
                                              <span className="text-gray-600">Progreso:</span>
                                              <span className={`font-medium ${
                                                isOverLimit ? 'text-red-600' : 'text-gray-900'
                                              }`}>
                                                {Math.round(planUsagePercent)}%
                                              </span>
                                            </div>

                                            {plan.monthly_price > 0 && (
                                              <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                                                <span className="text-gray-600">Precio mensual:</span>
                                                <span className="font-medium text-green-600">
                                                  ${plan.monthly_price}
                                                </span>
                                              </div>
                                            )}

                                            <div className="flex justify-between text-xs">
                                              <span className="text-gray-600">Frecuencia:</span>
                                              <span className="font-medium text-gray-900">
                                                {plan.pickup_frequency || 'No especificada'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Plan Assignment Dialog */}
      {showPlanDialog && selectedUser && (
        <PlanAssignmentDialog
          isOpen={showPlanDialog}
          onClose={() => setShowPlanDialog(false)}
          userId={selectedUser.id}
          userName={selectedUser.full_name || selectedUser.email}
          onPlanAssigned={handlePlanAssigned}
        />
      )}

    </>
  );
};

export default AdminPlanManagementPage;
