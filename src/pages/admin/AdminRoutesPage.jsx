import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, MoreHorizontal, MapPin, Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const RouteFormDialog = ({ isOpen, setIsOpen, onSuccess }) => {
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetchingOperators, setIsFetchingOperators] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
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
      fetchOperators();
    }
  }, [isOpen, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOperator || !date) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, completa todos los campos.' });
      return;
    }
    setLoading(true);
    
    const { data, error } = await supabase
      .from('routes')
      .insert({ operator_id: selectedOperator, date: date, status: 'Planeada' })
      .select()
      .single();

    if (error) {
      toast({ variant: 'destructive', title: 'Error al crear la ruta', description: error.message });
    } else {
      toast({ title: 'Éxito', description: `Ruta creada con ID: ${data.id}` });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nueva Ruta</DialogTitle>
            <DialogDescription>Asigna un operador y una fecha para la nueva ruta.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="operator">Operador</Label>
              {isFetchingOperators ? (
                <div className="flex items-center justify-center h-10 rounded-md border border-input">
                  <Loader2 className="h-4 w-4 animate-spin"/>
                </div>
              ) : (
                <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                  <SelectTrigger id="operator">
                    <SelectValue placeholder="Selecciona un operador" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map(op => (
                      <SelectItem key={op.id} value={op.id}>{op.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha de la Ruta</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Crear Ruta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ManageStopsDialog = ({ isOpen, setIsOpen, route, onUpdate }) => {
  const { toast } = useToast();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState('');

  useEffect(() => {
    if (isOpen && route) {
      fetchData();
    }
  }, [isOpen, route]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch assigned orders
    const { data: assigned, error: assignedError } = await supabase
      .from('route_stops')
      .select('id, service_order_id')
      .eq('route_id', route.id);
    if(assignedError) toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las paradas asignadas.' });
    else setAssignedOrders(assigned);

    // Fetch available orders
    const { data: available, error: availableError } = await supabase
      .from('service_orders')
      .select('id, customer:customer_id(full_name)')
      .in('status', ['CREATED', 'SCHEDULED']); // or any other status that makes it "available"
    
    if(availableError) toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las órdenes disponibles.' });
    else {
      const assignedIds = assigned.map(s => s.service_order_id);
      setAvailableOrders(available.filter(o => !assignedIds.includes(o.id)));
    }
    
    setLoading(false);
  };
  
  const handleAddStop = async () => {
    if (!selectedOrder) return;
    const { error } = await supabase
      .from('route_stops')
      .insert({ route_id: route.id, service_order_id: selectedOrder });
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo agregar la parada: ${error.message}` });
    } else {
      toast({ title: 'Éxito', description: 'Parada agregada a la ruta.' });
      fetchData();
      onUpdate();
      setSelectedOrder('');
    }
  };

  const handleRemoveStop = async (stopId) => {
     const { error } = await supabase
      .from('route_stops')
      .delete()
      .eq('id', stopId);
      
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo quitar la parada: ${error.message}` });
    } else {
      toast({ title: 'Éxito', description: 'Parada eliminada de la ruta.' });
      fetchData();
      onUpdate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gestionar Paradas para Ruta #{route?.id.substring(0,8)}</DialogTitle>
          <DialogDescription>Añade o elimina órdenes de servicio de esta ruta.</DialogDescription>
        </DialogHeader>
        {loading ? <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" /> : (
          <div className="grid gap-6 py-4">
            <div>
              <Label>Órdenes Asignadas</Label>
              <div className="mt-2 space-y-2">
                {assignedOrders.length > 0 ? assignedOrders.map(stop => (
                  <div key={stop.id} className="flex items-center justify-between p-2 border rounded-md">
                    <span className="text-sm font-mono">{stop.service_order_id}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveStop(stop.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )) : <p className="text-sm text-muted-foreground text-center py-4">No hay paradas asignadas.</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-select">Añadir Orden a la Ruta</Label>
               <div className="flex gap-2">
                <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                  <SelectTrigger id="order-select">
                    <SelectValue placeholder="Selecciona una orden disponible" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrders.map(o => (
                      <SelectItem key={o.id} value={o.id}>{`${o.id.substring(0,8)} - ${o.customer.full_name}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddStop} disabled={!selectedOrder}>Añadir</Button>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const AdminRoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStopsModalOpen, setIsStopsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const { toast } = useToast();

  const fetchRoutes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *, 
        operator:operator_id (full_name),
        stops:route_stops(count)
      `)
      .order('date', { ascending: false });
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las rutas.' });
    } else {
      setRoutes(data.map(r => ({...r, stops: r.stops[0]?.count || 0})));
    }
    setLoading(false);
  }
  
  const handleManageStops = (route) => {
    setSelectedRoute(route);
    setIsStopsModalOpen(true);
  };
  
  const columnsFactory = (onManageStops) => [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID Ruta" />,
      cell: ({ row }) => <div className="font-mono text-xs">{row.original.id}</div>
    },
    {
      accessorKey: 'operator.full_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Operador" />,
    },
    {
      accessorKey: 'date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    },
    {
      accessorKey: 'stops',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Paradas" />,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const route = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onManageStops(route)}>
                <MapPin className="mr-2 h-4 w-4" /> Gestionar Paradas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    fetchRoutes();
  }, [toast]);

  const handleSuccess = () => {
    fetchRoutes();
    setIsFormOpen(false);
  };
  
  const columns = columnsFactory(handleManageStops);

  return (
    <>
      <Helmet>
        <title>Gestionar Rutas - Admin MIR</title>
        <meta name="description" content="Ver, crear y asignar rutas." />
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botones de navegación administrativa */}
        <AdminNavigationButtons />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Rutas</h1>
            <p className="text-gray-700 mt-1">Planifica las rutas diarias y asigna operadores.</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Ruta
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Rutas Programadas</CardTitle>
            <CardDescription>Rutas planificadas para los operadores.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : (
              <DataTable columns={columns} data={routes} filterColumn="id" />
            )}
          </CardContent>
        </Card>
      </div>
      <RouteFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={handleSuccess}
      />
      <ManageStopsDialog 
        isOpen={isStopsModalOpen}
        setIsOpen={setIsStopsModalOpen}
        route={selectedRoute}
        onUpdate={fetchRoutes}
      />
    </>
  );
};


export default AdminRoutesPage;
