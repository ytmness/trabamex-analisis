import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  CheckCircle,
  ShieldCheck,
  BarChart,
  Users,
  FileText,
  MessageSquare,
  Lock
} from 'lucide-react';

const features = [
  {
    icon: CheckCircle,
    title: "Trazabilidad Completa",
    description: "Monitorea tus residuos desde la recolección hasta la disposición final certificada.",
  },
  {
    icon: FileText,
    title: "Acceso a Documentación",
    description: "Descarga manifiestos, certificados y reportes al instante, disponibles 24/7.",
  },
   {
    icon: BarChart,
    title: "Optimización de Recursos",
    description: "Analiza tu generación de residuos y optimiza tu plan de manejo para reducir costos.",
  },
  {
    icon: Users,
    title: "Gestión Simplificada",
    description: "Programa recolecciones, solicita insumos y gestiona tu cuenta desde un solo lugar.",
  }
];

const customerBenefits = [
  {
    icon: ShieldCheck,
    title: "Cumplimiento Normativo Garantizado",
    description: "Accede y gestiona fácilmente toda tu documentación para auditorías y revisiones. Te ayudamos a cumplir con la NOM-087-SEMARNAT-SSA1-2002.",
  },
  {
    icon: BarChart,
    title: "Inteligencia de Negocio",
    description: "Obtén reportes detallados y análisis de datos sobre la generación de tus residuos. Identifica patrones, optimiza costos y toma decisiones informadas.",
  },
  {
    icon: Lock,
    title: "Seguridad y Confidencialidad",
    description: "Tu información está protegida en una plataforma segura con acceso controlado por roles, garantizando la confidencialidad de tus operaciones.",
  },
  {
    icon: Users,
    title: "Gestión Centralizada",
    description: "Administra múltiples sucursales o generadores desde una única cuenta. Unifica la gestión de residuos de toda tu organización de forma sencilla.",
  },
  {
    icon: FileText,
    title: "Digitalización de Manifiestos",
    description: "Olvídate del papel. Accede a todos tus manifiestos y certificados de destrucción en formato digital, disponibles para descarga inmediata 24/7.",
  },
  {
    icon: MessageSquare,
    title: "Comunicación Directa",
    description: "Utiliza la plataforma para solicitar recolecciones, pedir insumos y comunicarte con nuestro equipo de soporte de manera rápida y eficiente.",
  },
];

const MirPage = () => {
  return (
    <>
      <Helmet>
        <title>MIR | TRABAMEX – Plataforma de Monitoreo de RPBI</title>
        <meta name="description" content="Accede a MIR, la plataforma de monitoreo de TRABAMEX para el control en tiempo real de residuos peligrosos biológico-infecciosos." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://trabamex.com/mir-rpbi/" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative text-white py-24 md:py-32">
        <div className="absolute inset-0">
          <img alt="Fondo tecnológico abstracto de la plataforma MIR" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1686061593213-98dad7c599b9" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            MIR – Plataforma de Monitoreo de RPBI
          </motion.h1>
          <motion.p 
            className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-200"
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
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Control en tiempo real de residuos peligrosos</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Nuestra plataforma MIR te da el poder de gestionar tus residuos de manera eficiente, segura y transparente, asegurando el cumplimiento normativo en cada paso.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 p-6 rounded-lg text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-4 rounded-full">
                        <feature.icon className="h-8 w-8 text-red-600"/>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
                <p className="text-gray-700 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-black">Beneficios para nuestros clientes</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">La plataforma MIR no es solo una herramienta de seguimiento, es tu aliado estratégico para una gestión de residuos inteligente y rentable.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {customerBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-red-100 p-3 rounded-full mr-4">
                        <benefit.icon className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-black">{benefit.title}</h3>
                    </div>
                    <p className="text-gray-600">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">¿Listo para tomar el control?</h2>
            <p className="mt-3 text-lg max-w-2xl mx-auto text-red-100">Accede a nuestra plataforma para gestionar tus residuos de forma eficiente.</p>
            <div className="mt-8">
                <Button asChild size="lg" className="bg-white text-red-600 font-bold hover:bg-gray-100">
                  <Link to="/login">Ingresar a MIR</Link>
                </Button>
            </div>
        </div>
      </section>
    </>
  );
};

export default MirPage;
