import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  History, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Calendar,
  MapPin,
  Package,
  Truck
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '../../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const OperatorHistoryPage = () => {
  const { profile, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOperatorHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Obtener historial de órdenes completadas del operador
      const { data: historyData, error: historyError } = await supabase
        .from('service_orders')
        .select(`
          id,
          status,
          created_at,
          client_name,
          operator_id,
          customer_id
        `)
        .eq('operator_id', user.id)
        .in('status', ['COMPLETADO', 'COLLECTED', 'TREATED'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (historyError) throw historyError;

      if (Array.isArray(historyData)) {
        setHistory(historyData);
      } else {
        setHistory([]);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar historial',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchOperatorHistory();
  }, [fetchOperatorHistory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Historial - Operador MIR</title>
        <meta name="description" content="Historial de órdenes completadas por el operador." />
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
                <h1 className="text-4xl font-bold">Mi Historial</h1>
                <p className="mt-2 text-red-100 text-lg">Órdenes completadas y procesadas</p>
              </div>
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <History className="h-6 w-6 text-red-200" />
                <span className="text-white font-semibold text-sm">OPERADOR</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estadísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Total Completadas */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Completadas</p>
                  <p className="text-2xl font-bold text-gray-900">{history?.length || 0}</p>
                  <p className="text-xs text-gray-500">Órdenes</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Este Mes */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Este Mes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history?.filter(h => {
                      const orderDate = new Date(h.created_at);
                      const now = new Date();
                      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                    })?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Completadas</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Promedio Diario */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio Diario</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history?.length > 0 ? Math.round(history.length / 30) : 0}
                  </p>
                  <p className="text-xs text-gray-500">Órdenes/día</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lista de Historial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Historial de Órdenes</h2>
                <p className="text-gray-600">Todas las órdenes que has completado</p>
              </div>
              
              {history?.length > 0 ? (
                <div className="space-y-4">
                  {history.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              Orden #{order.id.substring(0,8)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Cliente: {order.client_name || "Sin nombre"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Completada: {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>{order.status}</span>
                          </span>
                          <Link 
                            to={`/mir/operator/route/${order.id}`}
                            className="text-red-600 border border-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded-md text-sm transition-colors"
                          >
                            Ver Detalles
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <History className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No hay historial disponible</p>
                  <p className="text-gray-400 text-sm">Las órdenes completadas aparecerán aquí.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OperatorHistoryPage;
