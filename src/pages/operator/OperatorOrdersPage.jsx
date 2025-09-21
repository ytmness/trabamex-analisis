import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Play,
  Truck,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '../../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const OperatorOrdersPage = () => {
  const { profile, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOperatorOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    
    try {
      // Obtener órdenes de servicio asignadas al operador
      const { data: ordersData, error: ordersError } = await supabase
        .from('service_orders')
        .select(`
          *,
          customer:profiles(full_name, company)
        `)
        .eq('operator_id', user.id)
        .in('status', ['PENDING', 'PENDIENTE', 'EN_PROCESO', 'EN_RUTA', 'COMPLETADO'])
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar órdenes',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Estado actualizado',
        description: `La solicitud se ha marcado como ${newStatus}`,
      });

      fetchOperatorOrders();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: error.message,
      });
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchOperatorOrders();
  }, [user, fetchOperatorOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'EN_PROCESO':
        return 'bg-blue-100 text-blue-800';
      case 'EN_RUTA':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDIENTE':
        return <Clock className="h-4 w-4" />;
      case 'EN_PROCESO':
        return <Play className="h-4 w-4" />;
      case 'EN_RUTA':
        return <Truck className="h-4 w-4" />;
      case 'COMPLETADO':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDIENTE':
        return { status: 'EN_PROCESO', label: 'En Proceso', icon: Play };
      case 'EN_PROCESO':
        return { status: 'EN_RUTA', label: 'En Ruta', icon: Truck };
      case 'EN_RUTA':
        return { status: 'COMPLETADO', label: 'Completar', icon: CheckCircle };
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Mis Órdenes - Operador MIR</title>
        <meta name="description" content="Gestiona todas las órdenes de servicio asignadas como operador." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-white shadow-lg mb-8">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Mis Órdenes
                </h1>
                <p className="mt-2 text-red-100 text-lg">Gestiona todas las órdenes de servicio asignadas</p>
              </div>
              <div className="flex items-center space-x-3 bg-white/20 px-4 py-2 rounded-full border border-white/30">
                <Package className="h-6 w-6 text-white" />
                <span className="text-white font-semibold text-sm">OPERADOR</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Resumen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Solicitudes</p>
                  <div className="text-3xl font-bold text-gray-800 mt-1">{orders.length}</div>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <Package className="h-8 w-8 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pendientes</p>
                  <div className="text-3xl font-bold text-yellow-600 mt-1">
                    {orders.filter(o => o.status === 'PENDIENTE').length}
                  </div>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">En Proceso</p>
                  <div className="text-3xl font-bold text-blue-600 mt-1">
                    {orders.filter(o => o.status === 'EN_PROCESO').length}
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">En Ruta</p>
                  <div className="text-3xl font-bold text-purple-600 mt-1">
                    {orders.filter(o => o.status === 'EN_RUTA').length}
                  </div>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Truck className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completadas</p>
                  <div className="text-3xl font-bold text-green-600 mt-1">
                    {orders.filter(o => o.status === 'COMPLETADO').length}
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lista de Órdenes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Órdenes de Servicio</h2>
                <p className="text-gray-600">Gestiona las órdenes de servicio asignadas</p>
              </div>
              
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order, index) => {
                    const nextAction = getNextStatus(order.status);
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Package className="h-6 w-6 text-gray-600" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 text-lg">
                                Solicitud #{order.id.substring(0,8)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Cliente: {order.customer?.full_name || order.client_name || 'Sin nombre'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Creada: {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                              </div>
                              {/* Detalles adicionales del formulario */}
                              <div className="text-xs text-gray-500 mt-1">
                                {order.tipo_residuo && `Tipo: ${order.tipo_residuo}`}
                                {order.quantity && ` • Cantidad: ${order.quantity} ${order.unit || 'Kg'}`}
                                {order.clave && ` • Clave: ${order.clave}`}
                                {order.notes && ` • Notas: ${order.notes.substring(0, 30)}${order.notes.length > 30 ? '...' : ''}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span>{order.status}</span>
                            </span>
                            
                            <div className="flex space-x-2">
                              {nextAction && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, nextAction.status)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-1"
                                >
                                  <nextAction.icon className="h-4 w-4" />
                                  <span>{nextAction.label}</span>
                                </button>
                              )}
                              
                              <Link 
                                to={`/mir/operator/tracking/${order.id}`}
                                className="text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Ver Detalles</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-800">No hay órdenes asignadas</h3>
                  <p className="mt-2 text-sm text-gray-600">Contacta a tu administrador para recibir asignaciones de órdenes.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Información de Permisos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-red-800">⚠️ Permisos del Operador</h3>
              </div>
              <div className="text-red-700 space-y-2">
                <p className="text-sm">
                  <strong>Como operador, solo puedes:</strong>
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• ✅ Cambiar estados de órdenes (Pendiente → En Proceso → En Ruta → Completado)</li>
                  <li>• ✅ Ver detalles de órdenes de servicio</li>
                  <li>• ✅ Acceder al tracking de órdenes</li>
                  <li>• ❌ NO puedes editar o eliminar órdenes</li>
                  <li>• ❌ NO puedes modificar información de clientes</li>
                  <li>• ❌ NO puedes crear nuevas órdenes</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OperatorOrdersPage;