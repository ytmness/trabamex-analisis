import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Package, UploadCloud, Loader2, X, Camera, ArrowLeft } from 'lucide-react';

const wasteKeys = [
  'BI1', 'BI2', 'BI3', 'BI4', 'BI5', 'O1', 'O2', 'O3', 'S1', 'S2', 'SO2', 'SO3', 'SO4', 'SO5', 'C1', 'C2', 'L3'
];

const RequestPage = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        residueType: '',
        provider: 'trabamex',
        quantity: '',
        unit: 'kg',
        origin: '',
        date: '',
        packaging: '',
        notes: '',
        selectedPlan: '' // Nuevo campo para plan seleccionado
    });
    
    // Estado para planes del usuario
    const [userPlans, setUserPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    
    // Estado de la descripción del residuo
    const [residueDescription, setResidueDescription] = useState('');
    
    // Estado de archivos
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    
    // Estado de envío
    const [submitting, setSubmitting] = useState(false);
    
    // Estado de errores
    const [errors, setErrors] = useState({});
    
    // Función para cargar planes del usuario
    const fetchUserPlans = async () => {
        if (!user?.id) return;
        
        try {
            setLoadingPlans(true);
            const { data: plans, error } = await supabase.rpc('get_user_plans', {
                p_user_id: user.id
            });
            
            if (error) throw error;
            
            setUserPlans(plans || []);
            
            // Si solo hay un plan, seleccionarlo automáticamente
            if (plans && plans.length === 1) {
                setFormData(prev => ({ ...prev, selectedPlan: plans[0].plan_id }));
            }
        } catch (error) {
            console.error('Error al cargar planes:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los planes disponibles",
                variant: "destructive"
            });
        } finally {
            setLoadingPlans(false);
        }
    };
    
    // Cargar planes al montar el componente
    useEffect(() => {
        fetchUserPlans();
    }, [user?.id]);

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.residueType) newErrors.residueType = 'Debes seleccionar el tipo de residuo';
        if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'La cantidad debe ser mayor a 0';
        if (!formData.origin) newErrors.origin = 'Debes especificar la procedencia';
        if (!formData.date) newErrors.date = 'Debes seleccionar una fecha';
        if (!formData.packaging) newErrors.packaging = 'Debes especificar el tipo de envasado';
        if (!residueDescription.trim()) newErrors.residueDescription = 'Debes describir el residuo';
        if (!formData.selectedPlan) newErrors.selectedPlan = 'Debes seleccionar un plan';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar cambios en el formulario
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error del campo
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Manejar descripción del residuo
    const handleDescriptionChange = (value) => {
        setResidueDescription(value);
        // Limpiar error de descripción
        if (errors.residueDescription) {
            setErrors(prev => ({ ...prev, residueDescription: '' }));
        }
    };

    // Manejar archivos
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        // Validar archivos
        const validFiles = selectedFiles.filter(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB
                toast({
                    title: "Archivo muy grande",
                    description: `${file.name} excede el límite de 10MB`,
                    variant: "destructive"
                });
                return false;
            }
            
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                toast({
                    title: "Tipo de archivo no válido",
                    description: `${file.name} no es una imagen válida`,
                    variant: "destructive"
                });
                return false;
            }
            
            return true;
        });
        
        setFiles(prev => [...prev, ...validFiles]);
    };

    // Remover archivo
    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Subir archivos a Supabase Storage (opcional)
    const uploadFiles = async () => {
        if (files.length === 0) return [];
        
        setUploading(true);
        const uploadedUrls = [];
        
        try {
            for (const file of files) {
                const fileName = `${Date.now()}_${file.name}`;
                const filePath = `${user.id}/${fileName}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('evidence')
                    .upload(filePath, file);
                
                if (uploadError) {
                    console.warn(`No se pudo subir ${file.name}:`, uploadError.message);
                    // Continuar sin el archivo en lugar de fallar completamente
                    toast({
                        title: "Archivo no subido",
                        description: `${file.name} no se pudo subir, pero la solicitud continuará`,
                        variant: "default"
                    });
                    continue;
                }
                
                // Obtener URL pública
                const { data: { publicUrl } } = supabase.storage
                    .from('evidence')
                    .getPublicUrl(filePath);
                
                uploadedUrls.push(publicUrl);
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            toast({
                title: "Error en archivos",
                description: "No se pudieron subir los archivos, pero la solicitud continuará",
                variant: "default"
            });
        } finally {
            setUploading(false);
        }
        
        return uploadedUrls;
    };

    // Crear orden de servicio usando RPC
    const createServiceOrder = async (fileUrls) => {
        console.log('🔧 LLAMANDO FUNCIÓN RPC create_service_order...');
        console.log('📡 URL de Supabase:', supabase.supabaseUrl);
        console.log('🔑 Usuario autenticado:', user?.id);
        
        // Obtener información del plan seleccionado
        const selectedPlanObj = userPlans.find(plan => plan.plan_id === formData.selectedPlan);
        console.log('📋 Plan seleccionado:', selectedPlanObj);
        
        const parameters = {
            p_residue_type: formData.residueType,
            p_provider: formData.provider,
            p_quantity: parseFloat(formData.quantity),
            p_unit: formData.unit,
            p_origin: formData.origin,
            p_scheduled_date: formData.date,
            p_packaging: formData.packaging,
            p_notes: formData.notes,
            p_waste_keys: [residueDescription],
            p_evidence_files: fileUrls,
            p_plan_id: formData.selectedPlan, // Usar el plan seleccionado por el usuario
            p_plan_type: selectedPlanObj?.plan_type || 'RPBI' // Tipo de plan del plan seleccionado
        };
        
        console.log('📊 Parámetros enviados:', parameters);
        
        const { data, error } = await supabase.rpc('create_service_order', parameters);
        
        console.log('📥 Respuesta de Supabase:', { data, error });
        
        if (error) {
            console.error('❌ ERROR EN RPC:', error);
            console.error('📊 Detalles del error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            throw error;
        }
        
        console.log('✅ RPC exitoso, ID retornado:', data);
        return { id: data }; // La función RPC retorna solo el ID
    };


    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('🚀 INICIANDO ENVÍO DE SOLICITUD...');
        console.log('📡 URL de Supabase (RequestPage):', supabase.supabaseUrl);
        console.log('📋 Datos del formulario:', formData);
        console.log('📝 Descripción del residuo:', residueDescription);
        console.log('📁 Archivos seleccionados:', files);
        console.log('👤 Usuario actual:', user);
        
        if (!validateForm()) {
            console.log('❌ Validación falló');
            toast({
                title: "Formulario incompleto",
                description: "Por favor, completa todos los campos requeridos",
                variant: "destructive"
            });
            return;
        }
        
        console.log('✅ Validación exitosa');
        setSubmitting(true);
        
        try {
            // 1. Subir archivos (opcional)
            console.log('📤 Subiendo archivos...');
            let fileUrls = [];
            try {
                fileUrls = await uploadFiles();
                console.log('✅ Archivos subidos:', fileUrls);
            } catch (fileError) {
                console.warn('⚠️ Error en archivos, continuando sin ellos:', fileError);
                fileUrls = [];
            }
            
            // 2. Crear orden de servicio
            console.log('📝 Creando orden de servicio...');
            console.log('📊 Parámetros para RPC:', {
                p_residue_type: formData.residueType,
                p_provider: formData.provider,
                p_quantity: parseFloat(formData.quantity),
                p_unit: formData.unit,
                p_origin: formData.origin,
                p_scheduled_date: formData.date,
                p_packaging: formData.packaging,
                p_notes: formData.notes,
                p_waste_keys: [residueDescription],
                p_evidence_files: fileUrls
            });
            
            const order = await createServiceOrder(fileUrls);
            console.log('✅ Orden creada:', order);
            
            // 3. ✅ Evento de tracking ya creado por la función RPC
            console.log('✅ Evento de tracking ya creado por la función RPC');
            
            // 4. Mostrar éxito
            toast({
                title: "¡Solicitud enviada!",
                description: `Tu solicitud de recolección ha sido registrada con ID: ${order.id}`,
                variant: "default"
            });
            
            console.log('🎉 SOLICITUD COMPLETADA EXITOSAMENTE!');
            
            // 5. Limpiar formulario
            setFormData({
                residueType: '',
                provider: 'trabamex',
                quantity: '',
                unit: 'kg',
                origin: '',
                date: '',
                packaging: '',
                notes: '',
                selectedPlan: ''
            });
            setResidueDescription('');
            setFiles([]);
            
        } catch (error) {
            console.error('❌ ERROR DETALLADO:', error);
            console.error('📊 Stack trace:', error.stack);
            console.error('🔍 Tipo de error:', typeof error);
            console.error('📝 Mensaje de error:', error.message);
            console.error('🏷️ Código de error:', error.code);
            
            toast({
                title: "Error al enviar solicitud",
                description: error.message || "No se pudo procesar tu solicitud",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Solicitar Recolección - MIR</title>
                <meta name="description" content="Programa una recolección extemporánea de residuos." />
            </Helmet>
            <div className="container mx-auto px-4 py-8">
                {/* Botón de regresar al dashboard */}
                <div className="mb-6">
                    <Button 
                        variant="outline" 
                        onClick={() => window.location.href = '/mir/user'}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Regresar al Dashboard
                    </Button>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-3xl font-bold text-center text-gray-800">Solicitar recolección</h1>
                    <p className="text-lg text-center text-gray-500 mt-1 mb-8">Programa una recolección extemporánea de residuos</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center gap-3 mb-8">
                            <Package className="text-red-600" />
                            <h2 className="text-xl font-bold text-gray-800">Nueva Solicitud</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="residue-type">Tipo de residuo *</Label>
                                <Select 
                                    value={formData.residueType} 
                                    onValueChange={(value) => handleInputChange('residueType', value)}
                                >
                                    <SelectTrigger id="residue-type" className={errors.residueType ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rp">Residuos Peligrosos (RP)</SelectItem>
                                        <SelectItem value="rpbi">Residuos Peligrosos Biológico-Infecciosos (RPBI)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.residueType && <p className="text-red-500 text-sm mt-1">{errors.residueType}</p>}
                            </div>
                            <div>
                                <Label htmlFor="selected-plan">Plan de cobro *</Label>
                                <Select 
                                    value={formData.selectedPlan} 
                                    onValueChange={(value) => handleInputChange('selectedPlan', value)}
                                    disabled={loadingPlans}
                                >
                                    <SelectTrigger id="selected-plan" className={errors.selectedPlan ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={loadingPlans ? "Cargando planes..." : "Selecciona un plan"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userPlans.map(plan => (
                                            <SelectItem key={plan.plan_id} value={plan.plan_id}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{plan.plan_name}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {plan.limit_kg} kg incluidos • ${plan.monthly_price}/mes
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                        {userPlans.length === 0 && !loadingPlans && (
                                            <SelectItem value="" disabled>
                                                No tienes planes asignados
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.selectedPlan && <p className="text-red-500 text-sm mt-1">{errors.selectedPlan}</p>}
                                {userPlans.length === 0 && !loadingPlans && (
                                    <p className="text-sm text-orange-600 mt-1">
                                        ⚠️ Consulta con el administrador sobre planes disponibles
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="provider">Proveedor del servicio</Label>
                                <Select 
                                    value={formData.provider} 
                                    onValueChange={(value) => handleInputChange('provider', value)}
                                >
                                    <SelectTrigger id="provider">
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="trabamex">Trabamex</SelectItem>
                                        <SelectItem value="egoplastica">Egoplastica</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="quantity">Cantidad *</Label>
                                <Input 
                                    id="quantity" 
                                    type="number" 
                                    placeholder="Ej. 25" 
                                    value={formData.quantity}
                                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                                    className={errors.quantity ? 'border-red-500' : ''}
                                />
                                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                            </div>
                            <div>
                                <Label htmlFor="unit">Unidad</Label>
                                <Select 
                                    value={formData.unit} 
                                    onValueChange={(value) => handleInputChange('unit', value)}
                                >
                                    <SelectTrigger id="unit">
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kg">Kg</SelectItem>
                                        <SelectItem value="litros">Litros</SelectItem>
                                        <SelectItem value="toneladas">Toneladas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Label htmlFor="residue-description">Descripción de residuo *</Label>
                            <Textarea 
                                id="residue-description"
                                placeholder="Describe detalladamente el residuo a recolectar (ej: jeringas usadas, medicamentos vencidos, material quirúrgico desechable, etc.)"
                                rows={3}
                                value={residueDescription}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                className={errors.residueDescription ? 'border-red-500' : ''}
                            />
                            {errors.residueDescription && <p className="text-red-500 text-sm mt-1">{errors.residueDescription}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <Label htmlFor="origin">Procedencia *</Label>
                                <Input 
                                    id="origin" 
                                    placeholder="Área/Unidad generadora" 
                                    value={formData.origin}
                                    onChange={(e) => handleInputChange('origin', e.target.value)}
                                    className={errors.origin ? 'border-red-500' : ''}
                                />
                                {errors.origin && <p className="text-red-500 text-sm mt-1">{errors.origin}</p>}
                            </div>
                            <div>
                                <Label htmlFor="date">Fecha *</Label>
                                <Input 
                                    id="date" 
                                    type="date" 
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className={errors.date ? 'border-red-500' : ''}
                                />
                                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <Label htmlFor="packaging">Tipo de envasado *</Label>
                            <Input 
                                id="packaging" 
                                placeholder="Ej. bolsas rojas, contenedor rígido" 
                                value={formData.packaging}
                                onChange={(e) => handleInputChange('packaging', e.target.value)}
                                className={errors.packaging ? 'border-red-500' : ''}
                            />
                            {errors.packaging && <p className="text-red-500 text-sm mt-1">{errors.packaging}</p>}
                        </div>

                        <div className="mt-6">
                            <Label>Evidencia fotográfica</Label>
                            <div className="mt-2">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label 
                                    htmlFor="file-upload"
                                    className="flex justify-center items-center w-full h-32 px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-red-500 transition-colors"
                                >
                                    <div className="space-y-1 text-center">
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400"/>
                                        <p className="text-sm text-gray-600">
                                            Arrastra y suelta tus archivos aquí o <span className="font-semibold text-red-600">haz clic para subirlos</span>
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                                    </div>
                                </label>
                            </div>
                            
                            {/* Lista de archivos seleccionados */}
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <Label>Archivos seleccionados:</Label>
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                            <div className="flex items-center space-x-2">
                                                <Camera className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea 
                                id="notes" 
                                placeholder="Indicaciones adicionales" 
                                rows={4}
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                            />
                        </div>
                        
                        <div className="flex justify-end mt-8">
                            <Button 
                                type="submit" 
                                className="bg-red-600 hover:bg-red-700"
                                disabled={submitting || uploading}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar Solicitud'
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default RequestPage;
