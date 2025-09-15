import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import {
  CheckCircle2,
  Package,
  Clock,
  Truck,
  Building,
  FileText,
  User,
  Recycle,
  MapPin,
  CalendarDays,
  History,
  Loader2,
  Send,
  ArrowLeft,
  Upload,
  Download,
  Camera,
  Plus,
  Edit,
  Info
} from 'lucide-react';

// Función para mapear estados de la base de datos a estados del timeline
const mapOrderStatusToTimeline = (dbStatus) => {
  // Mapeos especiales para estados que pueden tener nombres diferentes
  const statusMap = {
    // Estados de supplies_requests (legacy)
    'pending': 'SCHEDULED',
    'approved': 'EN_ROUTE_TO_PICKUP', 
    'delivered': 'TREATED',
    
    // Estados de service_orders (actuales)
    'PENDING': 'SCHEDULED',
    'PENDIENTE': 'SCHEDULED',
    'EN_PROCESO': 'EN_ROUTE_TO_PICKUP',
    'EN_RUTA': 'ON_SITE_PICKUP',
    'COMPLETADO': 'TREATED',
    
    // Estados específicos del timeline
    'SCHEDULED': 'SCHEDULED',
    'EN_ROUTE_TO_PICKUP': 'EN_ROUTE_TO_PICKUP',
    'ON_SITE_PICKUP': 'ON_SITE_PICKUP',
    'COLLECTED': 'COLLECTED',
    'EN_ROUTE_TO_DEPOT': 'EN_ROUTE_TO_DEPOT',
    'AT_DEPOT': 'AT_DEPOT',
    'WEIGHED_VERIFIED': 'WEIGHED_VERIFIED',
    'EN_ROUTE_TO_TREATMENT': 'EN_ROUTE_TO_TREATMENT',
    'IN_TREATMENT': 'IN_TREATMENT',
    'TREATED': 'TREATED',
    'CERTIFIED': 'CERTIFIED',
  };
  
  return statusMap[dbStatus] || dbStatus; // Si no está mapeado, usar el estado original
};

const timelineStepsConfig = [
  { key: 'SCHEDULED', icon: CheckCircle2, title: 'Planificado', description: 'Solicitud creada y planificada' },
  { key: 'EN_ROUTE_TO_PICKUP', icon: Truck, title: 'En Camino', description: 'Operador en camino al punto de recolección' },
  { key: 'ON_SITE_PICKUP', icon: MapPin, title: 'En el Sitio', description: 'Operador en el punto de recolección' },
  { key: 'COLLECTED', icon: Package, title: 'Recolectado', description: 'Residuos recolectados del sitio' },
  { key: 'EN_ROUTE_TO_DEPOT', icon: Truck, title: 'En Ruta al Depósito', description: 'En camino al depósito para pesaje' },
  { key: 'AT_DEPOT', icon: Building, title: 'En Depósito', description: 'Residuos en depósito para verificación' },
  { key: 'WEIGHED_VERIFIED', icon: Package, title: 'Pesado y Verificado', description: 'Peso verificado y documentado' },
  { key: 'EN_ROUTE_TO_TREATMENT', icon: Truck, title: 'En Transporte', description: 'En camino a planta de tratamiento' },
  { key: 'IN_TREATMENT', icon: Recycle, title: 'Tratamiento', description: 'Proceso de tratamiento y neutralización' },
  { key: 'TREATED', icon: Building, title: 'Disposición Final', description: 'Disposición final completada' },
  { key: 'CERTIFIED', icon: FileText, title: 'Certificado', description: 'Certificado de destrucción emitido' },
];

const documents = [
    { name: 'Manifiesto de entrega', status: 'Disponible' },
    { name: 'Certificado de destrucción', status: 'Pendiente' },
    { name: 'Reporte fotográfico', status: 'Disponible' },
];

