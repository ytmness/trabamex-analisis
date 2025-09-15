import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Plus,
  Eye,
  Calendar,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '../../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const OperatorIncidentsPage = () => {
  const { profile, user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const fetchOperatorIncidents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Obtener incidencias reportadas por el operador
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select(`
          id,
          title,
          description,
          type,
          priority,
          status,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (incidentsError) throw incidentsError;

      setIncidents(incidentsData || []);
    } catch (error) {
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
    fetchOperatorIncidents();
  }, [fetchOperatorIncidents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-400 mx-auto mb-4" />
          <p className="text-white text-lg">Cargando incidencias...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
        return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <AlertCircle className="h-4 w-4" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CLOSED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'ALTA':
        return 'bg-red-100 text-red-800';
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800';
      case 'BAJA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'TECNICO':
        return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      case 'SERVICIO':
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
      case 'FACTURACION':
        return <AlertCircle className="h-5 w-5 text-purple-400" />;
      case 'GENERAL':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'all') return true;
    return incident.status === filter;
  });

  return (
    <>
      <Helmet>
        <title>Mis Incidencias - Operador MIR</title>
        <meta name="description" content="Gestiona todas las incidencias reportadas como operador." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-800 to-black text-white">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-sm border-b border-green-600">
          <div className="container mx-auto px-6 py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-200 bg-clip-text text-transparent">
                  Mis Incidencias
                </h1>
                <p className="mt-2 text-green-100 text-lg">Gestiona todas las incidencias reportadas</p>
              </div>
              <div className="flex items-center space-x-3 bg-green-600/50 px-4 py-2 rounded-full border border-green-500">
                <AlertTriangle className="h-6 w-6 text-green-200" />
                <span className="text-white font-semibold text-sm">OPERADOR</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Resumen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Incidencias</p>
                  <div className="text-3xl font-bold text-white mt-1">{incidents.length}</div>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-blue-200" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 shadow-lg border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Abiertas</p>
                  <div className="text-3xl font-bold text-white mt-1">
                    {incidents.filter(i => i.status === 'OPEN').length}
                  </div>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-full">
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">En Progreso</p>
                  <div className="text-3xl font-bold text-white mt-1">
                    {incidents.filter(i => i.status === 'IN_PROGRESS').length}
                  </div>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <AlertCircle className="h-8 w-8 text-purple-200" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Resueltas</p>
                  <div className="text-3xl font-bold text-white mt-1">
                    {incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length}
                  </div>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-green-600">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Filtrar Incidencias</h2>
                <Link 
                  to="/mir/operator/incident/new"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nueva Incidencia</span>
                </Link>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    filter === 'all' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Todas ({incidents.length})
                </button>
                <button
                  onClick={() => setFilter('OPEN')}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    filter === 'OPEN' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Abiertas ({incidents.filter(i => i.status === 'OPEN').length})
                </button>
                <button
                  onClick={() => setFilter('IN_PROGRESS')}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    filter === 'IN_PROGRESS' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  En Progreso ({incidents.filter(i => i.status === 'IN_PROGRESS').length})
                </button>
                <button
                  onClick={() => setFilter('RESOLVED')}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    filter === 'RESOLVED' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Resueltas ({incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length})
                </button>
              </div>
            </div>
          </motion.div>

          {/* Lista de Incidencias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-green-600">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Incidencias Reportadas</h2>
                <p className="text-green-200">Gestiona las incidencias que has reportado</p>
              </div>
              
              {filteredIncidents.length > 0 ? (
                <div className="space-y-4">
                  {filteredIncidents.map((incident, index) => (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-green-900/30 rounded-lg p-6 border border-green-600/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getTypeIcon(incident.type)}
                          <div>
                            <div className="font-medium text-white text-lg">
                              {incident.title}
                            </div>
                            <div className="text-sm text-green-200">
                              {incident.description?.substring(0, 100)}...
                            </div>
                            <div className="text-xs text-green-300">
                              Creada: {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(incident.priority)}`}>
                            {incident.priority}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(incident.status)}`}>
                            {getStatusIcon(incident.status)}
                            <span>{incident.status}</span>
                          </span>
                          
                          <Link 
                            to={`/mir/operator/incident/${incident.id}`}
                            className="text-blue-400 border border-blue-500 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Ver Detalles</span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="mx-auto h-16 w-16 text-green-400" />
                  <h3 className="mt-4 text-lg font-medium text-white">No hay incidencias reportadas</h3>
                  <p className="mt-2 text-sm text-green-200">Reporta cualquier problema que encuentres durante tu trabajo.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OperatorIncidentsPage;