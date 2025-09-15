import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Loader2, Clock, CheckCircle, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import supabase from '../../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const AdminTreatmentsPage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const { toast } = useToast();

  const fetchBatches = async () => {
    setLoading(true);
    try {
      // Usar service_orders con estado IN_TREATMENT como "lotes de tratamiento"
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          id,
          customer_id,
          status,
          scheduled_date,
          created_at,
          updated_at,
          profiles:customer_id (
            full_name,
            email
          )
        `)
        .in('status', ['IN_TREATMENT', 'TREATED', 'CERTIFIED'])
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching batches:', error);
        toast({ 
          variant: 'destructive', 
          title: 'Error', 
          description: 'No se pudieron cargar los lotes de tratamiento.' 
        });
      } else {
        // Transformar los datos para que coincidan con la estructura esperada
        const transformedData = (data || []).map(order => ({
          id: order.id,
          service_order_id: order.id,
          process: getProcessFromStatus(order.status),
          status: getBatchStatusFromOrderStatus(order.status),
          start_at: order.created_at,
          end_at: order.status === 'CERTIFIED' ? order.updated_at : null,
          service_orders: {
            profiles: order.profiles
          }
        }));
        setBatches(transformedData);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Error inesperado al cargar los datos.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getProcessFromStatus = (status) => {
    const processMap = {
      'IN_TREATMENT': 'incineracion',
      'TREATED': 'autoclave',
      'CERTIFIED': 'quimico'
    };
    return processMap[status] || 'incineracion';
  };

  const getBatchStatusFromOrderStatus = (status) => {
    const statusMap = {
      'IN_TREATMENT': 'active',
      'TREATED': 'completed',
      'CERTIFIED': 'completed'
    };
    return statusMap[status] || 'active';
  };

  useEffect(() => {
    fetchBatches();
  }, [toast]);
  
  const handleSuccess = () => {
    fetchBatches();
    setIsFormOpen(false);
    setEditingBatch(null);
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setIsFormOpen(true);
  };

  const handleDelete = async (batchId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este lote de tratamiento?')) {
      return;
    }

    try {
      // En lugar de eliminar, cambiar el estado de la orden
      const { error } = await supabase
        .from('service_orders')
        .update({
          status: 'EN_ROUTE_TO_TREATMENT'
        })
        .eq('id', batchId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Éxito',
        description: 'Lote de tratamiento eliminado correctamente.',
      });

      fetchBatches();
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el lote de tratamiento.',
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'active': 'default',
      'completed': 'secondary',
      'cancelled': 'destructive'
    };
    
    const labels = {
      'active': 'Activo',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Helmet>
        <title>Tratamientos - Admin MIR</title>
        <meta name="description" content="Gestionar lotes de tratamiento de residuos." />
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Tratamientos</h1>
            <p className="text-gray-600 mt-1">Administra los lotes de tratamiento de residuos peligrosos.</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="bg-red-600 hover:bg-red-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Lote
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Lotes</p>
                  <p className="text-2xl font-bold text-red-600">{batches.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {batches.filter(b => b.status === 'active').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {batches.filter(b => b.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelados</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {batches.filter(b => b.status === 'cancelled').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Lotes */}
        <Card>
          <CardHeader>
            <CardTitle>Lotes de Tratamiento</CardTitle>
            <CardDescription>Gestiona todos los lotes de tratamiento activos y completados.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay lotes de tratamiento</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Crea tu primer lote de tratamiento para comenzar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-gray-600">#{batch.id.slice(-8)}</span>
                        {getStatusBadge(batch.status)}
                      </div>
                      <div className="text-sm text-gray-900">
                        <strong>Orden:</strong> {batch.service_order_id?.slice(-8) || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-900">
                        <strong>Cliente:</strong> {batch.service_orders?.profiles?.full_name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        <strong>Proceso:</strong> {batch.process}
                      </div>
                      <div className="text-sm text-gray-500">
                        <strong>Inicio:</strong> {formatDate(batch.start_at)}
                      </div>
                      {batch.end_at && (
                        <div className="text-sm text-gray-500">
                          <strong>Fin:</strong> {formatDate(batch.end_at)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(batch)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(batch.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <TreatmentFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={handleSuccess}
        editingBatch={editingBatch}
      />
    </>
  );
};

const TreatmentFormDialog = ({ isOpen, setIsOpen, onSuccess, editingBatch }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [process, setProcess] = useState('');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchOrders = async () => {
        setIsFetching(true);
        try {
          const { data, error } = await supabase
            .from('service_orders')
            .select('id, customer_id, status, profiles:customer_id(full_name, email)')
            .in('status', ['EN_ROUTE_TO_TREATMENT', 'IN_TREATMENT', 'TREATED']);
          
          if (error) {
            throw error;
          }
          
          setOrders(data || []);
        } catch (error) {
          console.error('Error fetching orders:', error);
          toast({ 
            variant: 'destructive', 
            title: 'Error', 
            description: 'No se pudieron cargar las órdenes.' 
          });
        } finally {
          setIsFetching(false);
        }
      };
      
      fetchOrders();
      
      // Si estamos editando, cargar los datos del lote
      if (editingBatch) {
        setSelectedOrder(editingBatch.service_order_id || '');
        setProcess(editingBatch.process || '');
        setStatus(editingBatch.status || 'active');
        setNotes(editingBatch.notes || '');
      } else {
        // Resetear formulario para nuevo lote
        setSelectedOrder('');
        setProcess('');
        setStatus('active');
        setNotes('');
      }
    }
  }, [isOpen, editingBatch, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !process) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Completa todos los campos obligatorios.' 
      });
      return;
    }
    
    setLoading(true);

    try {
      // Determinar el nuevo estado basado en el proceso seleccionado
      const newStatus = status === 'completed' ? 'TREATED' : 'IN_TREATMENT';

      if (editingBatch) {
        // Actualizar orden existente
        const { error } = await supabase
          .from('service_orders')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingBatch.id);

        if (error) throw error;

        toast({ 
          title: 'Éxito', 
          description: 'Lote de tratamiento actualizado correctamente.' 
        });
      } else {
        // Actualizar orden existente a estado de tratamiento
        const { error } = await supabase
          .from('service_orders')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedOrder);

        if (error) throw error;

        // Crear evento de tracking
        await supabase
          .from('tracking_events')
          .insert({ 
            service_order_id: selectedOrder, 
            event_type: 'TREATMENT_STARTED' 
          });

        toast({ 
          title: 'Éxito', 
          description: 'Lote de tratamiento creado correctamente.' 
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving batch:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: `Error al ${editingBatch ? 'actualizar' : 'crear'} el lote: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingBatch ? 'Editar Lote de Tratamiento' : 'Nuevo Lote de Tratamiento'}
            </DialogTitle>
            <DialogDescription>
              {editingBatch 
                ? 'Modifica los datos del lote de tratamiento.' 
                : 'Asocia una orden y configura el proceso de tratamiento.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="order">Orden de Servicio</Label>
              {isFetching ? (
                <div className="flex items-center h-10">
                  <Loader2 className="h-4 w-4 animate-spin"/>
                </div>
              ) : (
                <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                  <SelectTrigger id="order">
                    <SelectValue placeholder="Selecciona una orden"/>
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map(o => (
                      <SelectItem key={o.id} value={o.id}>
                        {`${o.id.substring(0,8)} - ${o.profiles?.full_name || 'Cliente'}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="process">Proceso de Tratamiento</Label>
              <Select value={process} onValueChange={setProcess}>
                <SelectTrigger id="process">
                  <SelectValue placeholder="Selecciona un proceso"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incineracion">Incineración</SelectItem>
                  <SelectItem value="autoclave">Autoclave</SelectItem>
                  <SelectItem value="quimico">Tratamiento Químico</SelectItem>
                  <SelectItem value="fisico">Tratamiento Físico</SelectItem>
                  <SelectItem value="biologico">Tratamiento Biológico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Estado del Lote</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecciona un estado"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones sobre el proceso de tratamiento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                editingBatch ? 'Actualizar Lote' : 'Crear Lote'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


export default AdminTreatmentsPage;
