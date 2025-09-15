import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import supabase from '../../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { columns as createColumns } from './operators-columns';
import { UserFormDialog } from '@/components/admin/UserFormDialog';
import AdminNavigationButtons from '@/components/admin/AdminNavigationButtons';

const AdminOperatorsPage = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { toast } = useToast();

  const fetchOperators = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_users_with_profiles_by_role', {
      p_role: 'operator'
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar operadores',
        description: error.message,
      });
      setOperators([]);
    } else {
      setOperators(data);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchOperators();
  }, [toast]);
  
  const handleNew = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    fetchOperators();
    setIsFormOpen(false);
  };
  
  const columns = createColumns({ onEdit: handleEdit });

  return (
    <>
      <Helmet>
        <title>Gestionar Operadores - Admin MIR</title>
        <meta name="description" content="Ver, crear y editar operadores." />
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botones de navegación administrativa */}
        <AdminNavigationButtons />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Operadores</h1>
            <p className="text-gray-600 mt-1">Administra los perfiles y asignaciones de los operadores.</p>
          </div>
          <Button onClick={handleNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Operador
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Operadores</CardTitle>
            <CardDescription>Operadores registrados en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : (
              <DataTable columns={columns} data={operators} filterColumn="full_name"/>
            )}
          </CardContent>
        </Card>
      </div>
      <UserFormDialog 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen}
        user={selectedUser}
        onSuccess={handleSuccess}
        defaultRole="operator"
      />
    </>
  );
};

export default AdminOperatorsPage;
