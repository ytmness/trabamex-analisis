import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, MoreHorizontal, Edit } from 'lucide-react';
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
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const columnsFactory = (onEdit) => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre del Plan" />,
  },
  {
    accessorKey: 'price_mxn',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Precio (MXN)" />,
    cell: ({ row }) => `$${row.original.price_mxn.toFixed(2)}`
  },
  {
    accessorKey: 'kg_included',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kg Incluidos" />,
  },
  {
    accessorKey: 'overage_price_mxn',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Precio Excedente ($/kg)" />,
    cell: ({ row }) => `$${row.original.overage_price_mxn.toFixed(2)}`
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(plan)}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const AdminPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { toast } = useToast();

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('plans').select('*');
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los planes.' });
    } else {
      setPlans(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, [toast]);
  
  const handleNew = () => {
    setSelectedPlan(null);
    setIsFormOpen(true);
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    fetchPlans();
    setIsFormOpen(false);
  };
  
  const columns = columnsFactory(handleEdit);

  return (
    <>
      <Helmet>
        <title>Gestionar Planes - Admin MIR</title>
        <meta name="description" content="Ver, crear y editar planes comerciales." />
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botones de navegación administrativa */}
        <AdminNavigationButtons />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Planes</h1>
            <p className="text-gray-600 mt-1">Administra el catálogo de planes y suscripciones.</p>
          </div>
          <Button onClick={handleNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Plan
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Planes</CardTitle>
            <CardDescription>Planes disponibles en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : (
              <DataTable columns={columns} data={plans} filterColumn="name" />
            )}
          </CardContent>
        </Card>
      </div>
      <PlanFormDialog 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen}
        plan={selectedPlan}
        onSuccess={handleSuccess}
      />
    </>
  );
};

const PlanFormDialog = ({ isOpen, setIsOpen, plan, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', price_mxn: '', kg_included: '', overage_price_mxn: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!plan;

  useEffect(() => {
    if (plan) {
      setFormData(plan);
    } else {
      setFormData({ name: '', price_mxn: '', kg_included: '', overage_price_mxn: '' });
    }
  }, [plan]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const upsertData = {
      name: formData.name,
      price_mxn: parseFloat(formData.price_mxn),
      kg_included: parseInt(formData.kg_included, 10),
      overage_price_mxn: parseFloat(formData.overage_price_mxn)
    };
    
    if(isEditing) upsertData.id = plan.id;

    const { error } = await supabase.from('plans').upsert(upsertData);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Éxito', description: `Plan ${isEditing ? 'actualizado' : 'creado'} correctamente.` });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Plan' : 'Crear Nuevo Plan'}</DialogTitle>
            <DialogDescription>Completa los detalles del plan comercial.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Plan</Label>
              <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_mxn">Precio (MXN)</Label>
              <Input id="price_mxn" type="number" step="0.01" value={formData.price_mxn} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kg_included">Kg Incluidos</Label>
              <Input id="kg_included" type="number" value={formData.kg_included} onChange={handleChange} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="overage_price_mxn">Precio Excedente ($/kg)</Label>
              <Input id="overage_price_mxn" type="number" step="0.01" value={formData.overage_price_mxn} onChange={handleChange} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? 'Guardar Cambios' : 'Crear Plan')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPlansPage;
