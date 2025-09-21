import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, MapPin, Clock, AlertCircle, CheckCircle, Loader2, Play, Truck, Pause } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '../../lib/customSupabaseClient.js';

const OperatorRouteDetailPage = () => {
  const { routeId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('🎯 OperatorRouteDetailPage renderizando con routeId:', routeId);

  const fetchRouteData = useCallback(async () => {
    console.log('🚀 Iniciando fetchRouteData para routeId:', routeId);
    setLoading(true);
    
    // En lugar de consultar la tabla 'routes', obtenemos la orden directamente
    console.log('📡 Consultando service_orders con ID:', routeId);
    const { data: orderData, error: orderError } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', routeId)
      .single();

    console.log('📊 Resultado de la consulta:', { orderData, orderError });

    if (orderError) {
      console.error('❌ Error al cargar la orden:', orderError);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la orden.' });
      setLoading(false);
      return;
    }
    
    // Usamos la orden como "ruta" para mantener la compatibilidad
    setRoute(orderData);
    
    // Debug: Mostrar los datos que recibimos
    console.log('🔍 Datos de la orden recibidos:', orderData);
    console.log('🔍 Campos disponibles:', Object.keys(orderData));
    
    // Debug detallado de cada campo
    console.log('🔍 Valores específicos:');
    console.log('  - tipo_residuo:', orderData.tipo_residuo);
    console.log('  - clave:', orderData.clave);
    console.log('  - procedencia:', orderData.procedencia);
    console.log('  - fecha_solicitud:', orderData.fecha_solicitud);
    console.log('  - tipo_envasado:', orderData.tipo_envasado);
    console.log('  - client_name:', orderData.client_name);
    console.log('  - quantity:', orderData.quantity);
    console.log('  - unit:', orderData.unit);
    
    // Simplificamos la consulta de paradas - solo obtenemos la orden actual
    // ya que cada "ruta" es en realidad una orden individual
    setStops([{
      id: orderData.id,
      service_order: orderData
    }]);
    
    setLoading(false);
    console.log('✅ fetchRouteData completado');
  }, [routeId, toast]);

  useEffect(() => {
    console.log('🔄 useEffect ejecutándose para routeId:', routeId);
    fetchRouteData();

    const channel = supabase
      .channel(`route-details-${routeId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, fetchRouteData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routes', filter: `id=eq.${routeId}` }, fetchRouteData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [routeId, fetchRouteData]);

  const handleStartRoute = async () => {
    const { error } = await supabase
      .from('service_orders')
      .update({ status: 'EN_PROCESO' })
      .eq('id', routeId);
    
    if (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'No se pudo iniciar la orden.' });
    } else {
      toast({
        title: "¡Orden Iniciada!",
        description: `La orden ha comenzado.`,
      });
    }
  };

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
      fetchRouteData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: error.message,
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
      case 'PENDIENTE':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'EN_PROCESO':
        return <Play className="h-5 w-5 text-blue-500" />;
      case 'EN_RUTA':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'COMPLETADO':
      case 'COLLECTED':
      case 'TREATED':
      case 'CERTIFIED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'INCIDENT':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando detalles de la orden...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Detalle de Ruta ${routeId.substring(0,8)} - Operador MIR`}</title>
        <meta name="description" content={`Detalles y paradas de la ruta ${routeId}.`} />
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
                <h1 className="text-4xl font-bold">Orden #{routeId.substring(0,8)}</h1>
                <p className="mt-2 text-red-100 text-lg">Detalles de la orden de recolección</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/mir/${profile.role}`)} 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Mis Rutas
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Botón de acción principal */}
          {route?.status === 'PENDIENTE' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-4">¿Listo para comenzar?</h2>
                <Button 
                  onClick={handleStartRoute} 
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Iniciar Orden
                </Button>
              </div>
            </motion.div>
          )}

          {/* Detalles de la Orden */}
          <div className="grid gap-6">
            {stops.map((stop, index) => (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start text-xl text-gray-900">
                      <span>{stop.service_order.client_name || stop.service_order.customer?.full_name || 'Cliente'}</span>
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Orden #{index + 1}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      ID Orden: {stop.service_order.id.substring(0,8)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
         {/* Información de la orden */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
               <span className="font-medium text-gray-700">Cliente:</span>
               <span className="text-gray-600 font-semibold">
                 {stop.service_order.client_name || 'Cliente no especificado'}
               </span>
             </div>
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
               <span className="font-medium text-gray-700">Tipo de residuo:</span>
               <span className="text-gray-600 font-semibold">
                 {stop.service_order.tipo_residuo || 'No especificado'}
               </span>
             </div>
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
               <span className="font-medium text-gray-700">Cantidad:</span>
               <span className="text-gray-600 font-semibold">
                 {stop.service_order.quantity || '0'} {stop.service_order.unit || 'kg'}
               </span>
             </div>
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
               <span className="font-medium text-gray-700">Clave:</span>
               <span className="text-gray-600 font-semibold">
                 {stop.service_order.clave || 'No especificada'}
               </span>
             </div>
           </div>
           <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
               <span className="font-medium text-gray-700">Procedencia:</span>
               <span className="text-gray-600 font-semibold">
                 {stop.service_order.procedencia || 'No especificada'}
               </span>
             </div>
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
               <span className="font-medium text-gray-700">Fecha solicitud:</span>
               <span className="text-gray-600 font-semibold">
                 {stop.service_order.fecha_solicitud || 
                  (stop.service_order.created_at ? new Date(stop.service_order.created_at).toLocaleDateString() : 'No especificada')}
               </span>
             </div>
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
               <span className="font-medium text-gray-700">Tipo de envasado:</span>
               <span className="text-gray-600 font-semibold">
                 {stop.service_order.tipo_envasado || 'No especificado'}
               </span>
             </div>
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
               <span className="font-medium text-gray-700">Estado:</span>
               <div className="flex items-center">
                 {getStatusIcon(stop.service_order.status)}
                 <span className="ml-2 text-gray-600 font-semibold">{stop.service_order.status}</span>
               </div>
             </div>
           </div>
         </div>
                  
                  {/* Información adicional */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Información Adicional</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-blue-700">Notas:</span>
                        <span className="ml-2 text-blue-600">
                          {stop.service_order.notes || 'Sin notas'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Creado:</span>
                        <span className="ml-2 text-blue-600">
                          {stop.service_order.created_at ? new Date(stop.service_order.created_at).toLocaleString() : 'No disponible'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Operador asignado:</span>
                        <span className="ml-2 text-blue-600">
                          {stop.service_order.operator_id ? 'Asignado' : 'Sin asignar'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">ID completo:</span>
                        <span className="ml-2 text-blue-600 font-mono text-xs">
                          {stop.service_order.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notas */}
                  {stop.service_order.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Notas:</span>
                      <p className="text-sm text-gray-600 mt-1">{stop.service_order.notes}</p>
                    </div>
                  )}
                  
                  {/* Evidencia fotográfica */}
                  {stop.service_order.evidencia_fotografica && stop.service_order.evidencia_fotografica.length > 0 && (
                    <div className="mb-4">
                      <span className="font-medium text-gray-700">Evidencia fotográfica:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {stop.service_order.evidencia_fotografica.map((image, idx) => (
                          <div key={idx} className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-500">IMG {idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Botones de cambio de estado */}
                  <div className="flex flex-wrap gap-2">
                    {/* Botón para cambiar a PENDIENTE */}
                    {stop.service_order.status !== 'PENDING' && stop.service_order.status !== 'PENDIENTE' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(stop.service_order.id, 'PENDIENTE')}
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Pendiente
                      </Button>
                    )}
                    
                    {/* Botón para cambiar a EN_PROCESO */}
                    {stop.service_order.status !== 'EN_PROCESO' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(stop.service_order.id, 'EN_PROCESO')}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        En Proceso
                      </Button>
                    )}
                    
                    {/* Botón para cambiar a EN_RUTA */}
                    {stop.service_order.status !== 'EN_RUTA' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(stop.service_order.id, 'EN_RUTA')}
                        className="text-purple-600 border-purple-600 hover:bg-purple-50"
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        En Ruta
                      </Button>
                    )}
                    
                    {/* Botón para cambiar a COMPLETADO */}
                    {stop.service_order.status !== 'COMPLETADO' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(stop.service_order.id, 'COMPLETADO')}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completado
                      </Button>
                    )}
                  </div>
                  
                  {/* Botón para ver detalles */}
                  <div className="mt-3">
                    <Link to={`/mir/${profile.role}/tracking/${stop.service_order.id}`}>
                      <Button size="sm" variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50">
                        Ver Detalles Completos
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
    </>
  );
};

export default OperatorRouteDetailPage;