const TrackingPage = () => {
  const { orderId } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState(''); // 'service_orders' o 'supplies_requests'
  const [evidences, setEvidences] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedStep, setSelectedStep] = useState('');
  const [routes, setRoutes] = useState([
    { id: 1, name: 'Zona Norte', status: 'Activa' }
  ]);
  const [availableZones] = useState([
    'Zona Norte', 'Zona Sur', 'Zona Sur 2', 'Zona Este', 'Zona Oeste', 
    'Centro Industrial', 'Centro Comercial', 'Planta de Tratamiento',
    'Depósito Principal', 'Base de Operaciones'
  ]);
  const [documents] = useState([
    { name: 'Certificado de Destrucción', status: 'Disponible' },
    { name: 'Manifesto de Transporte', status: 'En proceso' },
    { name: 'Reporte de Pesaje', status: 'Disponible' }
  ]);

  const fetchOrderData = useCallback(async () => {
    console.log('🔄 Debug Fetch - Iniciando fetch de datos...');
    console.log('🔄 Debug Fetch - OrderId:', orderId);
    
    // Primero intentar buscar en service_orders
    let { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    // Si no se encuentra en service_orders, buscar en supplies_requests
    if (error && error.code === 'PGRST116') {
      console.log('🔄 Debug Fetch - No encontrado en service_orders, buscando en supplies_requests...');
      const result = await supabase
        .from('supplies_requests')
        .select('*')
        .eq('id', orderId)
        .single();
      
      data = result.data;
      error = result.error;
      setOrderType('supplies_requests');
    } else {
      setOrderType('service_orders');
    }

    console.log('🔄 Debug Fetch - Respuesta de Supabase:', { data, error });

    if (error) {
      console.error('Error fetching status:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la información de la orden.' });
      setOrder(null);
    } else {
      console.log('🔍 Debug Fetch - Datos de la orden recibidos:', data);
      console.log('🔍 Debug Fetch - Estado de la orden:', data.status);
      
      // Obtener información del cliente por separado
      if (data.customer_id || data.user_id) {
        const customerId = data.customer_id || data.user_id;
        const { data: customerData, error: customerError } = await supabase
          .from('profiles')
          .select('full_name, id')
          .eq('id', customerId)
          .single();
        
        if (!customerError && customerData) {
          data.customer = customerData;
        } else {
          // Fallback si no se encuentra el perfil
          data.customer = { full_name: 'Cliente', id: customerId };
        }
      }
      
      setOrder(data);
    }
    setLoading(false);
  }, [orderId, toast]);

  useEffect(() => {
    setLoading(true);
    fetchOrderData();
    fetchEvidences();
    
    // Cargar rutas guardadas desde localStorage
    const savedRoutes = JSON.parse(localStorage.getItem(`routes_${orderId}`) || '[]');
    if (savedRoutes.length > 0) {
      setRoutes(savedRoutes);
    }
  }, [orderId, fetchOrderData]);

  const fetchEvidences = async () => {
    try {
      console.log('🔄 Cargando evidencias para orden:', orderId);
      
      // Cargar evidencias desde evidence_files
      const { data, error } = await supabase
        .from('evidence_files')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('⚠️ Error cargando evidencias:', error.message);
        setEvidences([]);
        return;
      }

      setEvidences(data || []);
      console.log('✅ Evidencias cargadas desde evidence_files:', data?.length || 0);
      
    } catch (error) {
      console.error('❌ Error fetching evidences:', error);
      setEvidences([]);
    }
  };

  const handleFileUpload = async (step, file) => {
    console.log('🚀 handleFileUpload llamado con:', { step, file });
    
    if (!file) {
      console.log('❌ No se seleccionó ningún archivo');
      toast({
        title: "Error",
        description: "No se seleccionó ningún archivo.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('📁 Iniciando subida de archivo:', {
      name: file.name,
      size: file.size,
      type: file.type,
      step: step
    });
    
    // Verificar que tenemos el perfil del usuario
    if (!profile || !profile.id) {
      console.log('❌ No hay perfil de usuario disponible');
      toast({
        title: "Error",
        description: "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    try {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF) y documentos (PDF, DOC, DOCX).');
      }
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      }
      
      // Subir archivo a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}_${step}_${Date.now()}.${fileExt}`;
      
      console.log('📤 Subiendo archivo a Supabase Storage:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidences')
        .upload(fileName, file);

      if (uploadError) {
        console.error('❌ Error en upload:', uploadError);
        throw uploadError;
      }

      console.log('✅ Archivo subido exitosamente:', uploadData);

      // Guardar evidencia en evidence_files
      try {
        console.log('💾 Guardando evidencia en evidence_files:', {
          orderId,
          step,
          fileName: file.name,
          fileUrl: uploadData.path
        });
        
        const { data, error } = await supabase
          .from('evidence_files')
          .insert({
            order_id: orderId,
            file_name: file.name,
            file_url: uploadData.path,
            uploaded_by: profile.id,
            file_type: file.type,
            file_size: file.size,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.log('⚠️ Error guardando en evidence_files:', error.message);
          throw new Error(`Error al guardar evidencia: ${error.message}`);
        }

        console.log('✅ Evidencia guardada exitosamente en evidence_files:', data);
        
      } catch (error) {
        console.error('❌ Error completo guardando evidencia:', error);
        throw error;
      }

      toast({
        title: "✅ Archivo subido exitosamente",
        description: `El archivo "${file.name}" se ha subido correctamente al paso "${step}".`,
      });

      // Recargar evidencias
      await fetchEvidences();
      
    } catch (error) {
      console.error('❌ Error completo en upload:', error);
      toast({
        title: "Error al subir archivo",
        description: error.message || "No se pudo subir el archivo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (evidence) => {
    try {
      const filePath = evidence.file_url;
      const fileName = evidence.file_name;
      
      if (!filePath) {
        throw new Error('No se encontró la ruta del archivo');
      }

      console.log('📥 Descargando archivo:', { filePath, fileName });

      const { data, error } = await supabase.storage
        .from('evidences')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Archivo descargado exitosamente');
    } catch (error) {
      console.error('❌ Error descargando archivo:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Error al descargar archivo: ${error.message}`,
      });
    }
  };

  // Funciones para manejar rutas
  const addRoute = () => {
    // Crear un select con zonas predefinidas
    const zoneOptions = availableZones.map((zone, index) => 
      `<option value="${zone}">${zone}</option>`
    ).join('');
    
    const selectHTML = `
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Selecciona una zona:</label>
        <select id="zoneSelect" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="">-- Selecciona una zona --</option>
          ${zoneOptions}
        </select>
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">O ingresa una zona personalizada:</label>
        <input type="text" id="customZone" placeholder="Ej: Zona Especial" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px;">
      </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; padding: 20px; border-radius: 8px; max-width: 400px; width: 90%;">
          <h3 style="margin-top: 0;">Agregar Nueva Ruta</h3>
          ${selectHTML}
          <div style="margin-top: 15px; text-align: right;">
            <button id="cancelBtn" style="margin-right: 10px; padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">Cancelar</button>
            <button id="addBtn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Agregar</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const zoneSelect = modal.querySelector('#zoneSelect');
    const customZone = modal.querySelector('#customZone');
    const cancelBtn = modal.querySelector('#cancelBtn');
    const addBtn = modal.querySelector('#addBtn');
    
    const cleanup = () => {
      document.body.removeChild(modal);
    };
    
    cancelBtn.onclick = cleanup;
    
    addBtn.onclick = () => {
      const selectedZone = zoneSelect.value;
      const customZoneValue = customZone.value.trim();
      
      if (selectedZone || customZoneValue) {
        const routeName = selectedZone || customZoneValue;
        const newRoute = {
          id: Date.now(),
          name: routeName,
          status: 'Pendiente'
        };
        
        setRoutes(prev => [...prev, newRoute]);
        
        // Guardar en localStorage
        const savedRoutes = JSON.parse(localStorage.getItem(`routes_${orderId}`) || '[]');
        savedRoutes.push(newRoute);
        localStorage.setItem(`routes_${orderId}`, JSON.stringify(savedRoutes));
        
        toast({
          title: "Ruta agregada",
          description: `La ruta "${routeName}" ha sido agregada exitosamente.`,
        });
        
        cleanup();
      } else {
        alert('Por favor selecciona una zona o ingresa una zona personalizada.');
      }
    };
  };

  const updateRouteName = (routeId, currentName) => {
    const zoneOptions = availableZones.map((zone, index) => 
      `<option value="${zone}" ${zone === currentName ? 'selected' : ''}>${zone}</option>`
    ).join('');
    
    const selectHTML = `
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Selecciona una zona:</label>
        <select id="zoneSelect" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="">-- Selecciona una zona --</option>
          ${zoneOptions}
        </select>
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">O ingresa una zona personalizada:</label>
        <input type="text" id="customZone" value="${currentName}" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px;">
      </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; padding: 20px; border-radius: 8px; max-width: 400px; width: 90%;">
          <h3 style="margin-top: 0;">Actualizar Ruta</h3>
          ${selectHTML}
          <div style="margin-top: 15px; text-align: right;">
            <button id="cancelBtn" style="margin-right: 10px; padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">Cancelar</button>
            <button id="updateBtn" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Actualizar</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const zoneSelect = modal.querySelector('#zoneSelect');
    const customZone = modal.querySelector('#customZone');
    const cancelBtn = modal.querySelector('#cancelBtn');
    const updateBtn = modal.querySelector('#updateBtn');
    
    const cleanup = () => {
      document.body.removeChild(modal);
    };
    
    cancelBtn.onclick = cleanup;
    
    updateBtn.onclick = () => {
      const selectedZone = zoneSelect.value;
      const customZoneValue = customZone.value.trim();
      
      if (selectedZone || customZoneValue) {
        const newName = selectedZone || customZoneValue;
        
        setRoutes(prev => prev.map(route => 
          route.id === routeId ? { ...route, name: newName } : route
        ));
        
        // Actualizar en localStorage
        const savedRoutes = JSON.parse(localStorage.getItem(`routes_${orderId}`) || '[]');
        const updatedRoutes = savedRoutes.map(route => 
          route.id === routeId ? { ...route, name: newName } : route
        );
        localStorage.setItem(`routes_${orderId}`, JSON.stringify(updatedRoutes));
        
        toast({
          title: "Ruta actualizada",
          description: `La ruta ha sido actualizada a "${newName}".`,
        });
        
        cleanup();
      } else {
        alert('Por favor selecciona una zona o ingresa una zona personalizada.');
      }
    };
  };

  const updateRouteStatus = (routeId, currentStatus) => {
    const statusOptions = ['Activa', 'Completada', 'Pendiente'];
    const currentIndex = statusOptions.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    const newStatus = statusOptions[nextIndex];
    
    setRoutes(prev => prev.map(route => 
      route.id === routeId ? { ...route, status: newStatus } : route
    ));
    
    // Actualizar en localStorage
    const savedRoutes = JSON.parse(localStorage.getItem(`routes_${orderId}`) || '[]');
    const updatedRoutes = savedRoutes.map(route => 
      route.id === routeId ? { ...route, status: newStatus } : route
    );
    localStorage.setItem(`routes_${orderId}`, JSON.stringify(updatedRoutes));
    
    toast({
      title: "Estado actualizado",
      description: `El estado de la ruta ha cambiado a "${newStatus}".`,
    });
  };

  const deleteRoute = (routeId, routeName) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la ruta "${routeName}"?`)) {
      setRoutes(prev => prev.filter(route => route.id !== routeId));
      
      // Actualizar en localStorage
      const savedRoutes = JSON.parse(localStorage.getItem(`routes_${orderId}`) || '[]');
      const updatedRoutes = savedRoutes.filter(route => route.id !== routeId);
      localStorage.setItem(`routes_${orderId}`, JSON.stringify(updatedRoutes));
      
      toast({
        title: "Ruta eliminada",
        description: `La ruta "${routeName}" ha sido eliminada.`,
      });
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      const { error } = await supabase
        .from(orderType)
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Estado actualizado',
        description: `Estado cambiado a ${newStatus}`,
      });

      fetchOrderData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Error al actualizar estado: ${error.message}`,
      });
    }
  };

  const { timelineSteps, completionPercentage } = useMemo(() => {
    if (!order) return { timelineSteps: [], completionPercentage: 0 };
    
    console.log('🔄 Debug Timeline - RECALCULANDO timeline para estado:', order.status);
    console.log('🔍 Debug Timeline - Estado de la orden:', order.status);
    console.log('🔍 Debug Timeline - Configuración de pasos:', timelineStepsConfig);
    
    const mappedStatus = mapOrderStatusToTimeline(order.status);
    console.log('🔍 Debug Timeline - Estado mapeado:', mappedStatus);
    console.log('🔍 Debug Timeline - Estado original vs mapeado:', { original: order.status, mapped: mappedStatus });
    
    const currentStepIndex = timelineStepsConfig.findIndex(step => step.key === mappedStatus);
    console.log('🔍 Debug Timeline - Índice del paso actual:', currentStepIndex);
    console.log('🔍 Debug Timeline - Pasos disponibles:', timelineStepsConfig.map(s => s.key));
    
    // Si no se encuentra el estado, usar el primer paso como actual
    const effectiveStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
    console.log('🔍 Debug Timeline - Índice efectivo del paso:', effectiveStepIndex);
    
    const updatedTimeline = timelineStepsConfig.map((step, index) => {
      let status = 'Pendiente';
      if (index < effectiveStepIndex) status = 'Completado';
      if (index === effectiveStepIndex) status = 'En Proceso';
      
      console.log(`🔍 Debug Timeline - Paso ${index}: ${step.key} -> ${status} (${step.title})`);
      return { ...step, status };
    });

    const percentage = updatedTimeline.length > 0 
      ? (updatedTimeline.filter(s => s.status === 'Completado').length / (timelineStepsConfig.length - 1) * 100)
      : 0;
    
    console.log('🔍 Debug Timeline - Porcentaje de completado:', percentage);
    console.log('🔍 Debug Timeline - Timeline final:', updatedTimeline.map(s => ({ key: s.key, title: s.title, status: s.status })));
    
    return { timelineSteps: updatedTimeline, completionPercentage: percentage };
  }, [order]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-red-600" />
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-600">Orden no encontrada</h2>
          <p className="text-gray-500">No se pudo encontrar la orden con el ID proporcionado o no tienes permiso para verla.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Seguimiento de Orden #{orderId.substring(0,8)} - MIR</title>
        <meta name="description" content="Sigue en tiempo real el estado de tu recolección de residuos." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        {/* Botón de regresar al dashboard */}
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/mir/operator'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar al Dashboard
          </Button>
          
          {/* Botón de prueba para adjuntar archivo */}
          {(profile?.role === 'operator' || profile?.role === 'admin') && (
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('🧪 Botón de prueba clickeado');
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*,.pdf,.doc,.docx';
                input.onchange = (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    console.log('🧪 Archivo de prueba seleccionado:', file.name);
                    handleFileUpload('TEST_STEP', file);
                  }
                };
                input.click();
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-900"
            >
              <Upload className="h-4 w-4" />
              Prueba Adjuntar
            </Button>
          )}
        </div>

        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-md mb-6"
        >
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <Badge variant="outline" className="mb-2">Seguimiento #{order.id.substring(0,8).toUpperCase()}</Badge>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {order.customer?.full_name || 'Cliente'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tipo: {orderType === 'service_orders' ? 'Recolección' : 'Suministros'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm py-1 px-3">
                        <Truck size={16} className="mr-2"/>
                        Estado: {order.status}
                    </Badge>
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
                <div className="flex items-center gap-3">
                    <CalendarDays className="text-gray-400" size={20}/>
                    <div>
                        <p className="text-sm text-gray-500">Fecha solicitud</p>
                        <p className="font-semibold text-gray-700">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <Clock className="text-gray-400" size={20}/>
                    <div>
                        <p className="text-sm text-gray-500">Estado actual</p>
                        <p className="font-semibold text-gray-700">{order.status}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <User className="text-gray-400" size={20}/>
                    <div>
                        <p className="text-sm text-gray-500">Operador</p>
                        <p className="font-semibold text-gray-700">
                            {order.operator_id ? `Operador ${order.operator_id.substring(0,8)}` : 'Sin asignar'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Barra de progreso */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md mb-6"
        >
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-gray-700">Progreso del proceso</h2>
                <span className="font-bold text-red-600">{completionPercentage.toFixed(0)}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div 
                  className="bg-red-600 h-2.5 rounded-full" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                <MapPin size={16} />
                <span>Ubicación actual: <span className="font-semibold text-gray-700">
                    {order.status === 'PENDING' || order.status === 'PENDIENTE' ? 'Base de Operaciones' :
                     order.status === 'EN_ROUTE_TO_PICKUP' || order.status === 'EN_PROCESO' ? 'En Camino al Sitio' :
                     order.status === 'ON_SITE_PICKUP' || order.status === 'EN_RUTA' ? 'En el Sitio de Recolección' :
                     order.status === 'COLLECTED' ? 'Sitio de Recolección' :
                     order.status === 'EN_ROUTE_TO_DEPOT' ? 'En Camino al Depósito' :
                     order.status === 'AT_DEPOT' ? 'Depósito de Verificación' :
                     order.status === 'WEIGHED_VERIFIED' ? 'Depósito - Pesaje Completado' :
                     order.status === 'EN_ROUTE_TO_TREATMENT' ? 'En Camino a Planta de Tratamiento' :
                     order.status === 'IN_TREATMENT' ? 'Planta de Tratamiento' :
                     order.status === 'TREATED' || order.status === 'COMPLETADO' ? 'Planta de Tratamiento - Proceso Completado' :
                     'Base de Operaciones'}
                </span></span>
            </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md"
            >
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Estado del proceso</h2>
                </div>
                <div className="relative">
                    <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
                    <ul className="space-y-8">
                        {timelineSteps.map((step, index) => {
                          console.log(`🔍 Debug Render - Renderizando paso ${index}:`, step);
                          // Mostrar evidencias para este paso
                          const stepEvidences = evidences.filter(e => {
                            // Como no hay campo step, usar el file_url para identificar el paso
                            return e.file_url && e.file_url.includes(step.key);
                          });
                          return (
                            <li key={step.key} className="relative flex items-start">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-gray-100 ring-4 ring-white ${step.status === 'Completado' ? 'bg-green-100 text-green-600' : step.status === 'En Proceso' ? 'bg-yellow-100 text-yellow-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <div className="ml-4 flex-grow">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{step.title}</h3>
                                            <p className="text-sm text-gray-500">{step.description}</p>
                                            
                                            {/* Evidencias del paso */}
                                            {stepEvidences.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500 mb-1">Evidencias:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {stepEvidences.map((evidence, idx) => (
                                                            <div key={idx} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                                                                <FileText className="h-3 w-3 text-gray-500" />
                                                                <span className="text-xs text-gray-600">{evidence.file_name}</span>
                                                                <button
                                                                    onClick={() => handleDownload(evidence)}
                                                                    className="text-blue-500 hover:text-blue-700"
                                                                >
                                                                    <Download className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={step.status === 'Completado' ? 'success' : step.status === 'En Proceso' ? 'warning' : 'secondary'}>
                                                {step.status}
                                            </Badge>
                                            
                                            {/* Botones de acción para operadores y admins */}
                                            {(profile?.role === 'operator' || profile?.role === 'admin') && (
                                                <div className="flex gap-1">
                                                    {/* Botón para subir evidencia */}
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        disabled={uploading}
                                                        className="flex items-center gap-1"
                                                        onClick={() => {
                                                            console.log('🖱️ Click en botón adjuntar para paso:', step.key);
                                                            console.log('👤 Perfil del usuario:', profile);
                                                            console.log('📋 OrderId:', orderId);
                                                            
                                                            // Crear input de archivo
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*,.pdf,.doc,.docx';
                                                            input.style.display = 'none';
                                                            
                                                            // Agregar al DOM temporalmente
                                                            document.body.appendChild(input);
                                                            
                                                            input.onchange = (e) => {
                                                                console.log('📁 Evento onChange disparado');
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    console.log('📁 Archivo seleccionado:', {
                                                                        name: file.name,
                                                                        size: file.size,
                                                                        type: file.type,
                                                                        step: step.key
                                                                    });
                                                                    handleFileUpload(step.key, file);
                                                                } else {
                                                                    console.log('❌ No se seleccionó ningún archivo');
                                                                }
                                                                // Limpiar el input
                                                                document.body.removeChild(input);
                                                            };
                                                            
                                                            input.oncancel = () => {
                                                                console.log('❌ Selección de archivo cancelada');
                                                                document.body.removeChild(input);
                                                            };
                                                            
                                                            // Disparar el selector de archivos
                                                            input.click();
                                                        }}
                                                    >
                                                        {uploading ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Upload className="h-3 w-3" />
                                                        )}
                                                        <span className="text-xs">Adjuntar</span>
                                                    </Button>
                                                    
                                                    {/* Botón para cambiar estado */}
                                                    {step.status !== 'Completado' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateOrderStatus(step.key)}
                                                            className="text-green-600 border-green-600 hover:bg-green-50"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                          );
                        })}
                    </ul>
                </div>
            </motion.div>

            <div className="space-y-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white p-6 rounded-xl shadow-md"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Información del operador</h2>
                    <ul className="space-y-3 text-sm">
                        <li className="flex justify-between">
                            <span className="text-gray-500">Operador:</span>
                            <span className="font-semibold text-gray-700">
                                {order.operator_id ? `Operador ${order.operator_id.substring(0,8)}` : 'Sin asignar'}
                            </span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-500">Zona asignada:</span>
                            <span className="font-semibold text-gray-700">Zona Norte</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-500">Ruta actual:</span>
                            <span className="font-semibold text-gray-700">Ruta Principal</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-500">Estado:</span>
                            <span className="font-semibold text-gray-700">{order.status}</span>
                        </li>
                    </ul>
                    
                    {/* Sección de rutas */}
                    <div className="mt-6 pt-4 border-t">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">Rutas del viaje</h3>
                            {(profile?.role === 'operator' || profile?.role === 'admin') && (
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={addRoute}
                                    className="text-xs"
                                >
                                    <MapPin className="mr-1 h-3 w-3" />
                                    Agregar ruta
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {routes.map((route) => (
                                <div key={route.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">{route.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            variant={route.status === 'Activa' ? 'outline' : 'secondary'} 
                                            className="text-xs cursor-pointer"
                                            onClick={() => {
                                                if (profile?.role === 'operator' || profile?.role === 'admin') {
                                                    updateRouteStatus(route.id, route.status);
                                                }
                                            }}
                                        >
                                            {route.status}
                                        </Badge>
                                        {(profile?.role === 'operator' || profile?.role === 'admin') && (
                                            <>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => updateRouteName(route.id, route.name)}
                                                    title="Editar ruta"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                {routes.length > 1 && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                        onClick={() => deleteRoute(route.id, route.name)}
                                                        title="Eliminar ruta"
                                                    >
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Información adicional */}
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Gestión de rutas</span>
                            </div>
                            <p className="text-xs text-blue-700">
                                Los operadores pueden agregar nuevas rutas según las necesidades del cliente y actualizar las existentes en tiempo real.
                            </p>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white p-6 rounded-xl shadow-md"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Evidencias Subidas</h2>
                    {evidences.length > 0 ? (
                        <ul className="space-y-3">
                            {evidences.map((evidence, index) => (
                                <li key={evidence.id || index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-gray-400"/>
                                        <div>
                                            <span className="font-medium text-gray-700">
                                                {evidence.file_name}
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                Subido: {new Date(evidence.created_at).toLocaleString()}
                                            </p>
                                            {evidence.file_url && evidence.file_url.includes('_') && (
                                                <p className="text-xs text-blue-600">
                                                    Paso: {evidence.file_url.split('_')[1]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {evidence.file_type?.includes('image') ? 'Imagen' : 'Documento'}
                                        </Badge>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDownload(evidence)}
                                            className="text-xs"
                                        >
                                            <Download className="h-3 w-3 mr-1" />
                                            Descargar
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No hay evidencias subidas aún</p>
                            <p className="text-sm">Usa el botón "Adjuntar" en los pasos del proceso</p>
                        </div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white p-6 rounded-xl shadow-md"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Documentación</h2>
                     <ul className="space-y-3">
                        {documents.map((doc, index) => (
                            <li key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-gray-400"/>
                                    <span className="font-medium text-gray-700">{doc.name}</span>
                                </div>
                                <Badge variant={doc.status === 'Disponible' ? 'success' : 'secondary'}>{doc.status}</Badge>
                            </li>
                        ))}
                     </ul>
                </motion.div>
            </div>
        </div>

      </div>
    </>
  );
};

export default TrackingPage;