import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Biohazard, HeartPulse, Droplets, FlaskConical, Syringe, FileText, CheckCircle } from 'lucide-react';

const rpbiTypes = [
  { title: "Materiales Contaminados", icon: <Biohazard className="h-8 w-8 text-red-500" />, description: "Cultivos, cepas de agentes biológico-infecciosos y material contaminado." },
  { title: "Sangre y Hemoderivados", icon: <Droplets className="h-8 w-8 text-red-500" />, description: "Sangre líquida, suero, plasma y otros hemoderivados en estado líquido." },
  { title: "Objetos Punzocortantes", icon: <Syringe className="h-8 w-8 text-red-500" />, description: "Agujas, bisturís, pipetas, lancetas y cualquier objeto que pueda cortar o punzar." },
  { title: "Patológicos", icon: <HeartPulse className="h-8 w-8 text-red-500" />, description: "Tejidos, órganos, partes y fluidos corporales que se extraen durante cirugías." },
];

const processSteps = [
    { number: "01", title: "Clasificación", description: "Separación adecuada en contenedores especializados según tipo de residuo." },
    { number: "02", title: "Recolección", description: "Transporte seguro con vehículos autorizados y personal capacitado." },
    { number: "03", title: "Tratamiento", description: "Proceso de inactivación mediante tecnologías aprobadas por COFEPRIS." },
    { number: "04", title: "Disposición Final", description: "Disposición segura en sitios autorizados con certificación completa." },
];

const RpbiPage = () => {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Disposición Final de Residuos Biológico-Infecciosos (RPBI)",
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
      }
    ],
    "description": "Recolección, transporte e incineración de RPBI con NOM-087 y COFEPRIS. Servicio a hospitales y clínicas en Morelos y CDMX."
  };

  return (
    <>
      <Helmet>
        <title>Disposición Final de Residuos Biológico-Infecciosos (RPBI) en Morelos | TRABAMEX</title>
        <meta name="description" content="Recolección, transporte e incineración de RPBI con NOM-087 y COFEPRIS. Servicio a hospitales y clínicas en Morelos y CDMX." />
        <link rel="canonical" href="https://trabamex.com/rpbi/" />
        <meta property="og:title" content="Disposición Final de Residuos Biológico-Infecciosos (RPBI) en Morelos | TRABAMEX" />
        <meta property="og:description" content="Recolección, transporte e incineración de RPBI con NOM-087 y COFEPRIS. Servicio a hospitales y clínicas en Morelos y CDMX." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://trabamex.com/rpbi/" />
        <meta property="og:image" content="https://horizons-cdn.hostinger.com/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/trabamex-og-rpbi.png" />
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
      </Helmet>
      <div className="bg-white">
        <div className="relative bg-gray-50 py-20">
             <div className="absolute inset-0">
                <img className="w-full h-full object-cover" alt="Fondo abstracto de laboratorio médico" src="https://images.unsplash.com/photo-1602052577122-f73b9710adba" />
                <div className="absolute inset-0 bg-red-900 bg-opacity-80"></div>
            </div>
          <div className="container mx-auto px-4 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
              <Biohazard className="h-16 w-16 text-white mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Residuos Peligrosos Biológico-Infecciosos (RPBI)</h1>
              <p className="text-xl text-red-100">Gestión segura y certificada para la salud y el medio ambiente.</p>
            </motion.div>
          </div>
        </div>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">¿Qué son los RPBI?</h2>
              <p className="text-lg text-gray-600">
                Los Residuos Peligrosos Biológico-Infecciosos son aquellos materiales generados durante los servicios de atención médica que contienen agentes biológico-infecciosos y que pueden causar efectos nocivos a la salud y al ambiente.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {rpbiTypes.map(item => (
                <Card key={item.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-red-100 p-4 rounded-full w-fit mb-2">{item.icon}</div>
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
                    <h2 className="text-3xl font-bold text-black mb-4">Nuestro Proceso de Manejo</h2>
                    <p className="text-lg text-gray-600">
                        Seguimos un protocolo estricto que garantiza el manejo seguro desde la generación hasta la disposición final.
                    </p>
                </div>
                <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 hidden lg:block"></div>
                     <div className="absolute top-1/2 left-0 w-full flex justify-around hidden lg:flex">
                        <div className="w-4/5 h-0.5 bg-red-500"></div>
                     </div>
                    {processSteps.map(step => (
                        <div key={step.number} className="text-center relative bg-gray-50 px-2">
                           <div className="relative">
                               <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4 border-4 border-gray-50">{step.number}</div>
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
            <Card className="bg-red-50 border-l-4 border-red-500 p-8 text-center md:text-left">
                <div className="md:flex md:items-center md:gap-8">
                    <div className="flex-shrink-0 mb-6 md:mb-0">
                        <FileText className="h-16 w-16 text-red-600 mx-auto" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-black mb-2">Cumplimiento Normativo: NOM-087-ECOL-SSA1-2002</h2>
                        <p className="text-lg text-gray-700 mb-4">
                            Cumplimos estrictamente con la Norma Oficial Mexicana que establece la clasificación de los residuos peligrosos biológico-infecciosos y especifica su manejo.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                           <span className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-red-600" /> Clasificación</span>
                           <span className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-red-600" /> Envasado</span>
                           <span className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-red-600" /> Etiquetado</span>
                        </div>
                    </div>
                </div>
            </Card>
          </div>
        </section>
        
        <section className="py-20 bg-gray-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Necesitas Manejo de RPBI?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">Contacta con nuestros especialistas para obtener una cotización personalizada y asegurar el cumplimiento normativo de tu establecimiento.</p>
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
                <Link to="/contacto">Contactar Especialista</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default RpbiPage;