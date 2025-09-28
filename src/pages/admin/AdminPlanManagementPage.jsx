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
  PlusCircle,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Obtener usuarios con sus planes (ahora con relación FK correcta)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          created_at,
          plans (
            id,
            name,
            status,
            start_date,
            created_at
          )
        `)
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Obtener estadísticas de uso para cada usuario
      const usersWithStats = await Promise.all(
        (usersData || []).map(async (user) => {
          try {
            // Obtener el plan activo
            const activePlan = user.plans?.find(plan => plan.status === 'ACTIVE');
            
            if (!activePlan) {
              return {
                ...user,
                planStats: {
                  hasPlan: false,
                  usage: 0,
                  limit: 0,
                  percentage: 0,
                  planName: 'Sin plan'
                }
              };
            }

            // Calcular estadísticas del plan
            const { data: serviceOrders, error: ordersError } = await supabase
              .from('service_orders')
              .select('quantity, unit, status, created_at')
              .eq('customer_id', user.id)
              .in('status', ['COLLECTED', 'TREATED', 'CERTIFIED'])
              .gte('created_at', activePlan.start_date);

            if (ordersError) {
              console.error('Error fetching orders for user:', user.id, ordersError);
              return {
                ...user,
                planStats: {
                  hasPlan: true,
                  usage: 0,
                  limit: 100,
                  percentage: 0,
                  planName: activePlan.name,
                  error: ordersError.message
                }
              };
            }

            // Obtener el límite real del plan desde subscription_plans
            const { data: subscriptionPlan, error: subError } = await supabase
              .from('subscription_plans')
              .select('included_weight_kg, monthly_price')
              .eq('name', activePlan.name)
              .single();

            const planLimit = subscriptionPlan?.included_weight_kg || 100; // Usar el límite real
            const monthlyPrice = subscriptionPlan?.monthly_price || 3200;

            // Calcular uso del plan
            const totalWeight = serviceOrders.reduce((sum, order) => {
              const weight = parseFloat(order.quantity) || 0;
              const weightInKg = order.unit === 'kg' ? weight : weight / 1000;
              return sum + weightInKg;
            }, 0);

            const percentage = Math.min((totalWeight / planLimit) * 100, 100);

            return {
              ...user,
              planStats: {
                hasPlan: true,
                usage: Math.round(totalWeight * 100) / 100,
                limit: planLimit, // Usar el límite real
                percentage: Math.round(percentage * 100) / 100,
                planName: activePlan.name,
                monthlyPrice: monthlyPrice,
                isOverLimit: totalWeight > planLimit
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
                planName: 'Error al calcular'
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uso
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
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.planStats.planName}
                          </div>
                          {user.planStats.hasPlan && (
                            <div className="text-xs text-gray-500">
                              Límite: {user.planStats.limit} kg
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.planStats.hasPlan ? (
                            <div>
                              <div className="text-sm text-gray-900">
                                {user.planStats.usage} kg ({user.planStats.percentage}%)
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className={`h-2 rounded-full ${
                                    user.planStats.isOverLimit
                                      ? 'bg-red-500'
                                      : user.planStats.percentage > 80
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(user.planStats.percentage, 100)}%` }}
                                ></div>
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
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleAssignPlan(user)}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Package className="h-4 w-4 mr-1" />
                              {user.planStats.hasPlan ? 'Cambiar' : 'Asignar'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
