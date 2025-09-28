import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Eye, CheckCircle, Clock, AlertCircle, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import supabase from '../../lib/customSupabaseClient.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const AdminCertificatesPage = () => {
  const { toast } = useToast();
  const [ordersReady, setOrdersReady] = useState([]);
  const [certifiedOrders, setCertifiedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState(''); // 'certificate' o 'manifest'
  const [selectedOrderId, setSelectedOrderId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener órdenes listas para certificar (TREATED)
      const { data: readyData, error: readyError } = await supabase
        .from('service_orders')
        .select('*')
        .eq('status', 'TREATED')
        .order('fecha_solicitud', { ascending: false });

      if (readyError) throw readyError;

      // Obtener órdenes ya certificadas
      const { data: certifiedData, error: certifiedError } = await supabase
        .from('service_orders')
        .select('*')
        .eq('status', 'CERTIFIED')
        .order('created_at', { ascending: false });

      if (certifiedError) throw certifiedError;
      
      setOrdersReady(readyData || []);
      setCertifiedOrders(certifiedData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los datos: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = (orderId) => {
    setSelectedOrderId(orderId);
    setUploadType('certificate');
    setIsUploadDialogOpen(true);
  };

  const handleGenerateManifest = (orderId) => {
    setSelectedOrderId(orderId);
    setUploadType('manifest');
    setIsUploadDialogOpen(true);
  };

  const handleEditCertificate = (order) => {
    setEditingCertificate(order);
    setIsFormOpen(true);
  };

  const handleDeleteCertificate = async (orderId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este certificado?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('service_orders')
        .update({
          status: 'TREATED',
          certificate_generated_at: null,
          certificate_url: null
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Certificado eliminado correctamente.',
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el certificado.',
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'TREATED': 'default',
      'IN_TREATMENT': 'secondary',
      'CERTIFIED': 'success'
    };
    
    const labels = {
      'TREATED': 'Tratado',
      'IN_TREATMENT': 'En Tratamiento',
      'CERTIFIED': 'Certificado'
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Certificados - Admin MIR</title>
        <meta name="description" content="Gestionar y emitir certificados de destrucción." />
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Certificados</h1>
            <p className="text-gray-600 mt-1">Emite y consulta los certificados de destrucción final.</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="bg-red-600 hover:bg-red-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Certificado
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Órdenes Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">{ordersReady.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificados Emitidos</p>
                  <p className="text-2xl font-bold text-green-600">{certifiedOrders.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Órdenes</p>
                  <p className="text-2xl font-bold text-red-600">{ordersReady.length + certifiedOrders.length}</p>
                </div>
                <FileText className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Órdenes Listas para Certificar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Órdenes Listas para Certificar
            </CardTitle>
            <CardDescription>
              Órdenes que han sido tratadas y están listas para generar el certificado de destrucción.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ordersReady.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes pendientes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Todas las órdenes tratadas ya tienen su certificado generado.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ordersReady.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-gray-600">#{order.id.slice(-8)}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-gray-900">
                        <strong>Cliente:</strong> {order.client_name || order.customer_id || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        <strong>Fecha de solicitud:</strong> {formatDate(order.fecha_solicitud)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGenerateManifest(order.id)}
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generar Manifiesto
                      </Button>
                      <Button
                        onClick={() => handleGenerateCertificate(order.id)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Generar Certificado
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Órdenes Certificadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Certificados Emitidos
            </CardTitle>
            <CardDescription>
              Historial de todos los certificados generados y emitidos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {certifiedOrders.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay certificados emitidos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Los certificados aparecerán aquí una vez que sean generados.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {certifiedOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-gray-600">#{order.id.slice(-8)}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-gray-900">
                        <strong>Cliente:</strong> {order.client_name || order.customer_id || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        <strong>Certificado emitido:</strong> {formatDate(order.certificate_generated_at)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCertificate(order)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(order.certificate_url, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = order.certificate_url;
                          link.download = `Certificado_${order.id}.pdf`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCertificate(order.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <CertificateFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSuccess={() => {
          fetchData();
          setIsFormOpen(false);
          setEditingCertificate(null);
        }}
        editingCertificate={editingCertificate}
      />
      
      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        setIsOpen={setIsUploadDialogOpen}
        uploadType={uploadType}
        orderId={selectedOrderId}
        onSuccess={() => {
          fetchData();
          setIsUploadDialogOpen(false);
        }}
      />
    </>
  );
};

const CertificateFormDialog = ({ isOpen, setIsOpen, onSuccess, editingCertificate }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [certificateType, setCertificateType] = useState('destruccion');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchOrders = async () => {
        setIsFetching(true);
        try {
          const { data, error } = await supabase
            .from('service_orders')
            .select('id, customer_id, status')
            .eq('status', 'TREATED');
          
          if (error) {
            throw error;
          }
          
          setOrders(data || []);
        } catch (error) {
          console.error('Error fetching orders:', error);
          toast({ 
            variant: 'destructive', 
            title: 'Error', 
            description: 'No se pudieron cargar las órdenes.' 
          });
        } finally {
          setIsFetching(false);
        }
      };
      
      fetchOrders();
      
      // Si estamos editando, cargar los datos del certificado
      if (editingCertificate) {
        setSelectedOrder(editingCertificate.id || '');
        setCertificateType('destruccion');
        setNotes('');
      } else {
        // Resetear formulario para nuevo certificado
        setSelectedOrder('');
        setCertificateType('destruccion');
        setNotes('');
      }
    }
  }, [isOpen, editingCertificate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Selecciona una orden para generar el certificado.' 
      });
      return;
    }
    
    setLoading(true);

    try {
      // Simular generación de certificado
      const certificateUrl = `https://certificates.trabamex.com/${selectedOrder}.pdf`;
      
      // Actualizar la orden con el certificado
      const { error } = await supabase
        .from('service_orders')
        .update({
          status: 'CERTIFIED',
          certificate_generated_at: new Date().toISOString(),
          certificate_url: certificateUrl
        })
        .eq('id', selectedOrder);

      if (error) throw error;

      toast({ 
        title: 'Éxito', 
        description: 'Certificado generado correctamente.' 
      });

      onSuccess();
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: `Error al generar el certificado: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingCertificate ? 'Editar Certificado' : 'Generar Nuevo Certificado'}
            </DialogTitle>
            <DialogDescription>
              {editingCertificate 
                ? 'Modifica los datos del certificado.' 
                : 'Selecciona una orden tratada para generar su certificado de destrucción.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="order">Orden de Servicio</Label>
              {isFetching ? (
                <div className="flex items-center h-10">
                  <Loader2 className="h-4 w-4 animate-spin"/>
                </div>
              ) : (
                <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                  <SelectTrigger id="order">
                    <SelectValue placeholder="Selecciona una orden tratada"/>
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map(o => (
                      <SelectItem key={o.id} value={o.id}>
                        {`${o.id.substring(0,8)} - ${o.client_name || 'Cliente'}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="certificateType">Tipo de Certificado</Label>
              <Select value={certificateType} onValueChange={setCertificateType}>
                <SelectTrigger id="certificateType">
                  <SelectValue placeholder="Selecciona el tipo de certificado"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="destruccion">Certificado de Destrucción</SelectItem>
                  <SelectItem value="disposicion">Certificado de Disposición Final</SelectItem>
                  <SelectItem value="cumplimiento">Certificado de Cumplimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones sobre el certificado..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                editingCertificate ? 'Actualizar Certificado' : 'Generar Certificado'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const FileUploadDialog = ({ isOpen, setIsOpen, uploadType, orderId, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos PDF, JPG, JPEG o PNG.",
          variant: "destructive"
        });
        return;
      }
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo no puede ser mayor a 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        throw new Error('Tipo de archivo no permitido. Solo se permiten PDF, JPG, JPEG o PNG.');
      }
      
      // Validar tamaño (máximo 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      }

      // Crear nombre único para el archivo
      const fileExtension = selectedFile.name.split('.').pop();
      const fileName = `${uploadType}_${orderId}_${Date.now()}.${fileExtension}`;
      
      console.log('📤 Subiendo archivo a Supabase Storage:', fileName);
      
      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates') // Bucket para certificados y manifiestos
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('❌ Error en upload:', uploadError);
        throw uploadError;
      }

      console.log('✅ Archivo subido exitosamente:', uploadData);

      // Obtener URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);
      
      // Actualizar la orden en la base de datos
      const updateData = {
        [`${uploadType}_url`]: publicUrl,
        [`${uploadType}_generated_at`]: new Date().toISOString()
      };
      
      if (uploadType === 'certificate') {
        updateData.status = 'CERTIFIED';
      }
      
      const { error } = await supabase
        .from('service_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
      
      toast({
        title: "¡Archivo subido exitosamente!",
        description: `El ${uploadType === 'certificate' ? 'certificado' : 'manifiesto'} ha sido adjuntado correctamente.`,
        variant: "default"
      });
      
      onSuccess();
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: `No se pudo subir el archivo: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setUploading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Adjuntar {uploadType === 'certificate' ? 'Certificado' : 'Manifiesto'}
          </DialogTitle>
          <DialogDescription>
            Selecciona el archivo del {uploadType === 'certificate' ? 'certificado de destrucción' : 'manifiesto de entrega'} 
            para la orden #{orderId?.substring(0, 8)}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Archivo</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500">
              Formatos permitidos: PDF, JPG, JPEG, PNG (máximo 10MB)
            </p>
          </div>
          
          {selectedFile && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Archivo seleccionado: {selectedFile.name}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => setIsOpen(false)}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="bg-red-600 hover:bg-red-700"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Subir Archivo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCertificatesPage;
