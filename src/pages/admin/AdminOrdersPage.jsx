import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, MoreHorizontal, Eye, CheckCircle, Play, X, Clock, AlertCircle, MapPin, Truck, Building, Package } from 'lucide-react';
import supabase from '../../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import AdminNavigationButtons from '@/components/admin/AdminNavigationButtons';
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
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Badge } from '@/components/ui/badge';

// Estados disponibles para las órdenes
const ORDER_STATUSES = {
  PLANNED: { label: 'Planificada', color: 'bg-gray-100 text-gray-800', icon: Clock },
  EN_ROUTE_TO_PICKUP: { label: 'En Camino', color: 'bg-blue-100 text-blue-800', icon: Play },
  ON_SITE_PICKUP: { label: 'En el Sitio', color: 'bg-yellow-100 text-yellow-800', icon: MapPin },
  COLLECTED: { label: 'Recolectada', color: 'bg-orange-100 text-orange-800', icon: CheckCircle },
  EN_ROUTE_TO_DEPOT: { label: 'En Ruta al Depósito', color: 'bg-purple-100 text-purple-800', icon: Truck },
  AT_DEPOT: { label: 'En Depósito', color: 'bg-indigo-100 text-indigo-800', icon: Building },
  WEIGHED_VERIFIED: { label: 'Pesado y Verificado', color: 'bg-blue-100 text-blue-800', icon: Package },
  EN_ROUTE_TO_TREATMENT: { label: 'En Transporte', color: 'bg-yellow-100 text-yellow-800', icon: Truck },
  IN_TREATMENT: { label: 'En Tratamiento', color: 'bg-purple-100 text-purple-800', icon: Clock },
  TREATED: { label: 'Tratada', color: 'bg-indigo-100 text-indigo-800', icon: CheckCircle },
  CERTIFIED: { label: 'Certificada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: X }
};

const columnsFactory = (navigate, role, onStatusChange) => [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID Orden" />,
    cell: ({ row }) => <div className="font-mono text-xs">{row.original.id}</div>
  },
  {
    accessorKey: 'customer.full_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
  },
  {
    accessorKey: 'operator.full_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Operador Asignado" />,
    cell: ({ row }) => row.original.operator?.full_name || 'Sin asignar',
  },
  {
    accessorKey: 'residue_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo Residuo" />,
    cell: ({ row }) => {
      const type = row.original.residue_type;
      return type === 'rp' ? 'Residuos Peligrosos' : type;
    }
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cantidad" />,
    cell: ({ row }) => `${row.original.quantity} ${row.original.unit}`,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const status = row.original.status;
              const statusConfig = ORDER_STATUSES[status] || ORDER_STATUSES.PLANNED;
      const IconComponent = statusConfig.icon;
      
      return (
        <Badge className={statusConfig.color}>
          <IconComponent className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Creada" />,
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;
      const currentStatus = order.status;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Ver Seguimiento */}
            <DropdownMenuItem onClick={() => navigate(`/mir/${role}/tracking/${order.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> Ver Seguimiento
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Cambios de Estado */}
            {currentStatus === 'PLANNED' && (
              <DropdownMenuItem onClick={() => onStatusChange(order.id, 'EN_ROUTE_TO_PICKUP')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Aprobar Orden
              </DropdownMenuItem>
            )}
            
            {currentStatus === 'EN_ROUTE_TO_PICKUP' && (
              <DropdownMenuItem onClick={() => onStatusChange(order.id, 'ON_SITE_PICKUP')}>
                <Play className="mr-2 h-4 w-4" /> Iniciar Recolección
              </DropdownMenuItem>
            )}
            
            {currentStatus === 'ON_SITE_PICKUP' && (
              <DropdownMenuItem onClick={() => onStatusChange(order.id, 'COLLECTED')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Marcar Completada
              </DropdownMenuItem>
            )}
            
            {/* Cancelar en cualquier estado excepto completada */}
            {currentStatus !== 'COLLECTED' && (
              <DropdownMenuItem 
                onClick={() => onStatusChange(order.id, 'CANCELLED')}
                className="text-red-600"
              >
                <X className="mr-2 h-4 w-4" /> Cancelar Orden
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_orders')
      .select(`*, customer:customer_id (full_name), operator:operator_id (full_name)`)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las órdenes.' });
    } else {
      setOrders(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, [toast]);

  const handleSuccess = () => {
    fetchOrders();
    setIsFormOpen(false);
  };

  // Función para cambiar el estado de una orden
  const handleStatusChange = async (orderId, newStatus) => {
    if (updatingStatus) return;
    
    setUpdatingStatus(true);
    
    try {
      // 1. Actualizar el estado de la orden
      const { error: updateError } = await supabase
        .from('service_orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        throw new Error(`Error al actualizar estado: ${updateError.message}`);
      }

      // 2. Crear evento de tracking
      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert({
          service_order_id: orderId,
          event_type: newStatus,
          description: `Estado cambiado a: ${ORDER_STATUSES[newStatus]?.label || newStatus}`,
          location: null,
          metadata: { previous_status: orders.find(o => o.id === orderId)?.status }
        });

      if (trackingError) {
        console.error('Error al crear evento de tracking:', trackingError);
        // No lanzamos error aquí porque la orden se actualizó correctamente
      }

      // 3. Actualizar la lista local
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      // 4. Mostrar notificación de éxito
      toast({
        title: 'Estado Actualizado',
        description: `La orden ${orderId.slice(0, 8)}... ha sido marcada como ${ORDER_STATUSES[newStatus]?.label || newStatus}`,
      });

    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `No se pudo cambiar el estado: ${error.message}`,
      });
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const columns = columnsFactory(navigate, profile?.role, handleStatusChange);

  return (
    <>
      <Helmet>
        <title>Gestionar Órdenes - Admin MIR</title>
        <meta name="description" content="Ver, crear y editar órdenes de servicio." />
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botones de navegación administrativa */}
        <AdminNavigationButtons />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Órdenes de Servicio</h1>
            <p className="text-gray-600 mt-1">Administra todas las órdenes de recolección e insumos.</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Órdenes</CardTitle>
            <CardDescription>Lista de todas las órdenes de servicio.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : (
              <DataTable columns={columns} data={orders} filterColumn="id" />
            )}
          </CardContent>
        </Card>
      </div>
      <OrderFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
};

const OrderFormDialog = ({ isOpen, setIsOpen, onSuccess }) => {
  const [clients, setClients] = useState([]);
  const [operators, setOperators] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetchingClients, setIsFetchingClients] = useState(true);
  const [isFetchingOperators, setIsFetchingOperators] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchClients = async () => {
        setIsFetchingClients(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'user');
        if (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los clientes.' });
        } else {
          setClients(data);
        }
        setIsFetchingClients(false);
      };

      const fetchOperators = async () => {
        setIsFetchingOperators(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'operator');
        if (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los operadores.' });
        } else {
          setOperators(data);
        }
        setIsFetchingOperators(false);
      };

      fetchClients();
      fetchOperators();
    }
  }, [isOpen, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona un cliente.' });
      return;
    }
    setLoading(true);

    // Crear orden directamente con operator_id asignado
    const { data, error } = await supabase
      .from('service_orders')
      .insert({
        customer_id: selectedClient,
        operator_id: selectedOperator || null, // Asignar operador si se seleccionó
        status: 'PENDIENTE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      toast({ variant: 'destructive', title: 'Error al crear la orden', description: error.message });
    } else {
      toast({ title: 'Éxito', description: `Orden creada con ID: ${data.id}` });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nueva Orden de Servicio</DialogTitle>
            <DialogDescription>Selecciona el cliente y opcionalmente asigna un operador.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              {isFetchingClients ? (
                <div className="flex items-center justify-center h-10 rounded-md border border-input">
                  <Loader2 className="h-4 w-4 animate-spin"/>
                </div>
              ) : (
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="operator">Operador (Opcional)</Label>
              {isFetchingOperators ? (
                <div className="flex items-center justify-center h-10 rounded-md border border-input">
                  <Loader2 className="h-4 w-4 animate-spin"/>
                </div>
              ) : (
                <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                  <SelectTrigger id="operator">
                    <SelectValue placeholder="Selecciona un operador (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {operators.map(operator => (
                      <SelectItem key={operator.id} value={operator.id}>{operator.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Crear Orden'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminOrdersPage;
