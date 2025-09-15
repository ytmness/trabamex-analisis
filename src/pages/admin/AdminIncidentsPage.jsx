import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import supabase from '@/lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Loader2 } from 'lucide-react';
import AdminNavigationButtons from '@/components/admin/AdminNavigationButtons';

const columns = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID Incidencia" />,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Título" />,
    },
    {
        accessorKey: 'type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
        cell: ({ row }) => {
            const typeLabels = {
                'equipment_failure': 'Falla de Equipo',
                'safety_issue': 'Problema de Seguridad',
                'service_delay': 'Retraso en Servicio',
                'quality_issue': 'Problema de Calidad',
                'communication': 'Problema de Comunicación',
                'environmental': 'Problema Ambiental',
                'other': 'Otro'
            };
            return typeLabels[row.original.type] || row.original.type;
        }
    },
    {
        accessorKey: 'priority',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Prioridad" />,
        cell: ({ row }) => {
            const priorityLabels = {
                'low': 'Baja',
                'medium': 'Media',
                'high': 'Alta',
                'critical': 'Crítica'
            };
            return priorityLabels[row.original.priority] || row.original.priority;
        }
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
        cell: ({ row }) => {
            const statusLabels = {
                'pending': 'Pendiente',
                'in_progress': 'En Progreso',
                'resolved': 'Resuelto',
                'closed': 'Cerrado',
                'rejected': 'Rechazado'
            };
            return statusLabels[row.original.status] || row.original.status;
        }
    },
    {
        accessorKey: 'user.full_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Reportado por" />,
        cell: ({ row }) => row.original.user?.full_name || 'N/A'
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
];

const AdminIncidentsPage = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchIncidents = async () => {
            setLoading(true);
            console.log('🔍 AdminIncidentsPage - URL de Supabase:', supabase.supabaseUrl);
            const { data, error } = await supabase
                .from('incidents')
                .select(`
                    *,
                    user:user_id (full_name)
                `)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error fetching incidents:', error);
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las incidencias.' });
            } else {
                setIncidents(data);
            }
            setLoading(false);
        };
        fetchIncidents();
    }, [toast]);

  return (
    <>
      <Helmet>
        <title>Gestionar Incidencias - Admin MIR</title>
        <meta name="description" content="Ver y resolver incidencias reportadas." />
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botones de navegación administrativa */}
        <AdminNavigationButtons />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Incidencias</h1>
            <p className="text-gray-600 mt-1">Revisa y gestiona las incidencias reportadas por los operadores.</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Incidencias Abiertas</CardTitle>
            <CardDescription>Incidencias pendientes de resolución.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
            ) : (
                <DataTable columns={columns} data={incidents} filterColumn="service_order_id" />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminIncidentsPage;
