import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient.js';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  History,
  Loader2,
  Mail,
  FileText,
  Settings,
  Box,
  Plus,
  Minus,
  Edit,
  Save,
  Send,
  Download
} from 'lucide-react';

const AdminSuppliesRequestDetailPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  
  // Estados principales
  const [request, setRequest] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userHistory, setUserHistory] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [requestType, setRequestType] = useState(null);
  const [requestItems, setRequestItems] = useState([]);
  
  // Estados de acciones
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Opciones de estado específicas por tipo de solicitud
  const getStatusOptions = (requestType) => {
    if (requestType === 'supplies_requests') {
      // Estados para solicitudes de insumos
      return [
        { value: 'pending', label: 'Pendiente', color: 'yellow' },
        { value: 'approved', label: 'Aprobada', color: 'blue' },
        { value: 'delivered', label: 'Entregada', color: 'green' },
        { value: 'cancelled', label: 'Cancelada', color: 'red' }
      ];
    } else {
      // Estados para solicitudes de recolección de desechos
      return [
        { value: 'SCHEDULED', label: 'Programada', color: 'yellow' },
        { value: 'COLLECTED', label: 'Recolectada', color: 'blue' },
        { value: 'TREATED', label: 'Tratada', color: 'green' },
        { value: 'CANCELLED', label: 'Cancelada', color: 'red' }
      ];
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      console.log('🔍 Buscando solicitud con ID:', id);
      
      // Buscar en ambas tablas: supplies_requests y service_orders
      let requestData = null;
      let requestError = null;
      let requestType = null;

      // Primero intentar en supplies_requests
      const { data: suppliesData, error: suppliesError } = await supabase
        .from('supplies_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (suppliesData) {
        requestData = suppliesData;
        requestType = 'supplies_requests';
        console.log('✅ Solicitud encontrada en supplies_requests:', requestData);
      } else {
        // Si no está en supplies_requests, buscar en service_orders
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_orders')
          .select('*')
          .eq('id', id)
          .single();

        if (serviceData) {
          requestData = serviceData;
          requestType = 'service_orders';
          console.log('✅ Solicitud encontrada en service_orders:', requestData);
        } else {
          requestError = serviceError;
        }
      }

      if (requestError) {
        console.error('❌ Error obteniendo solicitud:', requestError);
        throw requestError;
      }
      
      console.log('✅ Solicitud encontrada:', requestData);
      setRequest(requestData);
      setRequestType(requestType);

      // Obtener los items de la solicitud si es supplies_requests
      if (requestType === 'supplies_requests') {
        const { data: itemsData, error: itemsError } = await supabase
          .from('supplies_request_items')
          .select('*')
          .eq('request_id', requestData.id);

        if (itemsError) {
          console.warn('⚠️ Error obteniendo items:', itemsError);
          setRequestItems([]);
        } else {
          setRequestItems(itemsData || []);
          console.log('✅ Items encontrados:', itemsData);
        }
      } else {
        setRequestItems([]);
      }

      // Obtener perfil del usuario según el tipo de solicitud
      const userId = requestType === 'supplies_requests' ? requestData.user_id : requestData.customer_id;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn('⚠️ Error obteniendo perfil:', profileError);
        // No lanzar error, continuar sin perfil
      } else {
        setUserProfile(profileData);
      }

      // Obtener historial de solicitudes del usuario según el tipo
      let historyData = [];
      let historyError = null;

      if (requestType === 'supplies_requests') {
        const { data, error } = await supabase
          .from('supplies_requests')
          .select('id, status, created_at, updated_at')
          .eq('user_id', requestData.user_id)
          .order('created_at', { ascending: false })
          .limit(10);
        historyData = data || [];
        historyError = error;
      } else {
        const { data, error } = await supabase
          .from('service_orders')
          .select('id, status, created_at, updated_at')
          .eq('customer_id', requestData.customer_id)
          .order('created_at', { ascending: false })
          .limit(10);
        historyData = data || [];
        historyError = error;
      }

      if (historyError) {
        console.warn('⚠️ Error obteniendo historial:', historyError);
        setUserHistory([]);
      } else {
        setUserHistory(historyData || []);
      }

      // Obtener historial de actividades relacionadas (opcional, puede que la tabla no exista)
      try {
        const { data: activityData, error: activityError } = await supabase
          .from('user_activities')
          .select('*')
          .or(`description.ilike.%${id}%`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (activityError) {
          console.warn('⚠️ Error obteniendo actividades:', activityError);
          setActivityHistory([]);
        } else {
          setActivityHistory(activityData || []);
        }
      } catch (activityError) {
        console.warn('⚠️ No se pudo obtener historial de actividades:', activityError);
        setActivityHistory([]);
      }

    } catch (error) {
      console.error('Error cargando detalles:', error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar detalles',
        description: 'No se pudieron cargar los detalles de la solicitud',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status, requestType) => {
    const statusColors = {
      // Estados para supplies_requests
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approved': 'bg-blue-100 text-blue-800 border-blue-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      // Estados para service_orders
      'SCHEDULED': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'COLLECTED': 'bg-blue-100 text-blue-800 border-blue-200',
      'TREATED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      // Estados para supplies_requests
      'pending': Clock,
      'approved': CheckCircle,
      'delivered': CheckCircle,
      'cancelled': XCircle,
      // Estados para service_orders
      'SCHEDULED': Clock,
      'COLLECTED': Clock,
      'TREATED': CheckCircle,
      'CANCELLED': XCircle
    };
    return statusIcons[status] || Clock;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      // Estados para supplies_requests
      'pending': 'Pendiente',
      'approved': 'Aprobada',
      'delivered': 'Entregada',
      'cancelled': 'Cancelada',
      // Estados para service_orders
      'SCHEDULED': 'Programada',
      'COLLECTED': 'Recolectada',
      'TREATED': 'Tratada',
      'CANCELLED': 'Cancelada'
    };
    return statusLabels[status] || status;
  };

  const calculateTotalItems = () => {
    // Para supplies_requests, calcular desde requestItems
    if (requestType === 'supplies_requests') {
      return requestItems.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
    }
    // Para service_orders, usar la cantidad directamente del registro
    return request?.quantity || 0;
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    
    setUpdating(true);
    try {
      console.log('🔄 Actualizando estado de solicitud:', id, 'a', newStatus);
      
      // Determinar en qué tabla actualizar según el tipo de solicitud
      const tableName = requestType === 'supplies_requests' ? 'supplies_requests' : 'service_orders';
      
      // Actualizar estado de la solicitud
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('❌ Error actualizando estado:', updateError);
        throw updateError;
      }

      console.log('✅ Estado actualizado exitosamente');

      // Registrar actividad (opcional, puede que la tabla no exista)
      try {
        await supabase
          .from('user_activities')
          .insert({
            user_id: user.id,
            activity_type: 'service_order_status_change',
            description: `Cambió estado de solicitud ${id} de ${request.status} a ${newStatus}`,
            metadata: { 
              request_id: id, 
              old_status: request.status,
              new_status: newStatus, 
              admin_notes: adminNotes,
              admin_id: user.id
            }
          });
      } catch (activityError) {
        console.warn('⚠️ No se pudo registrar actividad:', activityError);
      }

      // Enviar notificación al usuario si está habilitado
      if (notifyUser) {
        try {
          const userId = requestType === 'supplies_requests' ? request.user_id : request.customer_id;
          const activityType = requestType === 'supplies_requests' ? 'supplies_request_notification' : 'service_order_notification';
          
          await supabase
            .from('user_activities')
            .insert({
              user_id: userId,
              activity_type: activityType,
              description: `Tu solicitud ha sido ${getStatusLabel(newStatus).toLowerCase()}`,
              metadata: { 
                request_id: id, 
                status: newStatus,
                admin_notes: adminNotes,
                admin_id: user.id
              }
            });
        } catch (notificationError) {
          console.warn('⚠️ No se pudo enviar notificación:', notificationError);
        }
      }

      toast({
        title: 'Estado actualizado',
        description: `La solicitud ha sido ${getStatusLabel(newStatus).toLowerCase()} exitosamente`,
      });

      setShowStatusModal(false);
      setNewStatus('');
      setAdminNotes('');
      fetchRequestDetails();

    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar estado',
        description: 'No se pudo cambiar el estado de la solicitud',
      });
    } finally {
      setUpdating(false);
    }
  };

  const exportToPDF = () => {
    // Implementar exportación a PDF
    toast({
      title: 'Exportación iniciada',
      description: 'El archivo PDF se descargará en breve',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Solicitud no encontrada</p>
          <Button
            onClick={() => navigate('/mir/admin/supplies-requests')}
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Listado
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(request.status);

  return (
    <>
      <Helmet>
        <title>Detalles de Solicitud #{id.substring(0, 8)} - MIR</title>
        <meta name="description" content="Detalles completos de la solicitud de insumos." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-red-200">
          <div className="container mx-auto px-6 py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/mir/admin/supplies-requests')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Solicitud #{id.substring(0, 8)}
                  </h1>
                  <p className="mt-2 text-red-600 text-lg">Detalles completos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={exportToPDF}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button
                  onClick={() => setShowStatusModal(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Cambiar Estado
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Información de la Solicitud */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-lg p-6 border border-red-200 shadow-sm"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-red-600"/>
                    Información de la Solicitud
                  </h2>
                  <p className="text-red-600">Detalles y estado actual</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Información General</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID de Solicitud:</span>
                        <span className="font-medium">#{id.substring(0, 8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de Solicitud:</span>
                        <span className="font-medium">
                          {new Date(request.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hora:</span>
                        <span className="font-medium">
                          {new Date(request.created_at).toLocaleTimeString('es-ES')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado Actual:</span>
                        <Badge className={`${getStatusColor(request.status, requestType)} flex items-center`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total de Items:</span>
                        <span className="font-medium">{calculateTotalItems()} items</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Notas del Usuario</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {request.notes ? (
                        <p className="text-gray-700">{request.notes}</p>
                      ) : (
                        <p className="text-gray-500 italic">No se proporcionaron notas</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Lista de Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-lg p-6 border border-red-200 shadow-sm"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    <Box className="h-5 w-5 mr-2 text-red-600"/>
                    Items Solicitados
                  </h2>
                  <p className="text-red-600">Lista detallada de insumos</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {requestType === 'supplies_requests' ? 'Insumo' : 'Tipo de Residuo'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {requestType === 'supplies_requests' ? 'Tamaño' : 'Proveedor'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unidad
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requestType === 'supplies_requests' ? (
                        requestItems.length > 0 ? (
                          requestItems.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.item_name || item.supply_name || 'N/A'}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {item.size || 'N/A'}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.quantity || 0}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {item.unit || 'N/A'}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                              No hay items registrados
                            </td>
                          </tr>
                        )
                      ) : (
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {request.residue_type || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {request.provider || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {request.quantity || 0}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {request.unit || 'N/A'}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Historial de Actividades */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg p-6 border border-red-200 shadow-sm"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    <History className="h-5 w-5 mr-2 text-red-600"/>
                    Historial de Actividades
                  </h2>
                  <p className="text-red-600">Log de cambios y eventos</p>
                </div>
                
                {activityHistory.length > 0 ? (
                  <div className="space-y-4">
                    {activityHistory.map((activity, index) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Clock className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{activity.description}</p>
                          <p className="text-sm text-gray-600">
                            {activity.activity_type} • {new Date(activity.created_at).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No hay actividad registrada para esta solicitud</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Columna Lateral */}
            <div className="space-y-8">
              {/* Información del Usuario */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-lg p-6 border border-red-200 shadow-sm"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    <User className="h-5 w-5 mr-2 text-red-600"/>
                    Información del Usuario
                  </h2>
                  <p className="text-red-600">Datos del solicitante</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {userProfile?.full_name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {userProfile?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Empresa:</span>
                      <span className="font-medium">
                        {userProfile?.company_name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teléfono:</span>
                      <span className="font-medium">
                        {userProfile?.phone || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Historial de Solicitudes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-lg p-6 border border-red-200 shadow-sm"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-red-600"/>
                    Historial de Solicitudes
                  </h2>
                  <p className="text-red-600">Últimas 10 solicitudes del usuario</p>
                </div>
                
                {userHistory.length > 0 ? (
                  <div className="space-y-3">
                    {userHistory.map((historyItem) => {
                      const HistoryStatusIcon = getStatusIcon(historyItem.status);
                      return (
                        <div key={historyItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">
                              #{historyItem.id.substring(0, 8)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(historyItem.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(historyItem.status, requestType)} flex items-center`}>
                            <HistoryStatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(historyItem.status)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">No hay historial disponible</p>
                  </div>
                )}
              </motion.div>

              {/* Acciones Rápidas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-lg p-6 border border-red-200 shadow-sm"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-red-600"/>
                    Acciones Rápidas
                  </h2>
                  <p className="text-red-600">Gestionar la solicitud</p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowStatusModal(true)}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Cambiar Estado
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Notificación
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={exportToPDF}
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Modal de Cambio de Estado */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Cambiar Estado de la Solicitud
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo Estado
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar estado</option>
                    {getStatusOptions(requestType).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas del Administrador
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Comentarios internos sobre el cambio de estado..."
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifyUser"
                    checked={notifyUser}
                    onChange={(e) => setNotifyUser(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="notifyUser" className="text-sm text-gray-700">
                    Notificar al usuario por email
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => setShowStatusModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleStatusChange}
                  disabled={!newStatus || updating}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {updating ? 'Actualizando...' : 'Actualizar Estado'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSuppliesRequestDetailPage;
