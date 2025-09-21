import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Truck, 
  Map, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Play,
  Calendar,
  Package,
  Eye
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import supabase from "../../lib/customSupabaseClient.js";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const OperatorRoutesPage = () => {
  const { profile, user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOperatorRoutes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      console.log('🔍 Debugging fetchOperatorRoutes:');
      console.log('User ID:', user.id);
      console.log('User object:', user);
      
      // Obtener órdenes de recolección (service_orders) asignadas al operador
      const { data: ordersData, error: ordersError } = await supabase
        .from("service_orders")
        .select(`
          id,
          status,
          created_at,
          client_name,
          operator_id,
          customer_id
        `)
        .eq("operator_id", user.id)
        .in("status", ["PENDING", "PENDIENTE", "EN_PROCESO", "EN_RUTA", "COMPLETADO", "COLLECTED"])
        .order("created_at", { ascending: false });

      console.log('📊 Query results:');
      console.log('Orders data:', ordersData);
      console.log('Orders error:', ordersError);
      console.log('Orders count:', ordersData?.length || 0);

      if (ordersError) {
        console.error('❌ Error en la consulta:', ordersError);
        throw ordersError;
      }

      // Verificar que ordersData sea un array válido
      if (Array.isArray(ordersData)) {
        console.log('✅ Datos válidos recibidos:', ordersData.length, 'órdenes');
        setRoutes(ordersData);
      } else {
        console.log('⚠️ Datos no válidos, estableciendo array vacío');
        setRoutes([]);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar rutas de recolección",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const approveRoute = async (routeId) => {
    try {
      const { error } = await supabase
        .from("service_orders")
        .update({ status: "EN_PROCESO" })
        .eq("id", routeId);

      if (error) throw error;

      toast({
        title: "Orden aprobada",
        description: "La orden de recolección ha sido aprobada exitosamente",
      });

      fetchOperatorRoutes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al aprobar",
        description: error.message,
      });
    }
  };

  const startRoute = async (routeId) => {
    try {
      const { error } = await supabase
        .from("service_orders")
        .update({ status: "EN_RUTA" })
        .eq("id", routeId);

      if (error) throw error;

      toast({
        title: "Orden iniciada",
        description: "La orden de recolección ha comenzado exitosamente",
      });

      fetchOperatorRoutes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al iniciar",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchOperatorRoutes();
  }, [fetchOperatorRoutes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando rutas de recolección...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800";
      case "EN_PROCESO":
        return "bg-blue-100 text-blue-800";
      case "EN_RUTA":
        return "bg-purple-100 text-purple-800";
      case "COMPLETADO":
      case "COLLECTED":
        return "bg-green-100 text-green-800";
      case "TREATED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
      case "PENDIENTE":
        return <Clock className="h-4 w-4" />;
      case "EN_PROCESO":
        return <Play className="h-4 w-4" />;
      case "EN_RUTA":
        return <Truck className="h-4 w-4" />;
      case "COMPLETADO":
      case "COLLECTED":
        return <CheckCircle className="h-4 w-4" />;
      case "TREATED":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getNextAction = (currentStatus) => {
    switch (currentStatus) {
      case "PENDING":
      case "PENDIENTE":
        return { action: "approve", label: "Aprobar", icon: CheckCircle };
      case "EN_PROCESO":
        return { action: "start", label: "Iniciar", icon: Play };
      case "EN_RUTA":
        return { action: "complete", label: "Completar", icon: CheckCircle };
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Mis Rutas de Recolección - Operador MIR</title>
        <meta name="description" content="Gestiona las órdenes de recolección asignadas como operador." />
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
                <h1 className="text-4xl font-bold">
                  Mis Rutas de Recolección
                </h1>
                <p className="mt-2 text-red-100 text-lg">Gestiona las órdenes de recolección asignadas</p>
              </div>
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Truck className="h-6 w-6 text-red-200" />
                <span className="text-white font-semibold text-sm">OPERADOR</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estadísticas principales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Recolecciones */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Recolecciones</p>
                  <p className="text-2xl font-bold text-gray-900">{routes?.length || 0}</p>
                  <p className="text-xs text-gray-500">Asignadas</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <Truck className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Pendientes */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {routes?.filter(r => r?.status === "PENDING" || r?.status === "PENDIENTE")?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Por procesar</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* En Proceso */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Proceso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {routes?.filter(r => r?.status === "EN_PROCESO")?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Activas</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Completadas */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {routes?.filter(r => r?.status === "COMPLETADO" || r?.status === "COLLECTED" || r?.status === "TREATED")?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Finalizadas</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lista de Rutas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Órdenes de Recolección</h2>
                <p className="text-gray-600">Gestiona las órdenes de recolección asignadas</p>
              </div>
              
              {routes?.length > 0 ? (
                <div className="space-y-4">
                  {routes.map((route, index) => {
                    const nextAction = getNextAction(route.status);

                    return (
                      <motion.div
                        key={route.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-red-100 p-2 rounded-lg">
                              <Map className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">
                                Recolección #{route.id.substring(0,8)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Cliente: {route.client_name || "Sin nombre"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Creada: {format(new Date(route.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border ${
                              route.status === "PENDING" || route.status === "PENDIENTE" ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              route.status === "EN_PROCESO" ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              route.status === "EN_RUTA" ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              route.status === "COMPLETADO" || route.status === "COLLECTED" || route.status === "TREATED" ? 'bg-green-100 text-green-800 border-green-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {getStatusIcon(route.status)}
                              <span>{route.status}</span>
                            </span>
                            
                            {nextAction && (
                              <button
                                onClick={() => {
                                  if (nextAction.action === "approve") {
                                    approveRoute(route.id);
                                  } else if (nextAction.action === "start") {
                                    startRoute(route.id);
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-1"
                              >
                                <nextAction.icon className="h-4 w-4" />
                                <span>{nextAction.label}</span>
                              </button>
                            )}
                            
                            <Link 
                              to={`/mir/operator/route/${route.id}`}
                              className="text-red-600 border border-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver Detalles</span>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Truck className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No hay órdenes de recolección asignadas</p>
                  <p className="text-gray-400 text-sm">Contacta a tu administrador para recibir asignaciones.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OperatorRoutesPage;
