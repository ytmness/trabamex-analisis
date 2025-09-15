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
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-400 mx-auto mb-4" />
          <p className="text-white text-lg">Cargando órdenes...</p>
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
      
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-800 to-black text-white">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-sm border-b border-green-600">
          <div className="container mx-auto px-6 py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-200 bg-clip-text text-transparent">
                  Mis Órdenes
                </h1>
                <p className="mt-2 text-green-100 text-lg">Gestiona todas las órdenes de servicio asignadas</p>
              </div>
              <div className="flex items-center space-x-3 bg-green-600/50 px-4 py-2 rounded-full border border-green-500">
                <Package className="h-6 w-6 text-green-200" />
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
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Solicitudes</p>
                  <div className="text-3xl font-bold text-white mt-1">{orders.length}</div>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <Package className="h-8 w-8 text-blue-200" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 shadow-lg border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                  <div className="text-3xl font-bold text-white mt-1">
                    {orders.filter(o => o.status === 'PENDIENTE').length}
                  </div>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-full">
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">En Proceso</p>
                  <div className="text-3xl font-bold text-white mt-1">
                    {orders.filter(o => o.status === 'EN_PROCESO').length}
                  </div>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <Play className="h-8 w-8 text-purple-200" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">En Ruta</p>
                  <div className="text-3xl font-bold text-white mt-1">
                    {orders.filter(o => o.status === 'EN_RUTA').length}
                  </div>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <Truck className="h-8 w-8 text-blue-200" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completadas</p>
                  <div className="text-3xl font-bold text-white mt-1">
                    {orders.filter(o => o.status === 'COMPLETADO').length}
                  </div>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-200" />
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
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-green-600">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Órdenes de Servicio</h2>
                <p className="text-green-200">Gestiona las órdenes de servicio asignadas</p>
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
                        className="bg-green-900/30 rounded-lg p-6 border border-green-600/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Package className="h-6 w-6 text-green-400" />
                            <div className="flex-1">
                              <div className="font-medium text-white text-lg">
                                Solicitud #{order.id.substring(0,8)}
                              </div>
                              <div className="text-sm text-green-200">
                                Cliente: {order.customer?.full_name || order.client_name || 'Sin nombre'}
                              </div>
                              <div className="text-xs text-green-300">
                                Creada: {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                              </div>
                              {/* Detalles adicionales del formulario */}
                              <div className="text-xs text-green-300 mt-1">
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
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-1"
                                >
                                  <nextAction.icon className="h-4 w-4" />
                                  <span>{nextAction.label}</span>
                                </button>
                              )}
                              
                              <Link 
                                to={`/mir/operator/tracking/${order.id}`}
                                className="text-blue-400 border border-blue-500 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-1"
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
                  <Package className="mx-auto h-16 w-16 text-green-400" />
                  <h3 className="mt-4 text-lg font-medium text-white">No hay órdenes asignadas</h3>
                  <p className="mt-2 text-sm text-green-200">Contacta a tu administrador para recibir asignaciones de órdenes.</p>
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
            <div className="bg-green-900/30 border border-green-600/50 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">⚠️ Permisos del Operador</h3>
              </div>
              <div className="text-green-100 space-y-2">
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