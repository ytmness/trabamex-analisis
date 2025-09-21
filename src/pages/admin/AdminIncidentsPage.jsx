import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import supabase from '@/lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  Loader2, 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Phone,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminIncidentsPage = () => {
    const [incidents, setIncidents] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const messagesEndRef = useRef(null);
    const { user, profile } = useAuth();
    const { toast } = useToast();

    // Función para obtener el icono del tipo de incidencia
    const getTypeIcon = (type) => {
        switch (type) {
            case 'TECNICO': return '🔧';
            case 'SERVICIO': return '🚛';
            case 'FACTURACION': return '💰';
            case 'GENERAL': return '📋';
            default: return '⚠️';
        }
    };

    // Función para obtener el color del estado
    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-800';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'CLOSED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Función para obtener el color de prioridad
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'BAJA': return 'bg-green-100 text-green-800';
            case 'MEDIA': return 'bg-yellow-100 text-yellow-800';
            case 'ALTA': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Cargar incidencias
    useEffect(() => {
        const fetchIncidents = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('incidents')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                setIncidents(data || []);
            } catch (error) {
                console.error('Error fetching incidents:', error);
                toast({ 
                    variant: 'destructive', 
                    title: 'Error', 
                    description: 'No se pudieron cargar las incidencias.' 
                });
            } finally {
                setLoading(false);
            }
        };
        fetchIncidents();
    }, [toast]);

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
                description: 'Tu respuesta ha sido enviada al cliente.',
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

    // Función para actualizar estado de incidencia
    const updateIncidentStatus = async (incidentId, newStatus) => {
        try {
            const { error } = await supabase
                .from('incidents')
                .update({ status: newStatus })
                .eq('id', incidentId);
            
            if (error) throw error;
            
            // Actualizar la lista de incidencias
            setIncidents(prev => 
                prev.map(incident => 
                    incident.id === incidentId 
                        ? { ...incident, status: newStatus }
                        : incident
                )
            );
            
            // Actualizar la incidencia seleccionada
            if (selectedIncident?.id === incidentId) {
                setSelectedIncident(prev => ({ ...prev, status: newStatus }));
            }
            
            toast({
                title: 'Estado actualizado',
                description: `La incidencia se marcó como ${newStatus}.`,
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo actualizar el estado.',
            });
        }
    };

    return (
        <>
            <Helmet>
                <title>Chat de Incidencias - Admin MIR</title>
                <meta name="description" content="Gestiona incidencias mediante chat en tiempo real." />
            </Helmet>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Chat de Incidencias</h1>
                        <p className="text-gray-600 mt-1">Responde a las incidencias de los clientes en tiempo real.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                    {/* Panel izquierdo - Lista de incidencias */}
                    <div className="lg:col-span-1">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5" />
                                    Incidencias ({incidents.length})
                                </CardTitle>
                                <CardDescription>
                                    Selecciona una incidencia para comenzar el chat
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="flex justify-center items-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                                    </div>
                                ) : (
                                    <div className="space-y-2 p-4">
                                        {incidents.map((incident) => (
                                            <motion.div
                                                key={incident.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                                    selectedIncident?.id === incident.id
                                                        ? 'border-red-500 bg-red-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => setSelectedIncident(incident)}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{getTypeIcon(incident.type)}</span>
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {incident.title}
                                                        </h3>
                                                    </div>
                                                    <Badge className={getStatusColor(incident.status)}>
                                                        {incident.status}
                                                    </Badge>
                                                </div>
                                                
                                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                    {incident.description}
                                                </p>
                                                
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        Usuario {incident.user_id?.slice(0, 8) || 'Desconocido'}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(incident.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-2">
                                                    <Badge className={getPriorityColor(incident.priority)}>
                                                        {incident.priority}
                                                    </Badge>
                                                </div>
                                            </motion.div>
                                        ))}
                                        
                                        {incidents.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                <p>No hay incidencias reportadas</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panel derecho - Chat */}
                    <div className="lg:col-span-2">
                        <Card className="h-full flex flex-col">
                            {selectedIncident ? (
                                <>
                                    {/* Header del chat */}
                                    <CardHeader className="border-b">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                    <span className="text-lg">{getTypeIcon(selectedIncident.type)}</span>
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{selectedIncident.title}</CardTitle>
                                                    <CardDescription>
                                                        Usuario {selectedIncident.user_id?.slice(0, 8)} • {selectedIncident.type}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(selectedIncident.status)}>
                                                    {selectedIncident.status}
                                                </Badge>
                                                <Badge className={getPriorityColor(selectedIncident.priority)}>
                                                    {selectedIncident.priority}
                                                </Badge>
                                                
                                                {/* Botones de acción rápida */}
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateIncidentStatus(selectedIncident.id, 'IN_PROGRESS')}
                                                        disabled={selectedIncident.status === 'IN_PROGRESS'}
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateIncidentStatus(selectedIncident.id, 'RESOLVED')}
                                                        disabled={selectedIncident.status === 'RESOLVED'}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateIncidentStatus(selectedIncident.id, 'CLOSED')}
                                                        disabled={selectedIncident.status === 'CLOSED'}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {/* Área de mensajes */}
                                    <CardContent className="flex-1 overflow-y-auto p-4">
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
                                                        Usuario {selectedIncident.user_id?.slice(0, 8)} • {new Date(selectedIncident.created_at).toLocaleString()}
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
                                                            message.user_id === user.id ? 'bg-red-100' : 'bg-gray-100'
                                                        }`}>
                                                            {message.user_id === user.id ? (
                                                                <User className="h-4 w-4 text-red-600" />
                                                            ) : (
                                                                <User className="h-4 w-4 text-gray-600" />
                                                            )}
                                                        </div>
                                                        <div className={`flex-1 ${message.user_id === user.id ? 'text-right' : ''}`}>
                                                            <div className={`rounded-lg p-3 ${
                                                                message.user_id === user.id 
                                                                    ? 'bg-red-500 text-white' 
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                <p className="text-sm">{message.message}</p>
                                                            </div>
                                                            <p className={`text-xs text-gray-500 mt-1 ${
                                                                message.user_id === user.id ? 'text-right' : ''
                                                            }`}>
                                                                {message.user_id === user.id ? 'Admin' : 'Usuario'} • {new Date(message.created_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </CardContent>

                                    {/* Input para enviar mensaje */}
                                    <div className="border-t p-4">
                                        <div className="flex gap-2">
                                            <Input
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Escribe tu respuesta..."
                                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                                disabled={sendingMessage}
                                            />
                                            <Button
                                                onClick={sendMessage}
                                                disabled={!newMessage.trim() || sendingMessage}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {sendingMessage ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-lg font-medium mb-2">Selecciona una incidencia</h3>
                                        <p>Elige una incidencia del panel izquierdo para comenzar el chat</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminIncidentsPage;
