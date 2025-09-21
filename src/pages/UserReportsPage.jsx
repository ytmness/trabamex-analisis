import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle,
  MessageCircle,
  User,
  Clock
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
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
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

    // Cargar mensajes cuando se selecciona una incidencia
    useEffect(() => {
        if (selectedIncident) {
            fetchMessages(selectedIncident.id);
        }
    }, [selectedIncident]);

    // Suscripción en tiempo real a mensajes
    useEffect(() => {
        if (!selectedIncident) return;

        const channel = supabase
            .channel(`incident_messages_${selectedIncident.id}`)
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'incident_messages',
                    filter: `incident_id=eq.${selectedIncident.id}`
                }, 
                (payload) => {
                    console.log('Nuevo mensaje recibido:', payload);
                    setMessages(prev => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedIncident]);

  // Scroll automático a nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Función para cargar mensajes
  const fetchMessages = async (incidentId) => {
    try {
      const { data, error } = await supabase
        .from('incident_messages')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Función para enviar mensaje
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedIncident) return;
    
    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('incident_messages')
        .insert({
          incident_id: selectedIncident.id,
          user_id: user.id,
          message: newMessage.trim(),
          message_type: 'text'
        });
      
      if (error) throw error;
      
      setNewMessage('');
      
      toast({
        title: 'Mensaje enviado',
        description: 'Tu mensaje ha sido enviado al administrador.',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo enviar el mensaje.',
      });
    } finally {
      setSendingMessage(false);
    }
  };

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

          {/* Botón para reportar nueva incidencia */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8"
          >
            <UserCard className="user-card">
              <UserCardHeader>
                <UserCardTitle>Reportar Nueva Incidencia</UserCardTitle>
                <UserCardDescription>¿Tienes algún problema con nuestros servicios? Repórtalo aquí</UserCardDescription>
              </UserCardHeader>
              <UserCardContent>
                <UserButton
                  onClick={() => setShowForm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Reportar Incidencia
                </UserButton>
              </UserCardContent>
            </UserCard>
          </motion.div>

          {/* Formulario de nueva incidencia */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <UserCard className="user-card">
                <UserCardHeader>
                  <UserCardTitle>Nueva Incidencia</UserCardTitle>
                  <UserCardDescription>Completa los datos de tu incidencia</UserCardDescription>
                </UserCardHeader>
                <UserCardContent>
                  <form onSubmit={handleSubmitIncident} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título de la incidencia
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Ej: Problema con la recolección del martes"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción detallada
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows={4}
                        placeholder="Describe el problema con el mayor detalle posible..."
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de incidencia
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="TECNICO">🔧 Técnico</option>
                          <option value="SERVICIO">🚛 Servicio</option>
                          <option value="FACTURACION">💰 Facturación</option>
                          <option value="GENERAL">📋 General</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prioridad
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="BAJA">🟢 Baja</option>
                          <option value="MEDIA">🟡 Media</option>
                          <option value="ALTA">🔴 Alta</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <UserButton
                        type="submit"
                        disabled={submitting}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {submitting ? 'Enviando...' : 'Enviar Incidencia'}
                      </UserButton>
                      
                      <UserButton
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancelar
                      </UserButton>
                    </div>
                  </form>
                </UserCardContent>
              </UserCard>
            </motion.div>
          )}

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <UserCard className="user-card">
              <UserCardHeader>
                <UserCardTitle>Filtrar Incidencias</UserCardTitle>
                <UserCardDescription>Selecciona el tipo de incidencia que deseas ver</UserCardDescription>
              </UserCardHeader>
              <UserCardContent>
                <div className="flex flex-wrap gap-2">
                  <UserButton
                    onClick={() => handleFilterChange('all')}
                    variant={filter === 'all' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Todas
                  </UserButton>
                  <UserButton
                    onClick={() => handleFilterChange('TECNICO')}
                    variant={filter === 'TECNICO' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    🔧 Técnico
                  </UserButton>
                  <UserButton
                    onClick={() => handleFilterChange('SERVICIO')}
                    variant={filter === 'SERVICIO' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    🚛 Servicio
                  </UserButton>
                  <UserButton
                    onClick={() => handleFilterChange('FACTURACION')}
                    variant={filter === 'FACTURACION' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    💰 Facturación
                  </UserButton>
                  <UserButton
                    onClick={() => handleFilterChange('GENERAL')}
                    variant={filter === 'GENERAL' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                  >
                    📋 General
                  </UserButton>
                </div>
              </UserCardContent>
            </UserCard>
          </motion.div>

          {/* Lista de Incidencias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <UserCard className="user-card">
              <UserCardHeader>
                <UserCardTitle>Mis Incidencias Reportadas</UserCardTitle>
                <UserCardDescription>
                  {filter === 'all' 
                    ? `Total: ${incidents.length} incidencias` 
                    : `${filteredIncidents.length} incidencias de ${filter.toLowerCase()}`
                  }
                </UserCardDescription>
              </UserCardHeader>
              <UserCardContent>
                {filteredIncidents.length > 0 ? (
                  <div className="space-y-4">
                    {filteredIncidents.map((incident, index) => (
                      <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{getTypeIcon(incident.type)}</div>
                          <div>
                            <div className="font-medium text-gray-900">{incident.title}</div>
                            <div className="text-sm text-gray-600">{incident.description}</div>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(incident.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Prioridad: {incident.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(incident.type)}`}>
                            {incident.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                            {incident.status === 'OPEN' ? 'Abierta' : 
                             incident.status === 'IN_PROGRESS' ? 'En Proceso' :
                             incident.status === 'RESOLVED' ? 'Resuelta' : 'Cerrada'}
                          </span>
                          <div className="flex space-x-2">
                            <UserButton
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => setSelectedIncident(incident)}
                            >
                              <MessageCircle className="h-4 w-4" />
                              Ver Chat
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
                      {filter === 'all' ? 'No hay incidencias reportadas' : `No hay incidencias de ${filter.toLowerCase()}`}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filter === 'all' 
                        ? 'Tus incidencias reportadas aparecerán aquí.' 
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
                    <strong>Tipos de incidencias que puedes reportar:</strong>
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• <strong>🔧 Técnico:</strong> Problemas con equipos, sistemas o tecnología</li>
                    <li>• <strong>🚛 Servicio:</strong> Problemas con la recolección, horarios o calidad del servicio</li>
                    <li>• <strong>💰 Facturación:</strong> Errores en facturas, pagos o cobros</li>
                    <li>• <strong>📋 General:</strong> Cualquier otra consulta o problema</li>
                  </ul>
                  <p className="text-sm mt-3">
                    <strong>Nota:</strong> Todas las incidencias son revisadas por nuestro equipo de soporte. Te contactaremos para resolver tu problema lo antes posible.
                  </p>
                </div>
              </UserCardContent>
            </UserCard>
          </motion.div>

          {/* Modal de Chat */}
          {selectedIncident && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedIncident(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del chat */}
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{getTypeIcon(selectedIncident.type)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedIncident.title}</h3>
                        <p className="text-sm text-gray-600">
                          {selectedIncident.type} • {selectedIncident.priority}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIncident.status)}`}>
                        {selectedIncident.status === 'OPEN' ? 'Abierta' : 
                         selectedIncident.status === 'IN_PROGRESS' ? 'En Proceso' :
                         selectedIncident.status === 'RESOLVED' ? 'Resuelta' : 'Cerrada'}
                      </span>
                      <UserButton
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIncident(null)}
                      >
                        ✕
                      </UserButton>
                    </div>
                  </div>
                </div>

                {/* Área de mensajes */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {/* Mensaje inicial de la incidencia */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-sm text-gray-800">{selectedIncident.description}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Tú • {new Date(selectedIncident.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Mensajes del chat */}
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`flex items-start gap-3 ${
                            message.user_id === user.id ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.user_id === user.id ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            {message.user_id === user.id ? (
                              <User className="h-4 w-4 text-red-600" />
                            ) : (
                              <User className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className={`flex-1 ${message.user_id === user.id ? 'text-right' : ''}`}>
                            <div className={`rounded-lg p-3 ${
                              message.user_id === user.id 
                                ? 'bg-red-500 text-white' 
                                : 'bg-blue-500 text-white'
                            }`}>
                              <p className="text-sm">{message.message}</p>
                            </div>
                            <p className={`text-xs text-gray-500 mt-1 ${
                              message.user_id === user.id ? 'text-right' : ''
                            }`}>
                              {message.user_id === user.id ? 'Tú' : 'Admin'} • {new Date(message.created_at).toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input para enviar mensaje */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={sendingMessage}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <UserButton
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </UserButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserIncidentsPage;
