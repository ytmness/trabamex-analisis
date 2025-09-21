import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PlusCircle, 
  Loader2, 
  Users, 
  UserCheck, 
  UserX, 
  Calendar,
  Download,
  RefreshCw,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Building
} from 'lucide-react';
import supabase from '../../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { columns as createColumns } from './clients-columns';

const AdminClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const { toast } = useToast();

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando clientes...');
      
      const { data, error } = await supabase.rpc('get_users_with_profiles_by_role', {
        p_role: 'user'
      });

      if (error) {
        console.error('❌ Error cargando clientes:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar clientes',
          description: error.message,
        });
        setClients([]);
      } else {
        console.log('✅ Clientes cargados:', data?.length || 0);
        setClients(data || []);
        
        // Calcular estadísticas
        const newStats = {
          total: data?.length || 0,
          active: data?.filter(client => client.status === 'active').length || 0,
          inactive: data?.filter(client => client.status === 'inactive').length || 0,
          newThisMonth: data?.filter(client => {
            const clientDate = new Date(client.created_at);
            const now = new Date();
            return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear();
          }).length || 0
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('❌ Error en fetchClients:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error inesperado al cargar clientes',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Filtrar clientes
  useEffect(() => {
    let filtered = clients;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(client => {
        const clientDate = new Date(client.created_at);
        switch (dateFilter) {
          case 'today':
            return clientDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return clientDate >= weekAgo;
          case 'month':
            return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter, dateFilter]);

  const handleNew = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleCreateUser = async (userData) => {
    try {
      console.log('🔍 Creando perfil de usuario:', userData);
      
      // Crear solo el perfil en la tabla profiles
      const { data: profileData, error: profileError } = await supabase.rpc('create_user_profile', {
        p_email: userData.email,
        p_full_name: userData.full_name,
        p_role: userData.role,
        p_password: userData.password
      });

      if (profileError) {
        console.error('❌ Error creando perfil:', profileError);
        toast({
          variant: 'destructive',
          title: 'Error al crear perfil',
          description: profileError.message,
        });
        return false;
      }

      console.log('✅ Perfil creado:', profileData);

      toast({
        title: 'Perfil creado exitosamente',
        description: `El perfil de ${userData.email} ha sido creado. El usuario debe registrarse normalmente para activar su cuenta.`,
      });
      
      fetchClients();
      return true;
    } catch (error) {
      console.error('❌ Error en handleCreateUser:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error inesperado al crear perfil',
      });
      return false;
    }
  };

  const handleExport = () => {
    toast({
      title: 'Exportando datos',
      description: 'Los datos de clientes se están exportando...',
    });
  };

  const columns = createColumns({ onEdit: handleEdit });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto" />
          <p className="mt-2 text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gestión de Clientes - Panel Admin</title>
        <meta name="description" content="Administra los perfiles y datos de los clientes del sistema." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
                <p className="text-gray-600 mt-1">Administra los perfiles y datos de los clientes</p>
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <Button onClick={fetchClients} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Actualizar
                </Button>
                <Button onClick={handleNew} className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Nuevo Cliente
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Estadísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-white border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inactivos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                  </div>
                  <UserX className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nuevos este Mes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.newThisMonth}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filtros de Búsqueda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-red-600" />
                  Filtros de Búsqueda
                </CardTitle>
                <CardDescription>Filtrar clientes por diferentes criterios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Buscar Cliente</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nombre, email o empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Estado</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="all">Todos los Estados</option>
                      <option value="active">Activos</option>
                      <option value="inactive">Inactivos</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Fecha de Registro</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="all">Todas las Fechas</option>
                      <option value="today">Hoy</option>
                      <option value="week">Esta Semana</option>
                      <option value="month">Este Mes</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setDateFilter('all');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Clientes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />
                  Lista de Clientes
                </CardTitle>
                <CardDescription>
                  {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                    ? `${filteredClients.length} clientes encontrados` 
                    : `${stats.total} clientes registrados en el sistema`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredClients.length > 0 ? (
                  <DataTable columns={columns} data={filteredClients} filterColumn="full_name" />
                ) : (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                        ? 'No se encontraron clientes' 
                        : 'No hay clientes registrados'
                      }
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                        ? 'Intenta ajustar los filtros de búsqueda.'
                        : 'Los nuevos clientes aparecerán aquí cuando se registren.'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Información Adicional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">💡 Información para Administradores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-blue-800 space-y-2">
                  <p className="text-sm">
                    <strong>Gestión de clientes:</strong>
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• <strong>👥 Clientes Activos:</strong> Usuarios con acceso completo al sistema</li>
                    <li>• <strong>📧 Comunicación:</strong> Puedes contactar clientes directamente desde sus perfiles</li>
                    <li>• <strong>📊 Estadísticas:</strong> Monitorea el crecimiento y actividad de clientes</li>
                    <li>• <strong>🔍 Filtros:</strong> Busca clientes por nombre, empresa, estado o fecha de registro</li>
                  </ul>
                  <p className="text-sm mt-3">
                    <strong>Nota:</strong> Todos los cambios en los perfiles de clientes se reflejan inmediatamente en el sistema.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modal para crear/editar usuario */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const userData = {
                email: formData.get('email')?.trim(),
                full_name: formData.get('full_name')?.trim(),
                role: formData.get('role'),
                password: formData.get('password')?.trim() || null
              };
              
              // Validaciones básicas
              if (!userData.email || !userData.full_name) {
                toast({
                  variant: 'destructive',
                  title: 'Error de validación',
                  description: 'Email y nombre completo son obligatorios',
                });
                return;
              }
              
              const success = await handleCreateUser(userData);
              if (success) {
                setIsFormOpen(false);
                setSelectedUser(null);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={selectedUser?.email || ''}
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <Input
                    name="full_name"
                    defaultValue={selectedUser?.full_name || ''}
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    name="role"
                    defaultValue={selectedUser?.role || 'user'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="user">Cliente</option>
                    <option value="operator">Operador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <Input
                    name="password"
                    type="password"
                    placeholder={selectedUser ? "Dejar vacío para mantener actual" : "Opcional - para registro futuro"}
                    className="w-full"
                  />
                  {!selectedUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      El usuario deberá registrarse normalmente para activar su cuenta
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                >
                  {selectedUser ? 'Actualizar' : 'Crear'} Usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminClientsPage;
