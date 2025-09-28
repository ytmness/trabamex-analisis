import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient.js';
import { Badge } from '@/components/ui/badge';
import { getPlanStats } from '@/utils/planCalculations';
import { 
  FileText,
  CheckSquare,
  Package,
  Bell,
  Settings,
  PlusCircle,
  BarChart2,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Truck,
  CreditCard,
  History,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Download,
  Eye,
  Box,
  LogOut,
  FlaskConical,
  Shield
} from 'lucide-react';

const DashboardPage = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeOrders, setActiveOrders] = useState([]);
  const [activeSuppliesRequests, setActiveSuppliesRequests] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [treatments, setTreatments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [planStats, setPlanStats] = useState({
    hasPlan: false,
    usage: 0,
    limit: 0,
    percentage: 0,
    planName: 'Sin plan asignado',
    remainingWeight: 0,
    nextCollection: null,
    isOverLimit: false
  });
  const [loadingPlanStats, setLoadingPlanStats] = useState(true);
  const [nextCollection, setNextCollection] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Acciones rápidas del cliente
  const quickActions = [
    { 
      name: 'Solicitar Recolección', 
      icon: PlusCircle, 
      path: '/mir/user/solicitar?tipo=recoleccion',
      description: 'Nueva solicitud de recolección'
    },
    { 
      name: 'Ver Tracking', 
      icon: Eye, 
      path: '/mir/user/tracking',
      description: 'Seguimiento en tiempo real'
    },
    { 
      name: 'Mi Plan', 
      icon: CreditCard, 
      path: '/mir/user/planes',
      description: 'Gestión de suscripción'
    },
    { 
      name: 'Servicios', 
      icon: Package, 
      path: '/mir/user/servicios',
      description: 'Servicios adicionales'
    },
    { 
      name: 'Reportar Incidencia', 
      icon: AlertCircle, 
      path: '/mir/user/mis-incidencias',
      description: 'Reportar problemas o incidencias'
    },
    { 
      name: 'Compliance (Checklist)', 
      icon: CheckSquare, 
      path: '/mir/user/checklist',
      description: 'Gestión de cumplimiento'
    },
    { 
      name: 'Solicitar Insumos', 
      icon: Box, 
      path: '/mir/user/solicitar-insumos',
      description: 'Solicitar insumos y materiales'
    },
    { 
      name: 'Configuración', 
      icon: Settings, 
      path: '/mir/user/configuracion',
      description: 'Configurar cuenta'
    }
  ];

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) return;
      setLoadingOrders(true);
      
      try {
        // Obtener todas las órdenes del usuario
        const { data: allOrdersData, error: ordersError } = await supabase
          .from('service_orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) throw ordersError;
        
        // Filtrar órdenes activas (no tratadas ni canceladas)
        const activeOrders = (allOrdersData || []).filter(order => 
          order.status !== 'TREATED' && 
          order.status !== 'CANCELLED' && 
          order.status !== 'CERTIFIED'
        );
        setActiveOrders(activeOrders);

        // Filtrar tratamientos (órdenes en proceso de tratamiento)
        const treatments = (allOrdersData || []).filter(order => 
          ['IN_TREATMENT', 'TREATED', 'CERTIFIED'].includes(order.status)
        );
        setTreatments(treatments);

        // Filtrar certificados (órdenes que deberían tener certificados)
        const certificates = (allOrdersData || []).filter(order => 
          // Órdenes con documentos adjuntos O órdenes que están en estados finales
          order.certificate_url || 
          order.manifest_url || 
          ['TREATED', 'CERTIFIED', 'COMPLETED', 'PROCESSED'].includes(order.status)
        );
        setCertificates(certificates);

        // Obtener solicitudes activas de insumos (supplies_requests)
        const { data: suppliesData, error: suppliesError } = await supabase
          .from('supplies_requests')
          .select('id, status, created_at')
          .eq('user_id', user.id)
          .neq('status', 'delivered')
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false });
        
        if (suppliesError) throw suppliesError;
        setActiveSuppliesRequests(suppliesData || []);

        // Cargar estadísticas del plan usando la función de cálculo
        setLoadingPlanStats(true);
        try {
          const stats = await getPlanStats(user.id);
          setPlanStats(stats);
        } catch (error) {
          console.error('Error loading plan stats:', error);
          setPlanStats({
            hasPlan: false,
            usage: 0,
            limit: 0,
            percentage: 0,
            planName: 'Error al cargar',
            remainingWeight: 0,
            nextCollection: null,
            isOverLimit: false
          });
        } finally {
          setLoadingPlanStats(false);
        }

        // Obtener próxima recolección programada
        const { data: nextCollectionData, error: nextCollectionError } = await supabase
          .from('service_orders')
          .select('id, status, created_at, notes')
          .eq('customer_id', user.id)
          .eq('status', 'SCHEDULED')
          .order('created_at', { ascending: true })
          .limit(1);
        
        if (nextCollectionData && nextCollectionData.length > 0) {
          const nextOrder = nextCollectionData[0];
          setNextCollection({
            date: new Date(nextOrder.created_at),
            time: '09:00', // Por defecto, se puede extraer de notes si está disponible
            address: nextOrder.notes || 'Dirección del cliente'
          });
        } else {
          setNextCollection(null);
        }

        // Simular notificaciones recientes
        setRecentNotifications([
          { id: 1, type: 'info', title: 'Recolección programada', body: 'Tu recolección ha sido programada para el 15 de septiembre', read: false, created_at: new Date() },
          { id: 2, type: 'success', title: 'Orden completada', body: 'La orden #12345 ha sido procesada exitosamente', read: true, created_at: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        ]);

        // Simular actividad reciente
        setRecentActivity([
          { id: 1, type: 'order_created', title: 'Nueva orden creada', description: 'Orden #12345 solicitada', timestamp: new Date() },
          { id: 2, type: 'collection_scheduled', title: 'Recolección programada', description: 'Programada para el 15 de septiembre', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
        ]);

      } catch (error) {
        console.error('Error cargando datos del cliente:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar datos',
          description: 'No se pudieron cargar algunos datos del dashboard',
        });
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchClientData();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      fetchClientData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, toast]);

  const handleActionClick = (path) => {
    if (path.startsWith('/')) {
      navigate(path);
    } else {
      navigate(`/mir/${profile.role}/${path}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const markNotificationAsRead = (notificationId) => {
    setRecentNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'PLANNED': 'bg-blue-100 text-blue-800',
      'EN_ROUTE_TO_PICKUP': 'bg-yellow-100 text-yellow-800',
      'ON_SITE_PICKUP': 'bg-orange-100 text-orange-800',
      'COLLECTED': 'bg-green-100 text-green-800',
      'EN_ROUTE_TO_DEPOT': 'bg-indigo-100 text-indigo-800',
      'AT_DEPOT': 'bg-purple-100 text-purple-800',
      'WEIGHED_VERIFIED': 'bg-teal-100 text-teal-800',
      'EN_ROUTE_TO_TREATMENT': 'bg-pink-100 text-pink-800',
      'IN_TREATMENT': 'bg-red-100 text-red-800',
      'TREATED': 'bg-emerald-100 text-emerald-800',
      'CERTIFIED': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusProgress = (status) => {
    const statusProgress = {
      'PLANNED': 0,
      'EN_ROUTE_TO_PICKUP': 15,
      'ON_SITE_PICKUP': 25,
      'COLLECTED': 35,
      'EN_ROUTE_TO_DEPOT': 45,
      'AT_DEPOT': 55,
      'WEIGHED_VERIFIED': 65,
      'EN_ROUTE_TO_TREATMENT': 75,
      'IN_TREATMENT': 85,
      'TREATED': 95,
      'CERTIFIED': 100
    };
    return statusProgress[status] || 0;
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Cliente MIR</title>
        <meta name="description" content="Panel de cliente para gestión de servicios y solicitudes." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl mx-6 mt-6 p-8 text-white shadow-lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold">¡Hola, {profile?.full_name || 'Cliente'}!</h1>
              <p className="mt-2 text-red-100 text-lg">Gestiona tus servicios de recolección de residuos</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{activeOrders.length + activeSuppliesRequests.length}</div>
                    <div className="text-sm text-red-100">Solicitudes activas</div>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await signOut();
                    navigate('/');
                    toast({
                      title: "Sesión cerrada",
                      description: "Has cerrado sesión exitosamente.",
                    });
                  } catch (error) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "No se pudo cerrar la sesión.",
                    });
                  }
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Estadísticas principales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Uso del Plan */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-600">Uso del Plan</p><button onClick={() => window.location.reload()} className="text-xs text-blue-600 hover:text-blue-800 underline">Actualizar</button></div>
                  {loadingPlanStats ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">Cargando...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-900">{planStats.percentage}%</p>
                      <p className="text-xs text-gray-500">
                        {planStats.hasPlan ? 'Progreso del ciclo' : 'Sin plan asignado'}
                      </p>
                    </>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${planStats.isOverLimit ? 'bg-red-100' : 'bg-red-100'}`}>
                  <TrendingUp className={`h-6 w-6 ${planStats.isOverLimit ? 'text-red-600' : 'text-red-600'}`} />
                </div>
              </div>
              {!loadingPlanStats && (
                <>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        planStats.isOverLimit 
                          ? 'bg-gradient-to-r from-red-600 to-red-700' 
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${Math.min(planStats.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      {planStats.usage} de {planStats.limit} kg recolectados (ciclo actual)
                    </p>
                    {planStats.hasPlan && (
                      <p className="text-xs text-gray-500">
                        Plan: {planStats.planName} • Restantes: {planStats.remainingWeight} kg • Precio: ${planStats.monthlyPrice}
                      </p>
                    )}
                    {planStats.isOverLimit && (
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ Has excedido el límite de tu plan
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Solicitudes Activas */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Solicitudes Activas</p>
                  <p className="text-2xl font-bold text-gray-900">{activeOrders.length + activeSuppliesRequests.length}</p>
                  <p className="text-xs text-gray-500">
                    {activeOrders.length} recolección{activeOrders.length !== 1 ? 'es' : ''}, {activeSuppliesRequests.length} insumo{activeSuppliesRequests.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Próxima Recolección */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próxima Recolección</p>
                  <p className="text-lg font-bold text-gray-900">
                    {nextCollection ? nextCollection.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Sin programar'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {nextCollection ? `${nextCollection.time} - ${nextCollection.address}` : 'No hay citas'}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Acciones Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
                <p className="text-gray-600">Accede rápidamente a las funciones más comunes</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.slice(0, 4).map((action, index) => (
                  <div
                    key={index}
                    onClick={() => handleActionClick(action.path)}
                    className="group cursor-pointer"
                  >
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-red-100 rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 border border-gray-200 hover:border-red-200">
                      <div className="bg-white group-hover:bg-red-100 p-3 rounded-lg mx-auto mb-3 w-12 h-12 flex items-center justify-center transition-colors">
                        <action.icon className="h-6 w-6 text-gray-600 group-hover:text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-red-700 block">{action.name}</span>
                      <p className="text-gray-500 text-xs mt-1 hidden group-hover:block">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {quickActions.slice(4).map((action, index) => (
                  <div
                    key={index + 4}
                    onClick={() => handleActionClick(action.path)}
                    className="group cursor-pointer"
                  >
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-red-100 rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 border border-gray-200 hover:border-red-200">
                      <div className="bg-white group-hover:bg-red-100 p-3 rounded-lg mx-auto mb-3 w-12 h-12 flex items-center justify-center transition-colors">
                        <action.icon className="h-6 w-6 text-gray-600 group-hover:text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-red-700 block">{action.name}</span>
                      <p className="text-gray-500 text-xs mt-1 hidden group-hover:block">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
              {/* Notificaciones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Bell className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Notificaciones</h2>
                      <p className="text-red-600 text-sm">10 recientes</p>
                    </div>
                  </div>
                </div>
                
                {recentNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {recentNotifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                          notification.read 
                            ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200' 
                            : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-1 rounded-lg ${
                            notification.type === 'info' ? 'bg-red-100' :
                            notification.type === 'success' ? 'bg-green-100' :
                            'bg-yellow-100'
                          }`}>
                            <AlertCircle className="h-3 w-3 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium text-xs ${
                              notification.read ? 'text-gray-600' : 'text-gray-800'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.body}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Bell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">No tienes notificaciones nuevas</p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-red-300 text-red-600 hover:bg-red-50"
                  asChild
                >
                  <Link to="/mir/user/notificaciones">
                    Ver Todas
                  </Link>
                </Button>
              </motion.div>


              {/* Órdenes Activas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Solicitudes Activas</h2>
                        <p className="text-red-600 text-sm">{activeOrders.length + activeSuppliesRequests.length} total</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Link to="/mir/user/historial">
                        Ver Todas
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {loadingOrders ? (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                  </div>
                ) : (activeOrders.length > 0 || activeSuppliesRequests.length > 0) ? (
                  <div className="space-y-2">
                    {/* Mostrar órdenes de recolección */}
                    {activeOrders.slice(0, 2).map(order => (
                      <div key={`order-${order.id}`} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:border-red-300 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 p-2 rounded-lg">
                            <Truck className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">Recolección #{order.id.substring(0, 8)}</p>
                            <p className="text-xs text-gray-600">{order.status}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(order.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                    {/* Mostrar solicitudes de insumos */}
                    {activeSuppliesRequests.slice(0, 2).map(request => (
                      <div key={`supply-${request.id}`} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">Insumos #{request.id.substring(0, 8)}</p>
                            <p className="text-xs text-gray-600">{request.status}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(request.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">No hay solicitudes activas</p>
                  </div>
                )}
              </motion.div>

              {/* Sección de Tratamientos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <FlaskConical className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Estado de Tratamientos</h2>
                        <p className="text-red-600 text-sm">{treatments.length} en proceso</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Link to="/mir/user/tracking">
                        Ver Todos
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {treatments.length > 0 ? (
                  <div className="space-y-2">
                    {treatments.slice(0, 3).map((treatment) => (
                      <div key={treatment.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:border-red-300 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 p-2 rounded-lg">
                            <FlaskConical className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              Orden #{treatment.id.substring(0,8)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {treatment.tipo_residuo && `Tipo: ${treatment.tipo_residuo}`}
                              {treatment.quantity && ` • ${treatment.quantity} ${treatment.unit || 'kg'}`}
                            </p>
                            {treatment.treatment_process && (
                              <p className="text-xs text-blue-600 font-medium">
                                Proceso: {treatment.treatment_process}
                              </p>
                            )}
                            {treatment.treatment_started_at && (
                              <p className="text-xs text-gray-500">
                                Iniciado: {new Date(treatment.treatment_started_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${
                            treatment.status === 'IN_TREATMENT' ? 'bg-blue-100 text-blue-800' :
                            treatment.status === 'TREATED' ? 'bg-yellow-100 text-yellow-800' :
                            treatment.status === 'CERTIFIED' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {treatment.status === 'IN_TREATMENT' ? 'En Tratamiento' :
                             treatment.status === 'TREATED' ? 'Tratado' :
                             treatment.status === 'CERTIFIED' ? 'Certificado' :
                             treatment.status}
                          </Badge>
                          <Link 
                            to={`/mir/user/tracking/${treatment.id}`}
                            className="text-red-600 border border-red-300 hover:bg-red-50 px-2 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Ver</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FlaskConical className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">No hay tratamientos en proceso</p>
                  </div>
                )}
              </motion.div>

              {/* Sección de Certificaciones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Certificaciones y Documentos</h2>
                        <p className="text-green-600 text-sm">{certificates.length} disponibles</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Link to="/mir/user/certificados">
                        Ver Todos
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {certificates.length > 0 ? (
                  <div className="space-y-2">
                    {certificates.slice(0, 3).map((certificate) => (
                      <div key={certificate.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:border-green-300 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Shield className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              Orden #{certificate.id.substring(0,8)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {certificate.tipo_residuo && `Tipo: ${certificate.tipo_residuo}`}
                              {certificate.quantity && ` • ${certificate.quantity} ${certificate.unit || 'kg'}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${
                            certificate.status === 'CERTIFIED' ? 'bg-green-100 text-green-800' :
                            certificate.status === 'TREATED' ? 'bg-yellow-100 text-yellow-800' :
                            certificate.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            certificate.status === 'PROCESSED' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {certificate.status === 'CERTIFIED' ? 'Certificado' :
                             certificate.status === 'TREATED' ? 'Tratado' :
                             certificate.status === 'COMPLETED' ? 'Completado' :
                             certificate.status === 'PROCESSED' ? 'Procesado' :
                             certificate.status}
                          </Badge>
                          <div className="flex space-x-1">
                            {certificate.certificate_url ? (
                              <button
                                onClick={() => window.open(certificate.certificate_url, '_blank')}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                              >
                                <Download className="h-3 w-3" />
                                <span>Cert</span>
                              </button>
                            ) : (
                              <span className="bg-gray-200 text-gray-500 px-2 py-1 rounded text-xs">
                                Sin Cert
                              </span>
                            )}
                            {certificate.manifest_url ? (
                              <button
                                onClick={() => window.open(certificate.manifest_url, '_blank')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                              >
                                <Download className="h-3 w-3" />
                                <span>Manif</span>
                              </button>
                            ) : (
                              <span className="bg-gray-200 text-gray-500 px-2 py-1 rounded text-xs">
                                Sin Manif
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Shield className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">No hay certificados disponibles</p>
                  </div>
                )}
              </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;