import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Search, Filter, Clock, CheckCircle, Play, X, AlertCircle, Loader2, MapPin, Truck, Building, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import supabase from '../lib/customSupabaseClient.js';
import { useToast } from '../components/ui/use-toast';

// Estados disponibles para las órdenes
const ORDER_STATUSES = {
  SCHEDULED: { label: 'Planificado', color: 'bg-gray-100 text-gray-800', icon: Clock, description: 'Solicitud creada y planificada' },
  EN_ROUTE_TO_PICKUP: { label: 'En Camino', color: 'bg-blue-100 text-blue-800', icon: Play, description: 'Operador en camino al punto de recolección' },
  ON_SITE_PICKUP: { label: 'En el Sitio', color: 'bg-yellow-100 text-yellow-800', icon: MapPin, description: 'Operador en el punto de recolección' },
  COLLECTED: { label: 'Recolectado', color: 'bg-orange-100 text-orange-800', icon: CheckCircle, description: 'Residuos recolectados exitosamente' },
  EN_ROUTE_TO_DEPOT: { label: 'En Ruta al Depósito', color: 'bg-purple-100 text-purple-800', icon: Truck, description: 'En camino al depósito para pesaje' },
  AT_DEPOT: { label: 'En Depósito', color: 'bg-indigo-100 text-indigo-800', icon: Building, description: 'Residuos en depósito para verificación' },
  WEIGHED_VERIFIED: { label: 'Pesado y Verificado', color: 'bg-blue-100 text-blue-800', icon: Package, description: 'Peso verificado y documentado' },
  EN_ROUTE_TO_TREATMENT: { label: 'En Transporte', color: 'bg-yellow-100 text-yellow-800', icon: Truck, description: 'En camino a planta de tratamiento' },
  IN_TREATMENT: { label: 'Tratamiento', color: 'bg-purple-100 text-purple-800', icon: Clock, description: 'Residuos en proceso de tratamiento' },
  TREATED: { label: 'Disposición Final', color: 'bg-indigo-100 text-indigo-800', icon: CheckCircle, description: 'Tratamiento completado' },
  CERTIFIED: { label: 'Certificado', color: 'bg-green-100 text-green-800', icon: CheckCircle, description: 'Proceso completamente finalizado' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: X, description: 'Solicitud cancelada' }
};

const TrackingHubPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Obtener órdenes del usuario
  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          tracking_events (
            id,
            event_type,
            description,
            location,
            created_at
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las órdenes de seguimiento.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Filtrar órdenes
  useEffect(() => {
    let filtered = orders;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.residue_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.origin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  // Obtener estadísticas
  const getStats = () => {
    const total = orders.length;
    const byStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Debug: mostrar estados encontrados
    console.log('🔍 Estados encontrados en las órdenes:', byStatus);
    console.log('🔍 Órdenes:', orders.map(o => ({ id: o.id.substring(0, 8), status: o.status })));

    // Calcular estados no contados
    const countedStates = ['SCHEDULED', 'PLANNED', 'EN_ROUTE_TO_PICKUP', 'EN_ROUTE_TO_DEPOT', 'EN_ROUTE_TO_TREATMENT', 
                          'ON_SITE_PICKUP', 'COLLECTED', 'AT_DEPOT', 'WEIGHED_VERIFIED', 'IN_TREATMENT', 
                          'TREATED', 'CERTIFIED', 'CANCELLED'];
    const uncountedStates = Object.keys(byStatus).filter(status => !countedStates.includes(status));
    const uncountedTotal = uncountedStates.reduce((sum, status) => sum + byStatus[status], 0);

    return {
      total,
      planned: (byStatus.SCHEDULED || 0) + (byStatus.PLANNED || 0) + uncountedTotal, // Incluir estados no contados
      enRoute: (byStatus.EN_ROUTE_TO_PICKUP || 0) + (byStatus.EN_ROUTE_TO_DEPOT || 0) + (byStatus.EN_ROUTE_TO_TREATMENT || 0),
      inProgress: (byStatus.ON_SITE_PICKUP || 0) + (byStatus.COLLECTED || 0) + (byStatus.AT_DEPOT || 0) + (byStatus.WEIGHED_VERIFIED || 0) + (byStatus.IN_TREATMENT || 0),
      completed: (byStatus.TREATED || 0) + (byStatus.CERTIFIED || 0),
      cancelled: byStatus.CANCELLED || 0
    };
  };

  const stats = getStats();

  // Obtener último evento de tracking
  const getLatestEvent = (trackingEvents) => {
    if (!trackingEvents || trackingEvents.length === 0) return null;
    return trackingEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Centro de Seguimiento - MIR</title>
        <meta name="description" content="Seguimiento de todas tus solicitudes de recolección." />
      </Helmet>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Seguimiento</h1>
          <p className="text-gray-600">Monitorea el estado de todas tus solicitudes de recolección</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Solicitudes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
              <p className="text-sm text-gray-600">Planificadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.enRoute}</div>
              <p className="text-sm text-gray-600">En Camino</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <p className="text-sm text-gray-600">En Progreso</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-sm text-gray-600">Completadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <p className="text-sm text-gray-600">Canceladas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por ID, tipo de residuo o origen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {Object.entries(ORDER_STATUSES).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Órdenes */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No se encontraron órdenes' : 'No tienes órdenes de servicio'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda.'
                  : 'Crea tu primera solicitud de recolección para comenzar.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
                             const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.SCHEDULED;
              const IconComponent = statusConfig.icon;
              const latestEvent = getLatestEvent(order.tracking_events);
              
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              Orden #{order.id.slice(0, 8)}...
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={statusConfig.color}>
                                <IconComponent className="w-4 h-4 mr-1" />
                                {statusConfig.label}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Creada: {formatDate(order.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Tipo de Residuo</p>
                            <p className="text-sm text-gray-900">
                              {order.residue_type === 'rp' ? 'Residuos Peligrosos' : order.residue_type}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Cantidad</p>
                            <p className="text-sm text-gray-900">
                              {order.quantity} {order.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Origen</p>
                            <p className="text-sm text-gray-900">{order.origin}</p>
                          </div>
                        </div>

                        {latestEvent && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">Última Actualización</p>
                            <p className="text-sm text-gray-900">{latestEvent.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(latestEvent.created_at)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => navigate(`/mir/${profile?.role || 'user'}/tracking/${order.id}`)}
                          className="w-full lg:w-auto"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Seguimiento Detallado
                        </Button>
                        
                        {order.status === 'COLLECTED' && (
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/mir/${profile?.role || 'user'}/manifiestos`)}
                            className="w-full lg:w-auto"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Documentos
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default TrackingHubPage;
