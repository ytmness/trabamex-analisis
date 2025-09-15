import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileDown, Package, Loader2, CheckCircle, Clock } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '../lib/customSupabaseClient.js';
import { downloadCertificate, downloadManifest } from '@/lib/certificateService';

const PastCollectionsPage = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            // Obtener órdenes completadas del usuario
            const { data, error } = await supabase
                .from('service_orders')
                .select(`
                    id,
                    status,
                    created_at,
                    scheduled_date,
                    residue_type,
                    quantity,
                    unit,
                    provider,
                    origin,
                    certificate_url,
                    manifest_url,
                    certificate_generated_at,
                    manifest_generated_at
                `)
                .eq('customer_id', user.id)
                .in('status', ['CERTIFIED', 'TREATED', 'EN_TRATAMIENTO'])
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setCollections(data);
        } catch (error) {
            console.error('Error fetching collections:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las recolecciones",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(`/mir/${profile.role}`);
    };

    const handleDownloadCertificate = async (orderId) => {
        try {
            await downloadCertificate(orderId);
            toast({
                title: "Descarga iniciada",
                description: "El certificado se está descargando",
                variant: "default"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: `No se pudo descargar el certificado: ${error.message}`,
                variant: "destructive"
            });
        }
    };

    const handleDownloadManifest = async (orderId) => {
        try {
            await downloadManifest(orderId);
            toast({
                title: "Descarga iniciada",
                description: "El manifiesto se está descargando",
                variant: "default"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: `No se pudo descargar el manifiesto: ${error.message}`,
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'EN_TRATAMIENTO': 'secondary',
            'TREATED': 'default',
            'CERTIFIED': 'success'
        };
        
        const labels = {
            'EN_TRATAMIENTO': 'En Tratamiento',
            'TREATED': 'Tratado',
            'CERTIFIED': 'Completado'
        };
        
        return (
            <Badge variant={variants[status] || 'default'}>
                {labels[status] || status}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatQuantity = (quantity, unit) => {
        if (!quantity) return 'N/A';
        return `${quantity} ${unit || 'kg'}`;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Manifiestos y Recolecciones - MIR</title>
                <meta name="description" content="Consulta el historial de tus recolecciones y accede a la documentación." />
            </Helmet>
            <div className="container mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
                    <Button onClick={handleBack} variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Dashboard
                    </Button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-3xl font-bold text-gray-800">Historial de Recolecciones</h1>
                    <p className="text-lg text-gray-500 mt-1 mb-8">Consulta el historial de tus servicios y descarga la documentación asociada.</p>
                </motion.div>

                {collections.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-center py-16"
                    >
                        <Package className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No hay recolecciones aún</h3>
                        <p className="mt-2 text-gray-500">
                            Una vez que se completen tus solicitudes de recolección, aparecerán aquí.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-xl shadow-md border overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID de Recolección</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documentación</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {collections.map((collection, index) => (
                                        <motion.tr 
                                            key={collection.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Package className="h-5 w-5 text-red-600 mr-3" />
                                                    <div className="text-sm font-medium text-gray-900">
                                                        #{collection.id.slice(-8)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(collection.scheduled_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {collection.residue_type || 'N/A'} - {formatQuantity(collection.quantity, collection.unit)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {collection.provider || 'TRABAMEX'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(collection.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    {/* Manifiesto */}
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDownloadManifest(collection.id)}
                                                        disabled={!collection.manifest_url}
                                                        className={!collection.manifest_url ? 'opacity-50' : ''}
                                                    >
                                                        <FileDown className="mr-2 h-4 w-4" />
                                                        {collection.manifest_url ? 'Manifiesto' : 'Pendiente'}
                                                    </Button>
                                                    
                                                    {/* Certificado */}
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDownloadCertificate(collection.id)}
                                                        disabled={!collection.certificate_url}
                                                        className={!collection.certificate_url ? 'opacity-50' : ''}
                                                    >
                                                        <FileDown className="mr-2 h-4 w-4" />
                                                        {collection.certificate_url ? 'Certificado' : 'Pendiente'}
                                                    </Button>
                                                </div>
                                                
                                                {/* Fechas de generación */}
                                                <div className="mt-2 text-xs text-gray-500">
                                                    {collection.manifest_url && (
                                                        <div>Manifiesto: {formatDate(collection.manifest_generated_at)}</div>
                                                    )}
                                                    {collection.certificate_url && (
                                                        <div>Certificado: {formatDate(collection.certificate_generated_at)}</div>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Resumen */}
                {collections.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <div className="flex items-center">
                                <Package className="h-8 w-8 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total de Recolecciones</p>
                                    <p className="text-2xl font-bold text-blue-900">{collections.length}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-green-600">Completadas</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {collections.filter(c => c.status === 'CERTIFIED').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                            <div className="flex items-center">
                                <Clock className="h-8 w-8 text-orange-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-orange-600">En Proceso</p>
                                    <p className="text-2xl font-bold text-orange-900">
                                        {collections.filter(c => c.status !== 'CERTIFIED').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </>
    );
};

export default PastCollectionsPage;
