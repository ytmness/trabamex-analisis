import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient.js';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Shield,
  X
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
  
  // Estados para múltiples planes
  const [userPlans, setUserPlans] = useState([]);
  const [planStats, setPlanStats] = useState({});
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanTab, setSelectedPlanTab] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [nextCollection, setNextCollection] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [hiddenOrders, setHiddenOrders] = useState(new Set());
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [allOrdersData, setAllOrdersData] = useState([]);

  // Cargar órdenes ocultas del localStorage al inicializar
  useEffect(() => {
    const savedHiddenOrders = localStorage.getItem('hiddenOrders');
    if (savedHiddenOrders) {
      try {
        const hiddenOrderIds = JSON.parse(savedHiddenOrders);
        setHiddenOrders(new Set(hiddenOrderIds));
      } catch (error) {
        console.error('Error cargando órdenes ocultas:', error);
      }
    }
  }, []);

  // Función para reintentos automáticos
  const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await fn();
        setConnectionError(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        console.warn(`Intento ${i + 1} falló:`, error);
        
        if (i === maxRetries - 1) {
          setConnectionError(true);
          setRetryCount(i + 1);
          throw error;
        }
        
        // Esperar antes del siguiente intento (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  };

  // Acciones rápidas simplificadas como Hostinger
  const quickActions = [
    { 
      name: 'Manifiestos', 
      icon: FileText, 
      path: '/mir/user/manifiestos',
      description: 'Ver documentos oficiales'
    },
    { 
      name: 'Checklist', 
      icon: CheckSquare, 
      path: '/mir/user/checklist',
      description: 'Gestión de cumplimiento'
    },
    { 
      name: 'Insumos', 
      icon: Package, 
      path: '/mir/user/solicitar-insumos',
      description: 'Solicitar materiales'
    },
    { 
      name: 'Incidencias', 
      icon: AlertCircle, 
      path: '/mir/user/mis-incidencias',
      description: 'Reportar problemas o incidencias'
    },
  ];

  useEffect(() => {
    const fetchClientData = async () => {
      if (!profile?.id) return;
      setLoadingOrders(true);
      setLoadingPlans(true);
      
      try {
        // Obtener todos los planes del usuario con reintentos
        const { data: plansData, error: plansError } = await retryWithBackoff(async () => {
          const result = await supabase.rpc('get_user_plans', {
            p_user_id: profile?.id
          });
          if (result.error) throw result.error;
          return result;
        });

        if (plansError) throw plansError;
        setUserPlans(plansData || []);
        
        // Si hay planes y no hay uno seleccionado, establecer el primero como seleccionado
        if (plansData && plansData.length > 0 && !selectedPlanTab) {
          setSelectedPlanTab(plansData[0].plan_id);
        }

        // Obtener todas las órdenes del usuario
        const { data: ordersData, error: ordersError } = await supabase
          .from('service_orders')
          .select('*')
          .eq('customer_id', profile?.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) throw ordersError;
        
        // Guardar todos los datos de órdenes
        setAllOrdersData(ordersData || []);

        // Filtrar tratamientos (órdenes en proceso de tratamiento)
        const treatments = (ordersData || []).filter(order => 
          ['IN_TREATMENT', 'TREATED', 'CERTIFIED'].includes(order.status)
        );
        setTreatments(treatments);

        // Filtrar certificados (órdenes que deberían tener certificados)
        const certificates = (ordersData || []).filter(order => 
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
          .eq('user_id', profile?.id)
          .neq('status', 'delivered')
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false });
        
        if (suppliesError) throw suppliesError;
        setActiveSuppliesRequests(suppliesData || []);

        // Cargar estadísticas para cada plan
        const allPlanStats = {};
        for (const plan of plansData || []) {
          try {
            const { data: statsData, error: statsError } = await supabase.rpc('get_plan_stats', {
              p_user_id: profile?.id,
              p_plan_id: plan.plan_id
            });
            
            if (!statsError && statsData && statsData.length > 0) {
              allPlanStats[plan.plan_id] = statsData[0];
            }
        } catch (error) {
            console.error('Error loading plan stats for:', plan.plan_id, error);
          }
        }
        setPlanStats(allPlanStats);

        // Obtener próxima recolección programada
        const { data: nextCollectionData, error: nextCollectionError } = await supabase
          .from('service_orders')
          .select('id, status, created_at, notes')
          .eq('customer_id', profile?.id)
          .eq('status', 'SCHEDULED')
          .order('created_at', { ascending: true })
          .limit(1);
        
        if (nextCollectionData && nextCollectionData.length > 0) {
          const nextOrder = nextCollectionData[0];
          setNextCollection({
            date: new Date(nextOrder.created_at),
            time: '09:00',
            address: nextOrder.notes || 'Dirección del cliente'
          });
        } else {
          // No hay recolecciones programadas
          setNextCollection(null);
        }

        // Para ahora no tenemos notificaciones reales implementadas
        setRecentNotifications([]);

      } catch (error) {
        console.error('Error cargando datos del cliente:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar datos',
          description: 'No se pudieron cargar algunos datos del dashboard',
        });
      } finally {
        setLoadingOrders(false);
        setLoadingPlans(false);
      }
    };

    fetchClientData();
    
    // Auto-refresh con frecuencia adaptativa
    const refreshInterval = connectionError ? 60000 : 30000; // 1 min si hay error, 30 seg normal
    const interval = setInterval(() => {
      fetchClientData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [profile?.id, toast, connectionError]);

  // Función para filtrar órdenes activas
  const filterActiveOrders = (ordersData, hiddenOrdersSet) => {
    return (ordersData || []).filter(order => {
      // Si está cancelada, solo la incluimos si no está oculta
      if (order.status === 'cancelled') {
        return !hiddenOrdersSet.has(order.id);
      }
      // Para otros estados, aplicar filtro normal
      return order.status !== 'TREATED' && 
             order.status !== 'CERTIFIED';
    });
  };

  // useEffect para actualizar órdenes activas cuando cambien los datos o las órdenes ocultas
  useEffect(() => {
    if (allOrdersData.length > 0) {
      const filteredOrders = filterActiveOrders(allOrdersData, hiddenOrders);
      setActiveOrders(filteredOrders);
    }
  }, [allOrdersData, hiddenOrders]);

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

  const hideCancelledOrder = (orderId) => {
    const newHiddenOrders = new Set([...hiddenOrders, orderId]);
    setHiddenOrders(newHiddenOrders);
    
    // Guardar en localStorage
    try {
      localStorage.setItem('hiddenOrders', JSON.stringify([...newHiddenOrders]));
    } catch (error) {
      console.error('Error guardando órdenes ocultas:', error);
    }
    
    // Actualizar la lista de órdenes activas inmediatamente
    setActiveOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const clearHiddenOrders = () => {
    setHiddenOrders(new Set());
    try {
      localStorage.removeItem('hiddenOrders');
    } catch (error) {
      console.error('Error limpiando órdenes ocultas:', error);
    }
    // Recargar los datos para mostrar todas las órdenes
    window.location.reload();
  };

  const getPlanIcon = (planType) => {
    switch(planType) {
      case 'RPBI': return '🏥';
      case 'RP': return '⚗️';
      case 'RME': return '🌱';
      case 'FISCAL': return '🔒';
      default: return '📦';
    }
  };

  const getPlanTypeName = (planType) => {
    switch(planType) {
      case 'RPBI': return 'Biológico-Infecciosos';
      case 'RP': return 'Peligrosos';
      case 'RME': return 'Manejo Especial';
      case 'FISCAL': return 'Destrucción Fiscal';
      default: return planType;
    }
  };

  const getCurrentPlanStats = () => {
    return selectedPlanTab ? planStats[selectedPlanTab] : null;
  };

  const getOrdersForPlan = (planId) => {
    // Filtrar órdenes del plan específico, excluyendo las canceladas que están ocultas
    return filterActiveOrders(allOrdersData, hiddenOrders).filter(order => order.plan_id === planId);
  };

  const renderPlanTabContent = (plan) => {
    const stats = planStats[plan.plan_id] || {};
    const planOrders = getOrdersForPlan(plan.plan_id);

    return (
      <div className="space-y-6">
        {/* Estadísticas del plan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Uso del Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="bg-white p-6 rounded-lg shadow-md border"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-500">Uso del Plan</h3>
              <button 
                onClick={() => window.location.reload()} 
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Actualizar
              </button>
            </div>
            {loadingPlans ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.has_plan ? `${stats.percentage || 0}%` : 'Sin datos'}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.has_plan ? `${stats.usage_kg || 0} de ${stats.limit_kg || 0} kg recolectados` : 'Configura tu plan'}
                </p>
                {stats.is_over_limit && (
                  <p className="text-xs text-red-600 font-medium">
                    ⚠️ Has excedido el límite de tu plan
                  </p>
                )}
              </>
            )}
          </motion.div>

          {/* Solicitudes del Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="bg-white p-6 rounded-lg shadow-md border"
          >
            <h3 className="font-semibold text-gray-500">Solicitudes Activas</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{planOrders.length}</p>
            <p className="text-sm text-gray-500">
              {planOrders.length} solicitud{planOrders.length !== 1 ? 'es' : ''} activa{planOrders.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          {/* Residuos Restantes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }} 
            className="bg-white p-6 rounded-lg shadow-md border"
          >
            <h3 className="font-semibold text-gray-500">Residuos Restantes</h3>
            {stats.has_plan ? (
              <>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {stats.remaining_kg || 0} kg
                </p>
                <p className="text-sm text-gray-500">
                  Disponibles en tu plan
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  Sin plan
                </p>
                <p className="text-sm text-gray-500">
                  Asigna un plan primero
                </p>
              </>
            )}
          </motion.div>
        </div>

        {/* Órdenes del Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }} 
          className="bg-white p-6 rounded-lg shadow-md border"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">{getPlanIcon(plan.plan_type)}</span>
            Solicitudes de {getPlanTypeName(plan.plan_type)}
          </h2>
          {loadingOrders ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
          ) : planOrders.length > 0 ? (
            <div className="space-y-3">
              {planOrders.slice(0, 5).map(order => (
                <div key={`order-${order.id}`} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 transition-colors border">
                  <div>
                    <p className="font-semibold text-gray-800">Orden #{order.id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      Solicitada: {new Date(order.created_at).toLocaleDateString()} • 
                      {order.quantity} {order.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${
                      order.status === 'EN_ROUTE_TO_PICKUP' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'PROGRAMADO' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'EN_ROUTE_TO_PICKUP' ? 'EN_RUTA' :
                       order.status === 'SCHEDULED' ? 'PROGRAMADO' :
                       order.status === 'PROGRAMADO' ? 'PROGRAMADO' :
                       order.status === 'cancelled' ? 'CANCELADA' :
                       order.status}
                    </Badge>
                    {order.status === 'cancelled' && (
                      <button
                        onClick={() => hideCancelledOrder(order.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Ocultar orden cancelada"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No tienes solicitudes activas para este plan.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to={`/mir/${profile?.role}/solicitar`}>
                  Nueva Solicitud
                </Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - MIR</title>
        <meta name="description" content="Dashboard principal del sistema MIR." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header simplificado como Hostinger */}
        <div className="bg-red-700 text-white rounded-lg shadow-lg p-6 mx-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center"
          >
            <div>
              <h1 className="text-2xl font-bold">Bienvenido a tu Dashboard</h1>
              <p className="text-red-100">Gestiona tus servicios de forma rápida y sencilla.</p>
            </div>
            <Button asChild className="bg-white text-red-700 hover:bg-red-100 font-bold hidden sm:flex">
               <Link to={`/mir/${profile?.role}/solicitar`}>
                  Solicitar Recolección <PlusCircle className="ml-2 h-4 w-4"/>
               </Link>
              </Button>
          </motion.div>
        </div>

        {/* Mensaje de error de conexión */}
        {connectionError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mx-6 mt-4 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <div>
                <p className="font-semibold">Problema de conexión</p>
                <p className="text-sm">
                  No se pudo conectar con el servidor. Se intentará reconectar automáticamente.
                  {retryCount > 0 && ` (Intento ${retryCount}/3)`}
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="ml-4 bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Reintentar ahora
              </Button>
            </div>
          </motion.div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Botón instructor de vista de plan */}
          <div className="flex justify-end mb-6">
            <Button
              variant="outline"
              className="bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              onClick={() => setShowPlanModal(true)}
              disabled={userPlans.length === 0}
            >
              <Package className="h-4 w-4 mr-2" />
              Vista de Plan
            </Button>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Uso del Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }} 
              className="bg-white p-6 rounded-lg shadow-md border"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-500">Uso del Plan</h3>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Actualizar
                </button>
              </div>
              {loadingPlans ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">Cargando...</span>
                    </div>
                  ) : (
                    <>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {selectedPlanTab ? (() => {
                      const stats = planStats[selectedPlanTab] || {};
                      return stats.has_plan ? `${stats.percentage || 0}%` : 'Sin datos';
                    })() : 'Sin plan'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedPlanTab ? (() => {
                      const stats = planStats[selectedPlanTab] || {};
                      return stats.has_plan ? `${stats.usage_kg || 0} de ${stats.limit_kg || 0} kg recolectados` : 'Configura tu plan';
                    })() : 'Selecciona un plan'}
                  </p>
                  {selectedPlanTab && planStats[selectedPlanTab]?.is_over_limit && (
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ Has excedido el límite de tu plan
                      </p>
                    )}
                </>
              )}
            </motion.div>

            {/* Solicitudes Activas */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }} 
              className="bg-white p-6 rounded-lg shadow-md border"
            >
              <h3 className="font-semibold text-gray-500">Solicitudes Activas</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{activeOrders.length + activeSuppliesRequests.length}</p>
              <p className="text-sm text-gray-500">
                    {activeOrders.length} recolección{activeOrders.length !== 1 ? 'es' : ''}, {activeSuppliesRequests.length} insumo{activeSuppliesRequests.length !== 1 ? 's' : ''}
                  </p>
            </motion.div>

            {/* Próxima Recolección */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }} 
              className="bg-white p-6 rounded-lg shadow-md border"
            >
              <h3 className="font-semibold text-gray-500">Próxima Recolección</h3>
              {nextCollection ? (
                <>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {nextCollection.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {nextCollection.address || 'Programada'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    Sin programar
                  </p>
                  <p className="text-sm text-gray-500">
                    No tienes recolecciones programadas
                  </p>
                </>
              )}
            </motion.div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
          {/* Acciones Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }} 
                className="bg-white p-6 rounded-lg shadow-md border"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action) => (
                  <div
                      key={action.name}
                    onClick={() => handleActionClick(action.path)}
                      className="text-center p-4 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors flex flex-col items-center justify-center space-y-2 border"
                  >
                      <div className="bg-gray-100 p-3 rounded-full">
                        <action.icon className="h-6 w-6 text-gray-600" />
                      </div>
                      <span className="font-medium text-sm text-gray-700">{action.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Órdenes Activas */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.6 }} 
                className="bg-white p-6 rounded-lg shadow-md border"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">Órdenes Activas</h2>
                {loadingOrders ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : (activeOrders.length > 0 || activeSuppliesRequests.length > 0) ? (
                  <div className="space-y-3">
                    {/* Mostrar órdenes de recolección */}
                    {activeOrders.slice(0, 2).map(order => (
                      <div key={`order-${order.id}`} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 transition-colors border">
                        <div>
                          <p className="font-semibold text-gray-800">Orden #{order.id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">Solicitada: {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            order.status === 'EN_ROUTE_TO_PICKUP' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'PROGRAMADO' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'EN_ROUTE_TO_PICKUP' ? 'EN_RUTA' :
                             order.status === 'SCHEDULED' ? 'PROGRAMADO' :
                             order.status === 'PROGRAMADO' ? 'PROGRAMADO' :
                             order.status === 'cancelled' ? 'CANCELADA' :
                             order.status}
                          </Badge>
                          {order.status === 'cancelled' && (
                            <button
                              onClick={() => hideCancelledOrder(order.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                              title="Ocultar orden cancelada"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {/* Mostrar solicitudes de insumos */}
                    {activeSuppliesRequests.slice(0, 2).map(request => (
                      <div key={`supply-${request.id}`} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 transition-colors border">
                        <div>
                          <p className="font-semibold text-gray-800">Insumos #{request.id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">Solicitada: {new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                        <Badge variant="outline" className="text-xs">
                          {request.status}
                        </Badge>
                  </div>
                ))}
              </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No tienes órdenes activas en este momento.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to={`/mir/${profile?.role}/solicitar`}>
                        Solicitar Recolección
                      </Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Panel derecho */}
            <div className="space-y-8">
              {/* Notificaciones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }} 
                className="bg-white p-6 rounded-lg shadow-md border"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-gray-600"/> Notificaciones
                </h2>
                {recentNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {recentNotifications.slice(0, 3).map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                          notification.read 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-red-50 border-red-200'
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
                    <p className="text-gray-500 text-sm">No tienes notificaciones nuevas.</p>
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

              {/* Ajustes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }} 
                className="bg-white p-6 rounded-lg shadow-md border"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600"/> Ajustes
                </h2>
                <div className="space-y-3">
                  <Link 
                    to="/mir/user/planes"
                    className="block text-gray-700 hover:text-red-600 transition-colors"
                  >
                    Ver todos los planes
                  </Link>
                  <Link 
                    to="/mir/user/perfil"
                    className="block text-gray-700 hover:text-red-600 transition-colors"
                  >
                    Perfil de la empresa
                  </Link>
                  {hiddenOrders.size > 0 && (
                    <button
                      onClick={clearHiddenOrders}
                      className="block text-orange-600 font-semibold hover:text-orange-800 transition-colors w-full text-left"
                      title={`Restaurar ${hiddenOrders.size} órdenes ocultas`}
                    >
                      Mostrar {hiddenOrders.size} orden{hiddenOrders.size !== 1 ? 'es' : ''} oculta{hiddenOrders.size !== 1 ? 's' : ''}
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block text-red-600 font-semibold hover:text-red-800 transition-colors w-full text-left"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Modal para selección de planes */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Seleccionar Vista de Plan</h3>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {userPlans.map(plan => (
                  <button
                    key={plan.plan_id}
                    onClick={() => {
                      setSelectedPlanTab(plan.plan_id);
                      setShowPlanModal(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedPlanTab === plan.plan_id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getPlanIcon(plan.plan_type)}</span>
                      <div>
                        <div className="font-medium text-gray-900">{plan.plan_name}</div>
                        <div className="text-sm text-gray-500">
                          {getPlanTypeName(plan.plan_type)} • {plan.monthly_price ? `$${plan.monthly_price}/mes` : 'Sin precio'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                
                {userPlans.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No tienes planes asignados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage;