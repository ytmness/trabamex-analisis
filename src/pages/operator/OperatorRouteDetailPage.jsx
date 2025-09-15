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

  const fetchRouteData = useCallback(async () => {
    setLoading(true);
    const { data: routeData, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (routeError) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la ruta.' });
      setLoading(false);
      return;
    }
    setRoute(routeData);

    const { data: stopsData, error: stopsError } = await supabase
      .from('route_stops')
      .select(`
        id,
        service_order:service_orders (
          id,
          status,
          quantity,
          unit,
          notes,
          tipo_residuo,
          clave,
          procedencia,
          fecha_solicitud,
          tipo_envasado,
          evidencia_fotografica,
          customer:profiles (full_name)
        )
      `)
      .eq('route_id', routeId)
      .order('id');

    if (stopsError) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las paradas.' });
    } else {
      setStops(stopsData);
    }
    setLoading(false);
  }, [routeId, toast]);

  useEffect(() => {
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
      .from('routes')
      .update({ status: 'EN_PROCESO' })
      .eq('id', routeId);
    
    if (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'No se pudo iniciar la ruta.' });
    } else {
      toast({
        title: "¡Ruta Iniciada!",
        description: `La ruta ha comenzado.`,
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
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Detalle de Ruta ${routeId.substring(0,8)} - Operador MIR`}</title>
        <meta name="description" content={`Detalles y paradas de la ruta ${routeId}.`} />
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="ghost" onClick={() => navigate(`/mir/${profile.role}`)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Rutas
          </Button>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{`Ruta ${routeId.substring(0,8)}`}</h1>
              <p className="mt-1 text-gray-600">Paradas asignadas en orden de ejecución.</p>
            </div>
            {route?.status === 'Planeada' && (
              <Button onClick={handleStartRoute} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                Iniciar Ruta
              </Button>
            )}
          </div>
        </motion.div>

        <div className="mt-8 grid gap-6">
          {stops.map((stop, index) => (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:bg-gray-50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{stop.service_order.customer?.full_name || 'Cliente'}</span>
                    <span className="text-sm font-medium text-gray-500">{`#${index + 1}`}</span>
                  </CardTitle>
                  <CardDescription>ID Orden: {stop.service_order.id.substring(0,8)}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Información del formulario */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Tipo de residuo:</span>
                        <span className="ml-2 text-gray-600">{stop.service_order.tipo_residuo || 'No especificado'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Cantidad:</span>
                        <span className="ml-2 text-gray-600">{stop.service_order.quantity || '0'} {stop.service_order.unit || 'Kg'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Clave:</span>
                        <span className="ml-2 text-gray-600">{stop.service_order.clave || 'No especificada'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Procedencia:</span>
                        <span className="ml-2 text-gray-600">{stop.service_order.procedencia || 'No especificada'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Fecha solicitud:</span>
                        <span className="ml-2 text-gray-600">{stop.service_order.fecha_solicitud || 'No especificada'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Tipo de envasado:</span>
                        <span className="ml-2 text-gray-600">{stop.service_order.tipo_envasado || 'No especificado'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Estado:</span>
                        <div className="flex items-center ml-2">
                          {getStatusIcon(stop.service_order.status)}
                          <span className="ml-2 text-gray-600">{stop.service_order.status}</span>
                        </div>
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
                      <Button size="sm" variant="ghost" className="w-full">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default OperatorRouteDetailPage;
