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
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-400 mx-auto mb-4" />
          <p className="text-white text-lg">Cargando rutas de recolección...</p>
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
                  Mis Rutas de Recolección
                </h1>
                <p className="mt-2 text-green-100 text-lg">Gestiona las órdenes de recolección asignadas</p>
              </div>
              <div className="flex items-center space-x-3 bg-green-600/50 px-4 py-2 rounded-full border border-green-500">
                <Truck className="h-6 w-6 text-green-200" />
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
                  <p className="text-blue-100 text-sm font-medium">Total Recolecciones</p>
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
                  <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                  <div className="text-3xl font-bold text-white mt-1">
                    {routes?.filter(r => r?.status === "PENDING" || r?.status === "PENDIENTE")?.length || 0}
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
                    {routes?.filter(r => r?.status === "EN_PROCESO")?.length || 0}
                  </div>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <Play className="h-8 w-8 text-purple-200" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completadas</p>
                  <div className="text-3xl font-bold text-white mt-1">
                    {routes?.filter(r => r?.status === "COMPLETADO" || r?.status === "COLLECTED" || r?.status === "TREATED")?.length || 0}
                  </div>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-200" />
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
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-green-600">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Órdenes de Recolección</h2>
                <p className="text-green-200">Gestiona las órdenes de recolección asignadas</p>
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
                        className="bg-green-900/30 rounded-lg p-6 border border-green-600/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Map className="h-6 w-6 text-green-400" />
                            <div>
                              <div className="font-medium text-white text-lg">
                                Recolección #{route.id.substring(0,8)}
                              </div>
                              <div className="text-sm text-green-200">
                                Cliente: {route.client_name || "Sin nombre"}
                              </div>
                              <div className="text-xs text-green-300">
                                Creada: {format(new Date(route.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(route.status)}`}>
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
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-1"
                              >
                                <nextAction.icon className="h-4 w-4" />
                                <span>{nextAction.label}</span>
                              </button>
                            )}
                            
                            <Link 
                              to={`/mir/operator/route/${route.id}`}
                              className="text-blue-400 border border-blue-500 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-1"
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
                  <Truck className="mx-auto h-16 w-16 text-green-400" />
                  <h3 className="mt-4 text-lg font-medium text-white">No hay órdenes de recolección asignadas</h3>
                  <p className="mt-2 text-sm text-green-200">Contacta a tu administrador para recibir asignaciones.</p>
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
