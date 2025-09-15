import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  CalendarClock, 
  ClipboardCheck, 
  FileBarChart2, 
  MapPin, 
  Leaf,
  Target,
  Eye
} from 'lucide-react';

const services = [
  {
    icon: Truck,
    title: "Recolección Segura",
    description: "Servicio especializado de recolección de RPBI y RP con TRABAMEX y ECOPLASTICA, cumpliendo con todas las normativas.",
    points: ["Vehículos especializados", "Personal capacitado", "Rutas optimizadas"]
  },
  {
    icon: CalendarClock,
    title: "Cronograma Inteligente",
    description: "Sistema de programación y seguimiento de recolecciones en tiempo real para optimizar tu operación.",
    points: ["Programación flexible", "Alertas automáticas", "Historial completo"]
  },
  {
    icon: ClipboardCheck,
    title: "Cumplimiento Normativo",
    description: "Checklist completo de documentación y verificación del cumplimiento de todas las normativas vigentes.",
    points: ["Manifiestos oficiales", "Certificados", "Documentación legal"]
  },
  {
    icon: FileBarChart2,
    title: "Gestión de Planes",
    description: "Monitoreo detallado de tu consumo y recomendaciones para optimizar tu plan de manejo de residuos.",
    points: ["Análisis de consumo", "Planes flexibles", "Optimización de costos"]
  },
  {
    icon: MapPin,
    title: "Seguimiento Completo",
    description: "Trazabilidad total desde la recolección hasta la disposición final, con reportes detallados.",
    points: ["Tracking en tiempo real", "Reportes automáticos", "Transparencia total"]
  },
  {
    icon: Leaf,
    title: "Enfoque Sustentable",
    description: "Soluciones que minimizan el impacto ambiental y promueven prácticas sustentables en tu organización.",
    points: ["Impacto reducido", "Certificaciones ambientales", "Responsabilidad social"]
  }
];

const MirPage = () => {
  return (
    <>
      <Helmet>
        <title>MIR - Manejo Integral de Residuos | TRABAMEX</title>
        <meta name="description" content="Plataforma MIR: Monitorea, solicita y da seguimiento a la gestión de tus residuos RPBI y RP con transparencia y en tiempo real." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-black text-white py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            MIR • Manejo Integral de Residuos
          </motion.h1>
          <motion.p 
            className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Monitorea, solicita y da seguimiento a la gestión de tus residuos RPBI y RP con transparencia y en tiempo real.
          </motion.p>
          <motion.div 
            className="mt-8 flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold">
              <Link to="/login">Ingresar a MIR</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
              <Link to="/register">Registrarse</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Sobre MIR</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Comprometidos con el manejo responsable de residuos y la protección del medio ambiente.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div 
              className="bg-red-50 p-8 rounded-lg"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-red-600 mr-4"/>
                <h3 className="text-2xl font-bold text-black">Nuestra Misión</h3>
              </div>
              <p className="text-gray-700">Proporcionar soluciones integrales para el manejo de residuos peligrosos biológico-infecciosos y residuos peligrosos, garantizando el cumplimiento normativo y la protección del medio ambiente a través de tecnología innovadora y servicios de calidad.</p>
            </motion.div>
            <motion.div 
              className="bg-red-50 p-8 rounded-lg"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <Eye className="h-8 w-8 text-red-600 mr-4"/>
                <h3 className="text-2xl font-bold text-black">Nuestra Visión</h3>
              </div>
              <p className="text-gray-700">Ser la empresa líder en México en el manejo integral de residuos, reconocida por nuestro compromiso con la sustentabilidad, la innovación tecnológica y la excelencia en el servicio, contribuyendo a un futuro más limpio y seguro.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Nuestros Servicios</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Ofrecemos soluciones completas para el manejo responsable de residuos</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                   <div className="bg-red-100 p-3 rounded-full mr-4">
                    <service.icon className="h-6 w-6 text-red-600" />
                   </div>
                   <h3 className="text-xl font-bold text-black">{service.title}</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                 <ul className="space-y-2 text-sm">
                  {service.points.map((point, pIndex) => (
                     <li key={pIndex} className="flex items-center text-gray-700">
                        <ClipboardCheck className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">¿Listo para empezar?</h2>
            <p className="mt-3 text-lg max-w-2xl mx-auto text-red-100">Únete a las empresas que confían en MIR para el manejo responsable de sus residuos</p>
            <div className="mt-8">
                <Button asChild size="lg" className="bg-white text-red-600 font-bold hover:bg-gray-100">
                  <Link to="/register">Crear cuenta</Link>
                </Button>
            </div>
        </div>
      </section>
    </>
  );
};

export default MirPage;
