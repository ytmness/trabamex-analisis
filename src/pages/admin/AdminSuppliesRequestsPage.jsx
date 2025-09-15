import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient.js';
import { Badge } from '@/components/ui/badge';
import { 
  Package,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  BarChart3,
  Loader2,
  Plus,
  RefreshCw,
  FileText,
  AlertCircle,
  TrendingUp,
  Users,
  Box
} from 'lucide-react';

const AdminSuppliesRequestsPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados principales
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approvedToday: 0,
    totalItems: 0
  });
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    userSearch: '',
    requestType: 'all', // 'all', 'delivery', 'collection'
    supplyType: 'all'
  });
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Opciones de filtros
  const statusOptions = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'approved', label: 'Aprobada' },
    { value: 'rejected', label: 'Rechazada' },
    { value: 'completed', label: 'Completada' }
  ];

  const supplyTypeOptions = [
    { value: 'all', label: 'Todos los Insumos' },
    { value: 'Bolsas Rojas', label: 'Bolsas Rojas' },
    { value: 'Bolsas Amarillas', label: 'Bolsas Amarillas' },
    { value: 'Contenedores', label: 'Contenedores' },
    { value: 'Etiquetas', label: 'Etiquetas' },
    { value: 'Otros', label: 'Otros' }
  ];

  useEffect(() => {
    fetchRequests();
    fetchStats();
    diagnoseDatabase(); // Agregar diagnóstico
  }, [filters, currentPage]);

  // Función de diagnóstico de base de datos
  const diagnoseDatabase = async () => {
    try {
      console.log('🔍 === DIAGNÓSTICO DE BASE DE DATOS ===');
      
      // Lista de tablas a verificar
      const tablesToCheck = [
        'service_orders',
        'supplies_requests', 
        'supplies_request_items',
        'profiles',
        'user_roles',
        'tracking_events',
        'evidence_files'
      ];

      for (const tableName of tablesToCheck) {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
            .limit(1);

          if (error) {
            console.log(`❌ Tabla '${tableName}': ${error.message}`);
          } else {
            console.log(`✅ Tabla '${tableName}': ${count || 0} registros`);
            if (data && data.length > 0) {
              console.log(`📋 Estructura de '${tableName}':`, Object.keys(data[0]));
            }
          }
        } catch (err) {
          console.log(`❌ Error verificando '${tableName}':`, err.message);
        }
      }

      console.log('🔍 === FIN DIAGNÓSTICO ===');
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      console.log('🔄 Iniciando carga de solicitudes...');
      
      // Verificar todas las tablas posibles donde podrían estar las solicitudes
      console.log('🔍 Verificando tablas disponibles...');
      
      // Consultar supplies_requests (solicitudes de insumos)
      const { data: suppliesRequestsData, error: suppliesRequestsError } = await supabase
        .from('supplies_requests')
        .select(`
          *,
          supplies_request_items (*)
        `)
        .order('created_at', { ascending: false });

      if (suppliesRequestsError) {
        console.warn('⚠️ Error consultando supplies_requests:', suppliesRequestsError);
      } else {
        console.log(`📋 Supplies Requests encontradas: ${suppliesRequestsData?.length || 0}`);
        console.log('📋 Datos de supplies_requests:', suppliesRequestsData);
      }

      // Consultar service_orders (solicitudes de recolección)
      const { data: serviceOrdersData, error: serviceOrdersError } = await supabase
        .from('service_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (serviceOrdersError) {
        console.warn('⚠️ Error consultando service_orders:', serviceOrdersError);
      } else {
        console.log(`📋 Service Orders encontradas: ${serviceOrdersData?.length || 0}`);
        console.log('📋 Datos de service_orders:', serviceOrdersData);
      }

      // Combinar ambos tipos de solicitudes
      const suppliesRequests = (suppliesRequestsData || []).map(request => ({
        ...request,
        request_type: 'supplies' // Marcar como solicitud de insumos
      }));

      const serviceOrders = (serviceOrdersData || []).map(request => ({
        ...request,
        request_type: 'collection', // Marcar como solicitud de recolección
        supplies_request_items: [] // No tienen items de insumos
      }));

      console.log('🔍 Supplies Requests procesadas:', suppliesRequests.length);
      console.log('🔍 Service Orders procesadas:', serviceOrders.length);
      console.log('🔍 Supplies Requests data:', suppliesRequests);
      console.log('🔍 Service Orders data:', serviceOrders);

      const finalData = [...suppliesRequests, ...serviceOrders].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      console.log('🔍 Datos finales combinados:', finalData.length);
      console.log('🔍 Datos finales:', finalData);
      const finalError = suppliesRequestsError || serviceOrdersError;

      if (finalError) {
        console.error('❌ Error en consulta de solicitudes:', finalError);
        throw finalError;
      }

      console.log(`✅ Solicitudes obtenidas: ${finalData?.length || 0}`);
      console.log('📋 Datos de solicitudes:', finalData);
      console.log('🔍 Estructura de la primera solicitud:', finalData?.[0]);
      
      // Si no hay datos, establecer array vacío
      const requests = finalData || [];

      // Obtener información de usuarios para cada solicitud
      const requestsWithUsers = await Promise.all(
        requests.map(async (request) => {
          let userProfile = null;
          
          if (request.customer_id) {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', request.customer_id)
                .single();
              
              if (!profileError && profileData) {
                userProfile = profileData;
              }
            } catch (error) {
              console.warn(`⚠️ Error obteniendo perfil para ${request.customer_id}:`, error);
            }
          }
          
          return {
            ...request,
            supplies_request_items: [], // Se cargarán por separado si es necesario
            user_profile: userProfile
          };
        })
      );

      // Aplicar paginación del lado del cliente
      const totalFilteredCount = requestsWithUsers.length;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = requestsWithUsers.slice(startIndex, endIndex);

      console.log(`📄 Paginación: página ${currentPage}, mostrando ${paginatedData.length} de ${totalFilteredCount}`);

      setRequests(requestsWithUsers);
      setTotalPages(Math.ceil(totalFilteredCount / itemsPerPage));

      console.log('✅ Carga de solicitudes completada exitosamente');

    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error);
      console.error('❌ Stack trace:', error.stack);
      
      toast({
        variant: 'destructive',
        title: 'Error al cargar solicitudes',
        description: `Error: ${error.message || 'Error desconocido'}`,
      });
      
      // Establecer datos vacíos en caso de error
      setRequests([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Iniciando carga de estadísticas...');
      
      // Consultar ambas tablas
      const today = new Date().toISOString().split('T')[0];
      
      // Estadísticas de supplies_requests (solicitudes de insumos)
      const { count: suppliesTotal, error: suppliesTotalError } = await supabase
        .from('supplies_requests')
        .select('*', { count: 'exact', head: true });

      const { count: suppliesPending, error: suppliesPendingError } = await supabase
        .from('supplies_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: suppliesCompleted, error: suppliesCompletedError } = await supabase
        .from('supplies_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('updated_at', today);

      // Estadísticas de service_orders (solicitudes de recolección)
      const { count: ordersTotal, error: ordersTotalError } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true });

      const { count: ordersPending, error: ordersPendingError } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'SCHEDULED');

      const { count: ordersCompleted, error: ordersCompletedError } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'TREATED')
        .gte('updated_at', today);

      // Combinar estadísticas
      const total = (suppliesTotal || 0) + (ordersTotal || 0);
      const pending = (suppliesPending || 0) + (ordersPending || 0);
      const completedToday = (suppliesCompleted || 0) + (ordersCompleted || 0);

      // Total de items (simplificado)
      const totalItems = 0; // Por ahora simplificado

      const newStats = {
        total: total,
        pending: pending,
        approvedToday: completedToday, // Cambiar nombre para mantener compatibilidad
        totalItems: totalItems
      };

      console.log('📊 Estadísticas cargadas:', newStats);
      console.log('📊 Combinando datos de supplies_requests y service_orders');
      setStats(newStats);

    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      // No mostrar toast para estadísticas ya que no es crítico
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'approved': 'bg-green-50 text-green-700 border-green-200',
      'rejected': 'bg-red-50 text-red-700 border-red-200',
      'completed': 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return statusColors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'pending': Clock,
      'approved': CheckCircle,
      'rejected': XCircle,
      'completed': Package
    };
    return statusIcons[status] || Clock;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'pending': 'Pendiente',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
      'completed': 'Completada'
    };
    return statusLabels[status] || status;
  };

  // Función para obtener la siguiente acción lógica basada en el estado actual
  const getNextAction = (status) => {
    const nextActions = {
      'pending': { 
        status: 'approved', 
        label: 'Aprobar Solicitud', 
        icon: CheckCircle, 
        color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
      },
      'approved': { 
        status: 'completed', 
        label: 'Marcar como Completada', 
        icon: Package, 
        color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
      },
      'completed': null, // Estado final, no hay siguiente acción
      'rejected': null // Estado rechazado, no hay siguiente acción
    };
    return nextActions[status] || null;
  };

  // Función para determinar el tipo de solicitud
  const getRequestType = (request) => {
    console.log('🔍 getRequestType - Analizando solicitud:', request.id, 'request_type:', request.request_type, 'residue_type:', request.residue_type);
    
    // Usar el campo request_type que agregamos al combinar los datos
    if (request.request_type === 'supplies') {
      console.log('🔍 getRequestType - Tipo: delivery (supplies)');
      return 'delivery'; // Solicitudes de insumos = entrega
    } else if (request.request_type === 'collection') {
      console.log('🔍 getRequestType - Tipo: collection');
      return 'collection'; // Solicitudes de recolección
    }
    
    // Fallback: determinar por campos existentes
    if (request.residue_type) {
      console.log('🔍 getRequestType - Tipo: collection (fallback por residue_type)');
      return 'collection';
    }
    console.log('🔍 getRequestType - Tipo: delivery (fallback por defecto)');
    return 'delivery';
  };

  const getRequestTypeLabel = (type) => {
    const typeLabels = {
      'delivery': 'Entrega de Insumos',
      'collection': 'Recolección de Desechos'
    };
    return typeLabels[type] || 'Desconocido';
  };

  const getRequestTypeColor = (type) => {
    const typeColors = {
      'delivery': 'bg-blue-100 text-blue-800 border-blue-200',
      'collection': 'bg-green-100 text-green-800 border-green-200'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const calculateTotalItems = (request) => {
    if (!request.supplies_request_items || request.supplies_request_items.length === 0) {
      return 0; // Retornar 0 si no hay items cargados
    }
    return request.supplies_request_items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // Filtrar solicitudes por tipo
  const getFilteredRequests = (type) => {
    const filtered = requests.filter(request => {
      const requestType = getRequestType(request);
      console.log('🔍 Filtrando solicitud:', request.id, 'tipo:', requestType, 'buscando:', type);
      return requestType === type;
    });
    console.log(`🔍 Solicitudes filtradas para tipo '${type}':`, filtered.length);
    return filtered;
  };

  const handleStatusChange = async (requestId, newStatus, adminNotes = '') => {
    try {
      console.log('🔄 Actualizando estado de solicitud:', requestId, 'a', newStatus);
      
      // Encontrar la solicitud para determinar su tipo
      const request = requests.find(r => r.id === requestId);
      const tableName = request?.request_type === 'supplies' ? 'supplies_requests' : 'service_orders';
      
      console.log('📋 Actualizando en tabla:', tableName);
      
      const { error } = await supabase
        .from(tableName)
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('❌ Error actualizando estado:', error);
        throw error;
      }

      console.log('✅ Estado actualizado exitosamente');

      // Registrar actividad
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'supplies_request_status_change',
          description: `Cambió estado de solicitud ${requestId} a ${newStatus}`,
          metadata: { request_id: requestId, new_status: newStatus, admin_notes: adminNotes }
        });

      toast({
        title: 'Estado actualizado',
        description: `La solicitud ha sido ${getStatusLabel(newStatus).toLowerCase()}`,
      });

      fetchRequests();
      fetchStats();

    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar estado',
        description: 'No se pudo cambiar el estado de la solicitud',
      });
    }
  };

  const exportToExcel = () => {
    // Implementar exportación a Excel
    toast({
      title: 'Exportación iniciada',
      description: 'El archivo se descargará en breve',
    });
  };

  return (
    <>
      <Helmet>
        <title>Administración de Solicitudes de Insumos - MIR</title>
        <meta name="description" content="Panel de administración para gestionar solicitudes de insumos." />
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
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Solicitudes de Insumos
                </h1>
                <p className="mt-2 text-red-600 text-lg">Panel de administración</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button
                  onClick={() => { fetchRequests(); fetchStats(); }}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Estadísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Total Solicitudes</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-full">
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-full">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Entregadas Hoy</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.approvedToday}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Items</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalItems}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <Box className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg p-6 border border-red-200 shadow-sm mb-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-red-600"/>
                Filtros de Búsqueda
              </h2>
              <p className="text-red-600">Filtrar solicitudes por diferentes criterios</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Tipo de Solicitud */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Solicitud</label>
                <select
                  value={filters.requestType}
                  onChange={(e) => setFilters({...filters, requestType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">Todos los Tipos</option>
                  <option value="delivery">Entrega de Insumos</option>
                  <option value="collection">Recolección de Desechos</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha Desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Fecha Hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Búsqueda de Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por email o nombre"
                    value={filters.userSearch}
                    onChange={(e) => setFilters({...filters, userSearch: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tipo de Insumo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Insumo</label>
                <select
                  value={filters.supplyType}
                  onChange={(e) => setFilters({...filters, supplyType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {supplyTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Tabla de Solicitudes */}
          {/* Sección de Entrega de Insumos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-lg border border-blue-200 shadow-sm overflow-hidden mb-8"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Package className="h-6 w-6 mr-2 text-blue-600" />
                Entrega de Insumos
              </h2>
              <p className="text-blue-600 mt-1">Solicitudes de entrega de materiales e insumos</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID Solicitud
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredRequests('delivery').map((request) => {
                        const StatusIcon = getStatusIcon(request.status);
                        const requestType = getRequestType(request);
                        return (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{request.id.substring(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRequestTypeColor(requestType)}`}>
                                {requestType === 'delivery' ? (
                                  <Package className="h-3 w-3 mr-1" />
                                ) : (
                                  <Box className="h-3 w-3 mr-1" />
                                )}
                                {getRequestTypeLabel(requestType)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-red-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {request.user_profile?.full_name || request.user_profile?.email || `Usuario ${request.user_id?.substring(0, 8)}`}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {request.user_profile?.company_name || request.user_profile?.email || `ID: ${request.user_id || 'N/A'}`}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(request.created_at).toLocaleDateString('es-ES')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(request.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {getStatusLabel(request.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {calculateTotalItems(request)} items
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm font-medium min-w-[280px]">
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => navigate(`/mir/admin/supplies-requests/${request.id}`)}
                                  className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver
                                </button>
                                
                                {/* Acción rápida - siguiente paso lógico */}
                                {(() => {
                                  const nextAction = getNextAction(request.status);
                                  if (nextAction) {
                                    const IconComponent = nextAction.icon;
                                    return (
                                      <button
                                        onClick={() => handleStatusChange(request.id, nextAction.status)}
                                        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200 whitespace-nowrap ${nextAction.color}`}
                                      >
                                        <IconComponent className="h-3 w-3 mr-1" />
                                        {nextAction.label}
                                      </button>
                                    );
                                  }
                                  return null;
                                })()}
                                
                                {/* Botón cancelar - solo si no está cancelado o tratado */}
                                {request.status !== 'rejected' && request.status !== 'completed' && (
                                  <button
                                    onClick={() => handleStatusChange(request.id, 'cancelled')}
                                    className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors duration-200 whitespace-nowrap"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Cancelar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Mensaje cuando no hay solicitudes de entrega */}
                {getFilteredRequests('delivery').length === 0 && (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">No hay solicitudes de entrega de insumos</p>
                    <p className="text-gray-400 text-sm mt-2">Las nuevas solicitudes aparecerán aquí</p>
                  </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Página {currentPage} de {totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {!loading && requests.length === 0 && (
              <div className="text-center py-20">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No se encontraron solicitudes con los filtros aplicados.</p>
                <Button
                  onClick={() => setFilters({
                    status: 'all',
                    dateFrom: '',
                    dateTo: '',
                    userSearch: '',
                    supplyType: 'all'
                  })}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </motion.div>

          {/* Sección de Recolección de Desechos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-lg border border-green-200 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Box className="h-6 w-6 mr-2 text-green-600" />
                Recolección de Desechos
              </h2>
              <p className="text-green-600 mt-1">Solicitudes de recolección de desechos tóxicos y residuos</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID Solicitud
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo de Residuo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredRequests('collection').map((request) => {
                        const StatusIcon = getStatusIcon(request.status);
                        return (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{request.id.substring(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {request.residue_type || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.provider || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-green-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {request.user_profile?.full_name || request.user_profile?.email || `Usuario ${request.user_id?.substring(0, 8)}`}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {request.user_profile?.company_name || request.user_profile?.email || `ID: ${request.user_id || 'N/A'}`}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(request.created_at).toLocaleDateString('es-ES')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(request.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {getStatusLabel(request.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {request.quantity || 0} {request.unit || 'unidades'}
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm font-medium min-w-[280px]">
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => navigate(`/mir/admin/supplies-requests/${request.id}`)}
                                  className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver
                                </button>
                                
                                {/* Acción rápida - siguiente paso lógico */}
                                {(() => {
                                  const nextAction = getNextAction(request.status);
                                  if (nextAction) {
                                    const IconComponent = nextAction.icon;
                                    return (
                                      <button
                                        onClick={() => handleStatusChange(request.id, nextAction.status)}
                                        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200 whitespace-nowrap ${nextAction.color}`}
                                      >
                                        <IconComponent className="h-3 w-3 mr-1" />
                                        {nextAction.label}
                                      </button>
                                    );
                                  }
                                  return null;
                                })()}
                                
                                {/* Botón cancelar - solo si no está cancelado o tratado */}
                                {request.status !== 'rejected' && request.status !== 'completed' && (
                                  <button
                                    onClick={() => handleStatusChange(request.id, 'cancelled')}
                                    className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors duration-200 whitespace-nowrap"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Cancelar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Mensaje cuando no hay solicitudes de recolección */}
                {getFilteredRequests('collection').length === 0 && (
                  <div className="text-center py-12">
                    <Box className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">No hay solicitudes de recolección de desechos</p>
                    <p className="text-gray-400 text-sm mt-2">Las nuevas solicitudes aparecerán aquí</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminSuppliesRequestsPage;