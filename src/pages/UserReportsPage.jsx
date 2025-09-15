import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { UserCard, UserCardContent, UserCardHeader, UserCardTitle, UserCardDescription } from '@/components/ui/user-card';
import { UserButton } from '@/components/ui/user-button';
import { 
  AlertTriangle, 
  Plus, 
  Eye, 
  Calendar, 
  BarChart3, 
  Loader2,
  Filter,
  Send,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';

const UserIncidentsPage = () => {
  const { profile, user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'TECNICO',
    priority: 'MEDIA'
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchUserIncidents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Consultar incidencias del usuario desde la base de datos
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setIncidents(data || []);
      setFilteredIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar incidencias',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchUserIncidents();
  }, [fetchUserIncidents]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'all') {
      setFilteredIncidents(incidents);
    } else {
      setFilteredIncidents(incidents.filter(incident => incident.type === newFilter));
    }
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          status: 'OPEN'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Incidencia reportada',
        description: 'Tu incidencia ha sido enviada exitosamente.',
      });

      // Limpiar formulario y cerrar
      setFormData({ title: '', description: '', type: 'TECNICO', priority: 'MEDIA' });
      setShowForm(false);
      
      // Recargar incidencias
      fetchUserIncidents();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al reportar incidencia',
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'TECNICO':
        return '🔧';
      case 'SERVICIO':
        return '🚛';
      case 'FACTURACION':
        return '💰';
      case 'GENERAL':
        return '📋';
      default:
        return '⚠️';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'TECNICO':
        return 'bg-blue-100 text-blue-800';
      case 'SERVICIO':
        return 'bg-green-100 text-green-800';
      case 'FACTURACION':
        return 'bg-yellow-100 text-yellow-800';
      case 'GENERAL':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="user-theme min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reportar Incidencias - Cliente MIR</title>
        <meta name="description" content="Reporta problemas o incidencias con nuestros servicios." />
      </Helmet>
      <div className="user-theme min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Reportar Incidencias</h1>
            <p className="mt-1 text-gray-600">Reporta problemas o incidencias con nuestros servicios</p>
          </motion.div>

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8"
          >
            <UserCard className="user-card">
              <UserCardHeader>
                <UserCardTitle>Filtrar Reportes</UserCardTitle>
                <UserCardDescription>Selecciona el tipo de documento que deseas ver</UserCardDescription>
              </UserCardHeader>
              <UserCardContent>
                <div className="flex flex-wrap gap-2">
                  <UserButton
                    onClick={() => handleFilterChange('all')}
                    variant={filter === 'all' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Todos
                  </UserButton>
                  <UserButton
                    onClick={() => handleFilterChange('RECOLECCION')}
                    variant={filter === 'RECOLECCION' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    🗑️ Recolección
                  </UserButton>
                  <UserButton
                    onClick={() => handleFilterChange('CERTIFICADO')}
                    variant={filter === 'CERTIFICADO' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    📜 Certificados
                  </UserButton>
                  <UserButton
                    onClick={() => handleFilterChange('INSUMOS')}
                    variant={filter === 'INSUMOS' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    📦 Insumos
                  </UserButton>
                  <UserButton
                    onClick={() => handleFilterChange('HISTORIAL')}
                    variant={filter === 'HISTORIAL' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    📊 Historial
                  </UserButton>
                </div>
              </UserCardContent>
            </UserCard>
          </motion.div>

          {/* Lista de Reportes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <UserCard className="user-card">
              <UserCardHeader>
                <UserCardTitle>Documentos Disponibles</UserCardTitle>
                <UserCardDescription>
                  {filter === 'all' 
                    ? `Total: ${incidents.length} documentos` 
                    : `${filteredIncidents.length} documentos de ${filter.toLowerCase()}`
                  }
                </UserCardDescription>
              </UserCardHeader>
              <UserCardContent>
                {filteredIncidents.length > 0 ? (
                  <div className="space-y-4">
                    {filteredIncidents.map((incident, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{getTypeIcon(report.type)}</div>
                          <div>
                            <div className="font-medium text-gray-900">{report.title}</div>
                            <div className="text-sm text-gray-600">{report.description}</div>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(report.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {report.format} • {report.size}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                            {report.type}
                          </span>
                          <div className="flex space-x-2">
                            <UserButton
                              onClick={() => viewReport(report.id)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Ver
                            </UserButton>
                            <UserButton
                              onClick={() => downloadReport(report.id)}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Descargar
                            </UserButton>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {filter === 'all' ? 'No hay reportes disponibles' : `No hay reportes de ${filter.toLowerCase()}`}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filter === 'all' 
                        ? 'Los reportes aparecerán aquí cuando estén disponibles.' 
                        : 'Intenta con otro filtro o revisa más tarde.'
                      }
                    </p>
                  </div>
                )}
              </UserCardContent>
            </UserCard>
          </motion.div>

          {/* Información Adicional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <UserCard className="user-card bg-blue-50 border-blue-200">
              <UserCardHeader>
                <UserCardTitle className="text-blue-900">💡 Información Importante</UserCardTitle>
              </UserCardHeader>
              <UserCardContent>
                <div className="text-blue-800 space-y-2">
                  <p className="text-sm">
                    <strong>Tipos de documentos disponibles:</strong>
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• <strong>🗑️ Recolección:</strong> Reportes mensuales de servicios de recolección</li>
                    <li>• <strong>📜 Certificados:</strong> Documentos oficiales de cumplimiento ambiental</li>
                    <li>• <strong>📦 Insumos:</strong> Reportes de insumos utilizados y solicitados</li>
                    <li>• <strong>📊 Historial:</strong> Historial completo de servicios contratados</li>
                  </ul>
                  <p className="text-sm mt-3">
                    <strong>Nota:</strong> Todos los documentos están disponibles en formato PDF y se pueden descargar o visualizar en línea.
                  </p>
                </div>
              </UserCardContent>
            </UserCard>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UserIncidentsPage;
