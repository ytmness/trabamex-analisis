import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, Clock, CheckCircle, AlertCircle, Info, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient.js';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar notificaciones desde user_activities
  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const { data: activities, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notifications:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar notificaciones',
          description: 'No se pudieron cargar las notificaciones',
        });
        return;
      }

      // Convertir actividades en notificaciones
      const formattedNotifications = activities.map(activity => ({
        id: activity.id,
        type: getNotificationType(activity.activity_type),
        title: getNotificationTitle(activity.activity_type),
        description: activity.description || 'Sin descripción',
        timestamp: new Date(activity.created_at),
        metadata: activity.metadata || {}
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar notificaciones',
        description: 'Ocurrió un error inesperado',
      });
    }
  };

  // Determinar el tipo de notificación basado en el activity_type
  const getNotificationType = (activityType) => {
    switch (activityType) {
      case 'ORDER_CREATED':
      case 'ORDER_UPDATED':
      case 'ORDER_COMPLETED':
        return 'success';
      case 'ORDER_CANCELLED':
      case 'INCIDENT_REPORTED':
        return 'error';
      case 'PAYMENT_PROCESSED':
      case 'PLAN_UPDATED':
        return 'info';
      default:
        return 'info';
    }
  };

  // Obtener título de notificación basado en el activity_type
  const getNotificationTitle = (activityType) => {
    switch (activityType) {
      case 'ORDER_CREATED':
        return 'Nueva solicitud creada';
      case 'ORDER_UPDATED':
        return 'Solicitud actualizada';
      case 'ORDER_COMPLETED':
        return 'Solicitud completada';
      case 'ORDER_CANCELLED':
        return 'Solicitud cancelada';
      case 'INCIDENT_REPORTED':
        return 'Incidencia reportada';
      case 'PAYMENT_PROCESSED':
        return 'Pago procesado';
      case 'PLAN_UPDATED':
        return 'Plan actualizado';
      default:
        return 'Actividad del sistema';
    }
  };

  // Obtener icono según el tipo de notificación
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  // Refrescar notificaciones
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
    toast({
      title: "Notificaciones actualizadas",
      description: "Se han cargado las notificaciones más recientes",
    });
  };

  useEffect(() => {
    loadNotifications().finally(() => setLoading(false));
  }, [user]);

  return (
    <>
      <Helmet>
        <title>Notificaciones - MIR</title>
        <meta name="description" content="Ver todas las notificaciones y actividades de tu cuenta." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Botón de regresar al dashboard */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/mir/user'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar al Dashboard
          </Button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Bell className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Notificaciones</h1>
              <p className="text-gray-600">Todas tus actividades y notificaciones</p>
            </div>
          </div>
          
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualizar
          </Button>
        </motion.div>

        {/* Lista de notificaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <span className="ml-2 text-gray-600">Cargando notificaciones...</span>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {notification.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            notification.type === 'success' ? 'text-green-600 border-green-200' :
                            notification.type === 'error' ? 'text-red-600 border-red-200' :
                            'text-blue-600 border-blue-200'
                          }`}
                        >
                          {notification.type}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {notification.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          {notification.timestamp.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {/* Mostrar metadata si existe */}
                      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <details className="cursor-pointer">
                            <summary className="text-sm font-medium text-gray-700">
                              Detalles adicionales
                            </summary>
                            <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(notification.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No tienes notificaciones
              </h3>
              <p className="text-gray-500 mb-4">
                Cuando tengas actividades en tu cuenta, aparecerán aquí
              </p>
              <Button onClick={handleRefresh} variant="outline">
                Actualizar
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default NotificationsPage;
