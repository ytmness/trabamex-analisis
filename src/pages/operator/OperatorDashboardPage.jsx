import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  Map, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Play,
  Pause,
  StopCircle,
  Package,
  AlertTriangle,
  CheckSquare,
  History
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { LogOut } from 'lucide-react';
import supabase from '../../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { THEME_CONFIG, ROLE_FUNCTIONS } from '@/lib/themeConfig';

const OperatorDashboardPage = () => {
  const { profile, user, signOut } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const theme = THEME_CONFIG.operator;
  const operatorFunctions = ROLE_FUNCTIONS.operator;

  const fetchOperatorData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Obtener rutas asignadas al operador
      const { data: routesData, error: routesError } = await supabase
        .from('service_orders')
        .select(`
          id,
          created_at,
          status,
          id
        `)
        .eq('operator_id', user.id)
        .order('created_at', { ascending: true });

      if (routesError) throw routesError;

      // Obtener órdenes pendientes que el operador puede procesar
      const { data: ordersData, error: ordersError } = await supabase
        .from('service_orders')
        .select(`
          *,
          customer:profiles(full_name, company)
        `)
        .in('status', ['PENDING', 'PENDIENTE', 'EN_PROCESO', 'EN_RUTA', 'COMPLETADO'])
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // Verificar que routesData sea un array válido
      if (Array.isArray(routesData)) {
        setRoutes(routesData.map(r => ({...r, stops: r.stops?.[0]?.count || 0})));
      } else {
        setRoutes([]);
      }
      
      // Verificar que ordersData sea un array válido
      if (Array.isArray(ordersData)) {
        setPendingOrders(ordersData);
      } else {
        setPendingOrders([]);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar datos',
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
        description: `La orden se ha marcado como ${newStatus}`,
      });

      // Recargar datos
      fetchOperatorData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: error.message,
      });
    }
  };

  const approveRoute = async (routeId) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: 'APROBADA' })
        .eq('id', routeId);

      if (error) throw error;

      toast({
        title: 'Ruta aprobada',
        description: 'La ruta ha sido aprobada exitosamente',
      });

      fetchOperatorData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al aprobar',
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchOperatorData();
  }, [fetchOperatorData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-400 mx-auto mb-4" />
          <p className="text-white text-lg">Cargando dashboard operativo...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Operador MIR</title>
        <meta name="description" content="Dashboard del operador para gestionar rutas y cambiar estados de órdenes." />
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
                  {operatorFunctions.title}
                </h1>
                <p className="mt-2 text-green-100 text-lg">{operatorFunctions.subtitle}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-green-600/50 px-4 py-2 rounded-full border border-green-500">
                  <Truck className="h-6 w-6 text-green-200" />
                  <span className="text-white font-semibold text-sm">OPERADOR</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Resumen de Actividad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Rutas Asignadas</p>
                  <div className="text-3xl font-bold text-white mt-1">{routes?.length || 0}</div>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <Truck className="h-8 w-8 text-blue-200" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 shadow-lg border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Órdenes Pendientes</p>
                  <div className="text-3xl font-bold text-white mt-1">{pendingOrders?.length || 0}</div>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-full">
                  <AlertCircle className="h-8 w-8 text-yellow-200" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Rutas Activas</p>
                  <div className="text-3xl font-bold text-white mt-1">
                    {routes?.filter(r => r?.status === 'EN_PROCESO')?.length || 0}
                  </div>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <Play className="h-8 w-8 text-green-200" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Funciones del Operador */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-green-600">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Funciones del Operador</h2>
                <p className="text-green-200">Acciones que puedes realizar en el sistema</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {operatorFunctions.functions.map((func, index) => (
                  <Link key={index} to={func.route} className="group block">
                    <div className={`w-full bg-gradient-to-br from-${func.color}-600 to-${func.color}-700 hover:from-${func.color}-500 hover:to-${func.color}-600 rounded-lg p-6 text-center transition-all duration-200 transform hover:scale-105 border border-${func.color}-500/20`}>
                      {func.icon === 'Map' && <Map className="h-8 w-8 text-green-200 mx-auto mb-3 group-hover:scale-110 transition-transform" />}
                      {func.icon === 'Package' && <Package className="h-8 w-8 text-yellow-200 mx-auto mb-3 group-hover:scale-110 transition-transform" />}
                      {func.icon === 'AlertTriangle' && <AlertTriangle className="h-8 w-8 text-red-200 mx-auto mb-3 group-hover:scale-110 transition-transform" />}
                      {func.icon === 'CheckSquare' && <CheckSquare className="h-8 w-8 text-blue-200 mx-auto mb-3 group-hover:scale-110 transition-transform" />}
                      {func.icon === 'Clock' && <Clock className="h-8 w-8 text-gray-200 mx-auto mb-3 group-hover:scale-110 transition-transform" />}
                      <span className="text-white font-medium text-sm">{func.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Rutas Asignadas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-green-600">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Mis Rutas Asignadas</h2>
                <p className="text-green-200">Gestiona las rutas que tienes asignadas</p>
              </div>
              
              {routes?.length > 0 ? (
                <div className="space-y-4">
                  {routes.map((route, index) => (
                    <motion.div
                      key={route.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-green-900/30 rounded-lg p-4 border border-green-600/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Map className="h-5 w-5 text-green-400" />
                          <div>
                            <div className="font-medium text-white">
                              Ruta del {format(new Date(route.created_at), 'EEEE, dd LLLL', { locale: es })}
                            </div>
                            <div className="text-sm text-green-200">
                              ID: {route.id.substring(0,8)} • {route.stops} parada(s)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            route.status === 'EN_PROCESO' ? 'bg-green-100 text-green-800' :
                            route.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {route.status || 'Planeada'}
                          </span>
                          {route.status === 'PENDIENTE' && (
                            <button
                              onClick={() => approveRoute(route.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                            >
                              Aprobar
                            </button>
                          )}
                          <Link 
                            to={`/mir/operator/route/${route.id}`}
                            className="text-blue-400 border border-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 rounded-md text-sm transition-colors"
                          >
                            Ver Detalles
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-white">No hay rutas asignadas</h3>
                  <p className="mt-1 text-sm text-green-200">Contacta a tu administrador para recibir asignaciones.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Órdenes Pendientes - Solo Cambiar Estados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-green-600">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Órdenes Pendientes</h2>
                <p className="text-green-200">Cambia el estado de las órdenes según procedas</p>
              </div>
              
              {pendingOrders?.length > 0 ? (
                <div className="space-y-4">
                  {pendingOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-green-900/30 rounded-lg p-4 border border-green-600/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Package className="h-5 w-5 text-green-400" />
                          <div className="flex-1">
                            <div className="font-medium text-white">Orden #{order.id.substring(0,8)}</div>
                            <div className="text-sm text-green-200">
                              {order.customer?.full_name || order.client_name || 'Cliente'} • {format(new Date(order.created_at), 'dd/MM/yyyy')}
                            </div>
                            {/* Detalles adicionales */}
                            <div className="text-xs text-green-300 mt-1">
                              {order.tipo_residuo && `Tipo: ${order.tipo_residuo}`}
                              {order.quantity && ` • Cantidad: ${order.quantity} ${order.unit || 'Kg'}`}
                              {order.clave && ` • Clave: ${order.clave}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'EN_PROCESO' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'EN_RUTA' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'COMPLETADO' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                          <div className="flex space-x-2">
                            {/* Botón para cambiar a PENDIENTE */}
                            {order.status !== 'PENDIENTE' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'PENDIENTE')}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center"
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Pendiente
                              </button>
                            )}
                            
                            {/* Botón para cambiar a EN_PROCESO */}
                            {order.status !== 'EN_PROCESO' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'EN_PROCESO')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                En Proceso
                              </button>
                            )}
                            
                            {/* Botón para cambiar a EN_RUTA */}
                            {order.status !== 'EN_RUTA' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'EN_RUTA')}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center"
                              >
                                <Truck className="h-4 w-4 mr-1" />
                                En Ruta
                              </button>
                            )}
                            
                            {/* Botón para cambiar a COMPLETADO */}
                            {order.status !== 'COMPLETADO' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'COMPLETADO')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completado
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-white">No hay órdenes pendientes</h3>
                  <p className="mt-1 text-sm text-green-200">Todas las órdenes están procesadas.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Información de Permisos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
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
                  <li>• ✅ Aprobar rutas asignadas</li>
                  <li>• ✅ Ver detalles de rutas y órdenes</li>
                  <li>• ❌ NO puedes editar o eliminar órdenes</li>
                  <li>• ❌ NO puedes modificar información de clientes</li>
                  <li>• ❌ NO puedes crear nuevas rutas</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OperatorDashboardPage;
