import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Package, 
  Truck, 
  Loader2, 
  UserPlus, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminAssignmentsPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [operators, setOperators] = useState([]);
  const [unassignedCollections, setUnassignedCollections] = useState([]);
  const [unassignedSupplies, setUnassignedSupplies] = useState([]);
  const [assignedCollections, setAssignedCollections] = useState([]);
  const [assignedSupplies, setAssignedSupplies] = useState([]);
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  
  const [assignDialog, setAssignDialog] = useState({ open: false, type: '', item: null });

  const fetchData = useCallback(async () => {
    if (!user) return;
    console.log('🚀 fetchData iniciado...');
    setLoading(true);
    
    try {
      console.log('🔍 Obteniendo operadores...');
      // Obtener operadores
      const { data: operatorsData, error: operatorsError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'operator')
        .order('full_name');
      
      if (operatorsError) throw operatorsError;
      setOperators(operatorsData || []);
      console.log('✅ Operadores obtenidos:', operatorsData?.length || 0);

      console.log('🔍 Obteniendo recolecciones sin asignar...');
      // Obtener recolecciones sin asignar
      const { data: unassignedCollectionsData, error: unassignedCollectionsError } = await supabase
        .from('service_orders')
        .select(`
          id,
          status,
          created_at,
          client_name,
          customer_id
        `)
        .is('operator_id', null)
        .in('status', ['PENDING', 'PENDIENTE', 'EN_PROCESO'])
        .order('created_at', { ascending: false });
      
      console.log('📊 Recolecciones sin asignar:', { 
        data: unassignedCollectionsData, 
        error: unassignedCollectionsError,
        count: unassignedCollectionsData?.length || 0
      });
      
      if (unassignedCollectionsError) throw unassignedCollectionsError;
      setUnassignedCollections(unassignedCollectionsData || []);

      console.log('🔍 Obteniendo recolecciones asignadas...');
      // Obtener recolecciones asignadas
      const { data: assignedCollectionsData, error: assignedCollectionsError } = await supabase
        .from('service_orders')
        .select(`
          id,
          status,
          created_at,
          client_name,
          operator_id,
          customer_id,
          operator:operator_id(full_name)
        `)
        .not('operator_id', 'is', null)
        .in('status', ['PENDING', 'PENDIENTE', 'EN_PROCESO', 'EN_RUTA'])
        .order('created_at', { ascending: false });
      
      console.log('📊 Recolecciones asignadas:', { 
        data: assignedCollectionsData, 
        error: assignedCollectionsError,
        count: assignedCollectionsData?.length || 0
      });
      
      if (assignedCollectionsError) throw assignedCollectionsError;
      setAssignedCollections(assignedCollectionsData || []);

      console.log('🔍 Obteniendo suministros sin asignar...');
      // Obtener solicitudes de insumos sin asignar
      const { data: unassignedSuppliesData, error: unassignedSuppliesError } = await supabase
        .from('supplies_requests')
        .select(`
          id,
          status,
          created_at,
          user_id
        `)
        .is('operator_id', null)
        .in('status', ['pending', 'approved'])
        .order('created_at', { ascending: false });
      
      console.log('📊 Suministros sin asignar:', { 
        data: unassignedSuppliesData, 
        error: unassignedSuppliesError,
        count: unassignedSuppliesData?.length || 0
      });
      
      if (unassignedSuppliesError) throw unassignedSuppliesError;
      setUnassignedSupplies(unassignedSuppliesData || []);

      // Obtener solicitudes de insumos asignadas
      const { data: assignedSuppliesData, error: assignedSuppliesError } = await supabase
        .from('supplies_requests')
        .select(`
          id,
          status,
          created_at,
          operator_id,
          user_id,
          operator:operator_id(full_name)
        `)
        .not('operator_id', 'is', null)
        .in('status', ['pending', 'approved', 'delivered'])
        .order('created_at', { ascending: false });
      
      if (assignedSuppliesError) throw assignedSuppliesError;
      setAssignedSupplies(assignedSuppliesData || []);

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar datos',
        description: error.message,
      });
    } finally {
      console.log('✅ fetchData completado');
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignOperator = async (itemId, type) => {
    if (!selectedOperator) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor selecciona un operador',
      });
      return;
    }

    try {
      const tableName = type === 'collection' ? 'service_orders' : 'supplies_requests';
      
      const { error } = await supabase
        .from(tableName)
        .update({ operator_id: selectedOperator })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Operador Asignado',
        description: `Se asignó el operador a la ${type === 'collection' ? 'recolección' : 'solicitud de insumos'}`,
      });

      setAssignDialog({ open: false, type: '', item: null });
      setSelectedOperator('');
      fetchData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `No se pudo asignar el operador: ${error.message}`,
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'EN_PROCESO': 'bg-blue-100 text-blue-800',
      'EN_RUTA': 'bg-purple-100 text-purple-800',
      'COLLECTED': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'PENDIENTE' || status === 'pending') return <Clock className="h-4 w-4" />;
    if (status === 'EN_PROCESO' || status === 'approved') return <AlertCircle className="h-4 w-4" />;
    if (status === 'EN_RUTA' || status === 'delivered') return <CheckCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const filteredUnassignedCollections = unassignedCollections.filter(item => {
    // Si no hay término de búsqueda, mostrar todas las recolecciones
    if (!searchTerm.trim()) return true;
    
    // Si client_name es null, usar el ID como fallback
    const searchableText = item.client_name || `Recolección ${item.id.substring(0, 8)}`;
    const matchesSearch = searchableText.toLowerCase().includes(searchTerm.toLowerCase());
    
    console.log('🔍 Filtro recolecciones:', { 
      item: item.id, 
      client_name: item.client_name, 
      searchableText,
      searchTerm, 
      matchesSearch 
    });
    return matchesSearch;
  });
  
  console.log('📊 Resultado del filtro:', {
    total: unassignedCollections.length,
    filtradas: filteredUnassignedCollections.length,
    searchTerm
  });

  const filteredUnassignedSupplies = unassignedSupplies.filter(item => {
    const matchesSearch = true; // Sin nombre de usuario por ahora
    return matchesSearch;
  });

  const filteredAssignedCollections = assignedCollections.filter(item => {
    const matchesSearch = item.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOperator = selectedOperator === 'all' || item.operator_id === selectedOperator;
    return matchesSearch && matchesOperator;
  });

  const filteredAssignedSupplies = assignedSupplies.filter(item => {
    const matchesSearch = true; // Sin nombre de usuario por ahora
    const matchesOperator = selectedOperator === 'all' || item.operator_id === selectedOperator;
    return matchesSearch && matchesOperator;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Asignaciones - Admin MIR</title>
        <meta name="description" content="Gestiona las asignaciones de operadores a recolecciones e insumos." />
      </Helmet>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Asignaciones</h1>
              <p className="text-gray-600">Asigna operadores a recolecciones y solicitudes de insumos</p>
            </div>
            <Button 
              onClick={fetchData} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Search className="h-4 w-4" />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </motion.div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Buscar por cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator-filter">Filtrar por Operador</Label>
                <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los operadores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los operadores</SelectItem>
                    {operators.map(operator => (
                      <SelectItem key={operator.id} value={operator.id}>
                        {operator.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recolecciones Sin Asignar</p>
                  <p className="text-2xl font-bold text-gray-900">{unassignedCollections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Insumos Sin Asignar</p>
                  <p className="text-2xl font-bold text-gray-900">{unassignedSupplies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recolecciones Asignadas</p>
                  <p className="text-2xl font-bold text-gray-900">{assignedCollections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Operadores</p>
                  <p className="text-2xl font-bold text-gray-900">{operators.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recolecciones Sin Asignar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-red-600" />
              Recolecciones Sin Asignar ({filteredUnassignedCollections.length})
            </CardTitle>
            <CardDescription>Órdenes de recolección que necesitan asignación de operador</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUnassignedCollections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay recolecciones sin asignar
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUnassignedCollections.map((collection) => (
                  <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(collection.status)}>
                          {getStatusIcon(collection.status)}
                          <span className="ml-1">{collection.status}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          #{collection.id.substring(0, 8)}
                        </span>
                      </div>
                      <p className="font-medium">
                        {collection.client_name || 'Sin nombre'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Creada: {format(new Date(collection.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <Button
                      onClick={() => setAssignDialog({ open: true, type: 'collection', item: collection })}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Asignar Operador
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Solicitudes de Insumos Sin Asignar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Solicitudes de Insumos Sin Asignar ({filteredUnassignedSupplies.length})
            </CardTitle>
            <CardDescription>Solicitudes de insumos que necesitan asignación de operador</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUnassignedSupplies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay solicitudes de insumos sin asignar
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUnassignedSupplies.map((supply) => (
                  <div key={supply.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(supply.status)}>
                          {getStatusIcon(supply.status)}
                          <span className="ml-1">{supply.status}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          #{supply.id.substring(0, 8)}
                        </span>
                      </div>
                      <p className="font-medium">
                        Solicitud #{supply.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Creada: {format(new Date(supply.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <Button
                      onClick={() => setAssignDialog({ open: true, type: 'supply', item: supply })}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Asignar Operador
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asignaciones Existentes */}
        {(filteredAssignedCollections.length > 0 || filteredAssignedSupplies.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Asignaciones Existentes
              </CardTitle>
              <CardDescription>Recolecciones e insumos ya asignados a operadores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Recolecciones Asignadas */}
                {filteredAssignedCollections.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recolecciones Asignadas ({filteredAssignedCollections.length})</h4>
                    <div className="space-y-3">
                      {filteredAssignedCollections.map((collection) => (
                        <div key={collection.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getStatusColor(collection.status)}>
                                {getStatusIcon(collection.status)}
                                <span className="ml-1">{collection.status}</span>
                              </Badge>
                              <span className="text-sm text-gray-500">
                                #{collection.id.substring(0, 8)}
                              </span>
                            </div>
                            <p className="font-medium">
                              {collection.client_name || 'Sin nombre'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Asignado a: <span className="font-medium">{collection.operator?.full_name}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insumos Asignados */}
                {filteredAssignedSupplies.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Insumos Asignados ({filteredAssignedSupplies.length})</h4>
                    <div className="space-y-3">
                      {filteredAssignedSupplies.map((supply) => (
                        <div key={supply.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getStatusColor(supply.status)}>
                                {getStatusIcon(supply.status)}
                                <span className="ml-1">{supply.status}</span>
                              </Badge>
                              <span className="text-sm text-gray-500">
                                #{supply.id.substring(0, 8)}
                              </span>
                            </div>
                            <p className="font-medium">
                              Solicitud #{supply.id.substring(0, 8)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Asignado a: <span className="font-medium">{supply.operator?.full_name}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog de Asignación */}
        <Dialog open={assignDialog.open} onOpenChange={(open) => !open && setAssignDialog({ open: false, type: '', item: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Asignar Operador</DialogTitle>
              <DialogDescription>
                Selecciona un operador para asignar a esta {assignDialog.type === 'collection' ? 'recolección' : 'solicitud de insumos'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="operator-select">Operador</Label>
                <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un operador" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map(operator => (
                      <SelectItem key={operator.id} value={operator.id}>
                        {operator.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAssignDialog({ open: false, type: '', item: null })}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleAssignOperator(assignDialog.item.id, assignDialog.type)}
                disabled={!selectedOperator}
                className={assignDialog.type === 'collection' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                Asignar Operador
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminAssignmentsPage;
