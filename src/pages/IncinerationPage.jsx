import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, ShieldCheck, Biohazard, ArrowRight, CheckCircle, Package, FileX, Factory, Settings, BarChart, MapPin, Truck, Award } from 'lucide-react';

const IncinerationPage = () => {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Incineración de Residuos Peligrosos y RPBI",
    "provider": {
      "@type": "LocalBusiness",
      "name": "TRABAMEX",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Calle 21 Este 205-A, Civac",
        "addressLocality": "Jiutepec",
        "addressRegion": "Morelos",
        "postalCode": "62578",
        "addressCountry": "MX"
      }
    },
    "areaServed": {
      "@type": "State",
      "name": "Morelos"
    },
    "description": "Incineración certificada de residuos peligrosos, RPBI y de manejo especial en Morelos. Destrucción fiscal con cumplimiento legal y certificados SEMARNAT."
  };
  const benefits = [{
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    title: "Destrucción Segura y Garantizada",
    text: "Eliminación completa de patógenos y componentes peligrosos, garantizando la inocuidad del residuo final."
  }, {
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    title: "Reducción Drástica de Volumen",
    text: "El proceso reduce el volumen de los residuos hasta en un 90%, optimizando el uso de rellenos sanitarios."
  }, {
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    title: "Cumplimiento Legal Total",
    text: "La incineración es un método aprobado por la ley para la disposición final de ciertos residuos. Entregamos certificados de destrucción válidos."
  }];
  const acceptedWastes = [{
    icon: <Biohazard className="h-10 w-10 text-red-600" />,
    title: "Residuos Peligrosos Biológico-Infecciosos (RPBI)",
    items: ["Cultivos y cepas de agentes infecciosos.", "Tejidos, órganos y residuos patológicos.", "Sangre y sus derivados líquidos.", "Materiales punzocortantes y de curación contaminados."]
  }, {
    icon: <Flame className="h-10 w-10 text-orange-500" />,
    title: "Residuos Peligroso (RP)",
    items: ["Fármacos caducos.", "Sólidos impregnados con solventes o aceites.", "Lodos de tratamiento.", "Productos fuera de especificación."]
  }, {
    icon: <Package className="h-10 w-10 text-blue-500" />,
    title: "Residuos de Manejo Especial (RME)",
    items: ["Plásticos industriales.", "Cartón, empaques y embalajes contaminados.", "Residuos voluminosos que requieren destrucción térmica."]
  }, {
    icon: <FileX className="h-10 w-10 text-purple-500" />,
    title: "Destrucción Fiscal",
    items: ["Lotes de medicamentos caducos.", "Productos de importación no liberados.", "Inventarios fuera de norma o decomisados.", "Bienes que requieren inhabilitación legal."]
  }];
  const techSpecs = [{
    icon: <Factory className="h-8 w-8 text-red-600" />,
    text: "Capacidad instalada de 600 toneladas anuales."
  }, {
    icon: <Flame className="h-8 w-8 text-red-600" />,
    text: "Horno incinerador de doble cámara con control automatizado."
  }, {
    icon: <Settings className="h-8 w-8 text-red-600" />,
    text: "Sistema de control de emisiones con filtros y monitoreo constante."
  }, {
    icon: <ShieldCheck className="h-8 w-8 text-red-600" />,
    text: "Procesos avalados por la legislación ambiental y sanitaria vigente."
  }];

  return (
    <>
      <Helmet>
        <title>Planta de Incineración de Residuos en Morelos | TRABAMEX</title>
        <meta name="description" content="Incineración certificada de residuos peligrosos, RPBI y de manejo especial en Morelos. Destrucción fiscal con cumplimiento legal y certificados SEMARNAT." />
        <link rel="canonical" href="https://trabamex.com/incineracion" />
        <meta property="og:title" content="Planta de Incineración de Residuos en Morelos | TRABAMEX" />
        <meta property="og:description" content="Incineración certificada de residuos peligrosos, RPBI y de manejo especial en Morelos. Destrucción fiscal con cumplimiento legal y certificados SEMARNAT." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://trabamex.com/incineracion" />
        <meta property="og:image" content="https://horizons-cdn.hostinger.com/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/trabamex-og-incineracion.png" />
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
      </Helmet>
      
      <div className="bg-white">
        <section className="relative py-24 sm:py-32">
          <div className="absolute inset-0">
            <img className="w-full h-full object-cover" alt="Instalaciones industriales para incineración de residuos." src="https://horizons-cdn.hostinger.com/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/chatgpt-image-sep-16-2025-at-03_09_23-pm-H8wj3.png" />
            <div className="absolute inset-0 bg-gray-900/60"></div>
          </div>
          <div className="relative container mx-auto px-4 text-center">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }}>
              <Flame className="mx-auto h-16 w-16 text-white mb-4" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">Incineración de Residuos en Morelos</h1>
              <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
                Solución térmica controlada para la destrucción segura de RP, RPBI y RME. Damos servicio cerca de Cuernavaca, Jiutepec y CDMX.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Qué es la Incineración de Residuos?</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  La incineración es un proceso de tratamiento térmico controlado que utiliza altas temperaturas para descomponer los residuos. Este método es especialmente efectivo para destruir componentes peligrosos y agentes patógenos, transformando los residuos en cenizas, gases y calor.
                </p>
                <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                  En TRABAMEX, nuestra planta de incineración en Jiutepec, Morelos, opera bajo estrictos controles de emisión para garantizar la protección del medio ambiente y la seguridad de la comunidad.
                </p>
              </div>
              <motion.div initial={{
              opacity: 0,
              scale: 0.9
            }} whileInView={{
              opacity: 1,
              scale: 1
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.5
            }}>
                <img className="rounded-lg shadow-xl" alt="Manejo de residuos en un vertedero" src="https://horizons-cdn.hostinger.com/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/cad909534b0c8377bbf8addb8ca8c017.jpg" />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Residuos Aceptados para Incineración</h2>
              <p className="mt-4 text-lg text-gray-600">
                Nuestro proceso está diseñado para manejar una amplia variedad de residuos, asegurando su correcta destrucción y cumplimiento normativo.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {acceptedWastes.map((waste, index) => <motion.div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden" whileInView={{
              opacity: 1,
              y: 0
            }} initial={{
              opacity: 0,
              y: 40
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.5,
              delay: index * 0.1
            }}>
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      {waste.icon}
                      <h3 className="text-2xl font-bold text-gray-800">{waste.title}</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 pl-2">
                      {waste.items.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </motion.div>)}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div initial={{
              opacity: 0,
              x: -50
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.7
            }}>
                         <img className="rounded-lg shadow-xl" alt="Diagrama del proceso de incineración en planta TRABAMEX" src="https://images.unsplash.com/photo-1567516847971-81df16eefa90" />
                    </motion.div>
                    <motion.div initial={{
              opacity: 0,
              x: 50
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.7
            }}>
                        <MapPin className="h-10 w-10 text-red-600 mb-3" />
                        <h2 className="text-3xl font-bold text-gray-900">Nuestra Planta Autorizada en Jiutepec, Morelos</h2>
                        <p className="mt-4 text-lg text-gray-600 leading-relaxed">Nuestra planta autorizada en Jiutepec, en la zona industrial de Civac, cuenta con infraestructura moderna y procesos certificados para garantizar un servicio de la más alta calidad.</p>
                        <div className="mt-8 space-y-6">
                            {techSpecs.map((spec, index) => <div key={index} className="flex items-center">
                                    <div className="flex-shrink-0 bg-red-100 p-3 rounded-full">
                                        {spec.icon}
                                    </div>
                                    <p className="ml-4 text-lg text-gray-700 font-medium">{spec.text}</p>
                                </div>)}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

        <section className="bg-gray-50 py-20">
            <div className="container mx-auto px-4">
                 <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Servicios Integrales para tu Empresa</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Complementamos la incineración con soluciones logísticas y de cumplimiento para ofrecerte una gestión 360°.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Link to="/servicios" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                        <Truck className="h-10 w-10 text-red-600 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Recolección y Transporte</h3>
                        <p className="text-gray-600 mb-4">Coordinamos la logística completa desde tus instalaciones hasta nuestra planta.</p>
                        <span className="font-semibold text-red-600 flex items-center">Ver servicios de transporte <ArrowRight className="ml-2 h-4 w-4" /></span>
                    </Link>
                     <Link to="/certificaciones" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                        <Award className="h-10 w-10 text-red-600 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Certificaciones y Legalidad</h3>
                        <p className="text-gray-600 mb-4">Emitimos certificados de destrucción fiscal y de disposición final avalados por SEMARNAT.</p>
                        <span className="font-semibold text-red-600 flex items-center">Conoce nuestras certificaciones <ArrowRight className="ml-2 h-4 w-4" /></span>
                    </Link>
                </div>
            </div>
        </section>

        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Beneficios y Cumplimiento Normativo</h2>
              <p className="mt-4 text-lg text-gray-600">
                Elegir la incineración con TRABAMEX es optar por una solución segura, legal y ambientalmente responsable.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              {benefits.map((benefit, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.5,
              delay: index * 0.1
            }}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.text}</p>
                    </div>
                  </div>
                </motion.div>)}
            </div>
            <motion.div className="max-w-4xl mx-auto text-center bg-gray-100 p-8 md:p-12 rounded-xl mt-20" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <ShieldCheck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Cumplimiento con NOM-098-SEMARNAT-2002</h3>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                Nuestra operación de incineración cumple y excede los estándares de la Norma Oficial Mexicana para la protección ambiental. Emitimos certificados de destrucción que avalan el tratamiento legal de tus residuos.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="bg-red-700 text-white">
          <div className="container mx-auto px-4 py-16 sm:py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">¿Listo para una Gestión de Residuos Segura y Certificada?</h2>
            <p className="mt-4 text-lg text-red-100 max-w-2xl mx-auto">
              Nuestro equipo está listo para brindarte una solución a la medida de las necesidades de tu empresa.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-white text-red-700 font-bold hover:bg-gray-200 text-lg py-3 px-8">
                <Link to="/contacto" state={{
                subject: "Cotización para servicio de incineración certificada"
              }}>
                  Cotiza tu servicio de incineración certificada en Morelos
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default IncinerationPage;