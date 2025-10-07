import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Flame, Skull, Beaker, Zap, PenLine as FilePenLine } from 'lucide-react';

const rpTypes = [
  { title: "Inflamables", icon: <Flame className="h-8 w-8 text-orange-500" />, description: "Sustancias que pueden encenderse fácilmente a temperatura ambiente." },
  { title: "Tóxicos", icon: <Skull className="h-8 w-8 text-orange-500" />, description: "Materiales que pueden causar daño o muerte por ingestión, inhalación o absorción." },
  { title: "Reactivos", icon: <Zap className="h-8 w-8 text-orange-500" />, description: "Sustancias inestables que pueden explotar o reaccionar violentamente." },
  { title: "Corrosivos", icon: <Beaker className="h-8 w-8 text-orange-500" />, description: "Materiales que pueden destruir tejidos vivos y otros materiales." },
];

const processSteps = [
    { number: "01", title: "Identificación", description: "Clasificación precisa según características CRETIB de cada tipo de residuo." },
    { number: "02", title: "Envasado Seguro", description: "Uso de contenedores específicos y resistentes para prevenir fugas y reacciones." },
    { number: "03", title: "Transporte Autorizado", description: "Vehículos especializados con personal certificado para un traslado seguro." },
    { number: "04", title: "Tratamiento", description: "Procesos de neutralización e inactivación para eliminar la peligrosidad." },
    { number: "05", title: "Disposición Final", description: "Confinamiento en sitios autorizados que garantizan la protección ambiental." },
];

const RpPage = () => {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Manejo y Disposición Final de Residuos Peligrosos (RP)",
    "provider": {
      "@type": "LocalBusiness",
      "name": "TRABAMEX"
    },
    "areaServed": [
      {
        "@type": "State",
        "name": "Morelos"
      },
      {
        "@type": "City",
        "name": "Ciudad de México"
      },
      {
        "@type": "State",
        "name": "Puebla"
      }
    ],
    "description": "Disposición final de residuos CRETIB: corrosivos, reactivos, explosivos, tóxicos e inflamables. Transporte y tratamiento certificado."
  };

  return (
    <>
      <Helmet>
        <title>Manejo y Disposición Final de Residuos Peligrosos (RP) en Morelos | TRABAMEX</title>
        <meta name="description" content="Disposición final de residuos CRETIB: corrosivos, reactivos, explosivos, tóxicos e inflamables. Transporte y tratamiento certificado." />
        <link rel="canonical" href="https://trabamex.com/residuos-peligrosos/" />
        <meta property="og:title" content="Manejo y Disposición Final de Residuos Peligrosos (RP) en Morelos | TRABAMEX" />
        <meta property="og:description" content="Disposición final de residuos CRETIB: corrosivos, reactivos, explosivos, tóxicos e inflamables. Transporte y tratamiento certificado." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://trabamex.com/residuos-peligrosos/" />
        <meta property="og:image" content="https://horizons-cdn.hostinger.com/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/trabamex-og-rp.png" />
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
      </Helmet>
      <div className="bg-white">
        <div className="relative bg-gray-50 py-20">
             <div className="absolute inset-0">
                <img className="w-full h-full object-cover" alt="Fondo industrial con contenedores de seguridad" src="https://images.unsplash.com/photo-1614195975309-a3baf592274f" />
                <div className="absolute inset-0 bg-orange-900 bg-opacity-80"></div>
            </div>
          <div className="container mx-auto px-4 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
              <ShieldAlert className="h-16 w-16 text-white mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Residuos Peligrosos (RP)</h1>
              <p className="text-xl text-orange-100">Seguridad y cumplimiento en el manejo de residuos con características CRETIB.</p>
            </motion.div>
          </div>
        </div>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">¿Qué son los Residuos Peligrosos?</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Los Residuos Peligrosos son aquellos que poseen alguna de las características CRETIB (Corrosivos, Reactivos, Explosivos, Tóxicos, Inflamables o Biológico-Infecciosos) y que pueden causar daño a la salud humana o al medio ambiente.
              </p>
                <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg inline-block">
                    <p className="text-orange-800">Sistema de clasificación que determina si un residuo es peligroso basándose en sus propiedades químicas y físicas.</p>
                </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {rpTypes.map(item => (
                <Card key={item.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-orange-100 p-4 rounded-full w-fit mb-2">{item.icon}</div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-gray-600">{item.description}</p></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold text-black mb-4">Proceso de Manejo Integral</h2>
                    <p className="text-lg text-gray-600">
                        Seguimos protocolos estrictos para garantizar el manejo seguro desde la generación hasta la disposición final.
                    </p>
                </div>
                <div className="relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                     <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 hidden md:block"></div>
                     <div className="absolute top-1/2 left-0 w-full flex justify-around hidden md:flex">
                        <div className="w-11/12 h-0.5 bg-orange-500"></div>
                     </div>
                    {processSteps.map(step => (
                        <div key={step.number} className="text-center relative bg-gray-50 px-2">
                           <div className="relative">
                               <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4 border-4 border-gray-50">{step.number}</div>
                           </div>
                            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                            <p className="text-gray-600">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="bg-orange-50 border-orange-500 border-2 rounded-xl p-8">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <FilePenLine className="h-12 w-12 text-orange-600 mb-2"/>
                        <h3 className="text-xl font-bold text-black">Certificaciones</h3>
                        <p className="text-gray-700">Personal certificado y autorizaciones vigentes.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <ShieldAlert className="h-12 w-12 text-orange-600 mb-2"/>
                        <h3 className="text-xl font-bold text-black">Protocolos</h3>
                        <p className="text-gray-700">Procedimientos estrictos de seguridad en cada etapa.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <ShieldAlert className="h-12 w-12 text-orange-600 mb-2"/>
                        <h3 className="text-xl font-bold text-black">Seguros</h3>
                        <p className="text-gray-700">Cobertura completa de responsabilidad civil.</p>
                    </div>
                </div>
            </Card>
          </div>
        </section>
        
        <section className="py-20 bg-gray-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Generas Residuos Peligrosos?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">Asegura la gestión correcta y evita riesgos. Nuestro equipo está listo para ofrecerte una solución a la medida.</p>
            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
                <Link to="/contacto">Solicitar Cotización</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default RpPage;