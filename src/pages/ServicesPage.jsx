import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  GraduationCap,
  AlertTriangle,
  ClipboardEdit,
  Settings2,
  BookOpenCheck,
  CheckCircle,
  Users,
  Clock,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

const services = [
  {
    icon: FileText,
    title: 'Registro como Microgenerador',
    description: 'Te ayudamos con todo el trámite de registro ante SEMARNAT como microgenerador de residuos peligrosos.',
  },
  {
    icon: GraduationCap,
    title: 'Capacitaciones',
    description: 'Capacitamos a tu personal en el manejo correcto y seguro de residuos peligrosos biológico-infecciosos.',
  },
  {
    icon: AlertTriangle,
    title: 'Apoyo por Accidentes',
    description: 'Respuesta inmediata ante derrames o accidentes con residuos peligrosos en tus instalaciones.',
  },
  {
    icon: BookOpenCheck,
    title: 'Asesorías Normativas',
    description: 'Consultoría especializada para asegurar el cumplimiento de todas las normativas vigentes.',
  },
  {
    icon: ClipboardEdit,
    title: 'Registros y Permisos',
    description: 'Gestión integral de registros ante autoridades ambientales y sanitarias.',
  },
  {
    icon: Settings2,
    title: 'Consultoría Especializada',
    description: 'Evaluación y optimización de tus procesos de manejo de residuos para maximizar eficiencia.',
  },
];

const serviceRequests = [
    { title: 'Capacitación en manejo de RPBI', description: 'Solicito capacitación para 15 empleados en el área médica', date: 'Solicitado el 16/11/2024', status: 'Pendiente' },
    { title: 'Asesoría normativa integral', description: 'Necesito revisar el cumplimiento de todas las normativas vigentes', date: 'Solicitado el 10/11/2024', status: 'En proceso' },
    { title: 'Registro como microgenerador', description: 'Trámite completo para registro ante SEMARNAT', date: 'Solicitado el 5/11/2024', status: 'Completado' },
];

const whyChooseUs = [
    { icon: CheckCircle, title: 'Experiencia Comprobada', description: 'Más de 10 años de experiencia en el sector de residuos peligrosos.' },
    { icon: Users, title: 'Personal Certificado', description: 'Equipo altamente capacitado y certificado en normativas vigentes.' },
    { icon: Clock, title: 'Respuesta Rápida', description: 'Atención inmediata y seguimiento continuo de todas las solicitudes.' },
    { icon: ShieldCheck, title: 'Cumplimiento Total', description: 'Garantizamos el 100% de cumplimiento normativo en todos nuestros servicios.' },
];

const ServicesPage = () => {
    const navigate = useNavigate();

    const handleRequestService = (serviceTitle) => {
        navigate('/contacto', { state: { subject: `Solicitud de servicio: ${serviceTitle}` } });
    };

  return (
    <>
      <Helmet>
        <title>Servicios Adicionales - MIR</title>
        <meta name="description" content="Solicita servicios especializados para tu negocio: registros, capacitaciones, asesorías y más." />
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
        
        {/* Services Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-gray-800">Servicios Adicionales</h1>
          <p className="text-lg text-gray-500 mt-1 mb-8">Solicita servicios especializados para tu negocio.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md border flex flex-col justify-between"
              >
                <div>
                    <div className="mb-4">
                        <service.icon className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.description}</p>
                </div>
                <Button onClick={() => handleRequestService(service.title)} className="w-full bg-red-600 hover:bg-red-700 mt-2">
                  Solicitar servicio
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* My Service Requests Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Mis Solicitudes de Servicio</h2>
          <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
            {serviceRequests.map((req, index) => (
              <div key={index} className={`p-4 rounded-lg flex items-start justify-between ${index < serviceRequests.length - 1 ? 'border-b' : ''}`}>
                <div className="flex-grow">
                    <h4 className="font-bold text-gray-800">{req.title}</h4>
                    <p className="text-sm text-gray-600">{req.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{req.date}</p>
                </div>
                <Badge variant={
                    req.status === 'Completado' ? 'success' : req.status === 'En proceso' ? 'warning' : 'secondary'
                } className="ml-4 whitespace-nowrap">
                    {req.status}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 bg-gray-50 p-8 rounded-xl"
        >
            <h2 className="text-2xl text-center font-bold text-gray-800 mb-8">¿Por qué elegir nuestros servicios?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {whyChooseUs.map((item, index) => (
                    <div key={index}>
                        <div className="flex justify-center mb-3">
                            <div className="bg-red-100 p-3 rounded-full">
                                <item.icon className="h-6 w-6 text-red-600"/>
                            </div>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                ))}
            </div>
        </motion.div>
      </div>
    </>
  );
};

export default ServicesPage;
