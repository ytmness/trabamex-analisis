import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Recycle, Droplet, Factory, Box, Leaf, PenLine as FilePenLine } from 'lucide-react';

const rmeTypes = [
  { title: "Grasas y Aceites", icon: <Droplet className="h-8 w-8 text-blue-500" />, description: "Aceites vegetales, grasas animales y aceites de cocina usados." },
  { title: "Residuos Industriales", icon: <Factory className="h-8 w-8 text-blue-500" />, description: "Lodos, catalizadores gastados y otros residuos de procesos industriales." },
  { title: "Materiales Reciclables", icon: <Recycle className="h-8 w-8 text-blue-500" />, description: "Plásticos, metales y otros materiales con potencial de valorización." },
  { title: "Residuos Orgánicos", icon: <Leaf className="h-8 w-8 text-blue-500" />, description: "Restos de alimentos y materiales orgánicos de gran volumen." },
];

const processSteps = [
    { number: "01", title: "Caracterización", description: "Análisis detallado del tipo y composición del residuo para su valorización." },
    { number: "02", title: "Recolección", description: "Transporte con equipos adecuados para cada tipo de material especial." },
    { number: "03", title: "Procesamiento", description: "Tratamiento para valorización o preparación para disposición segura." },
    { number: "04", title: "Valorización", description: "Transformación de residuos en nuevos productos, materias primas o energía." },
];

const RmePage = () => {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Disposición Final de Residuos de Manejo Especial (RME)",
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
        "@type": "AdministrativeArea",
        "name": "Zona Centro de México"
      }
    ],
    "description": "Valorización y disposición segura de RME: industriales, reciclables, aceites y orgánicos. Solución integral en Morelos y zona centro."
  };
  
  return (
    <>
      <Helmet>
        <title>Disposición Final de Residuos de Manejo Especial (RME) en Morelos | TRABAMEX</title>
        <meta name="description" content="Valorización y disposición segura de RME: industriales, reciclables, aceites y orgánicos. Solución integral en Morelos y zona centro." />
        <link rel="canonical" href="https://trabamex.com/rme/" />
        <meta property="og:title" content="Disposición Final de Residuos de Manejo Especial (RME) en Morelos | TRABAMEX" />
        <meta property="og:description" content="Valorización y disposición segura de RME: industriales, reciclables, aceites y orgánicos. Solución integral en Morelos y zona centro." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://trabamex.com/rme/" />
        <meta property="og:image" content="https://horizons-cdn.hostinger.com/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/trabamex-og-rme.png" />
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
      </Helmet>
      <div className="bg-white">
        <div className="relative bg-gray-50 py-20">
             <div className="absolute inset-0">
                <img className="w-full h-full object-cover" alt="Paisaje con turbinas eólicas y paneles solares" src="https://images.unsplash.com/photo-1592833159091-10e59577d32f" />
                <div className="absolute inset-0 bg-blue-900 bg-opacity-80"></div>
            </div>
          <div className="container mx-auto px-4 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
              <Recycle className="h-16 w-16 text-white mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Residuos de Manejo Especial (RME)</h1>
              <p className="text-xl text-blue-100">Transformando residuos en recursos para un futuro sostenible.</p>
            </motion.div>
          </div>
        </div>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">¿Qué son los RME?</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Los Residuos de Manejo Especial son aquellos generados en procesos productivos que no reúnen las características para ser considerados peligrosos o sólidos urbanos, pero requieren un manejo específico debido a su volumen, origen o composición.
              </p>
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg inline-block">
                <p className="text-blue-800">Nuestro objetivo es maximizar la valorización de estos residuos, convirtiéndolos en recursos útiles y minimizando su impacto ambiental.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {rmeTypes.map(item => (
                <Card key={item.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-blue-100 p-4 rounded-full w-fit mb-2">{item.icon}</div>
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
                    <h2 className="text-3xl font-bold text-black mb-4">Proceso de Valorización</h2>
                    <p className="text-lg text-gray-600">
                        Transformamos residuos en recursos mediante procesos especializados y tecnología avanzada.
                    </p>
                </div>
                <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 hidden lg:block"></div>
                     <div className="absolute top-1/2 left-0 w-full flex justify-around hidden lg:flex">
                        <div className="w-4/5 h-0.5 bg-blue-500"></div>
                     </div>
                    {processSteps.map(step => (
                        <div key={step.number} className="text-center relative bg-gray-50 px-2">
                           <div className="relative">
                               <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4 border-4 border-gray-50">{step.number}</div>
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
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-black mb-2">Beneficios de Nuestro Servicio</h2>
                <p className="text-lg text-gray-600">Más que un servicio de recolección, ofrecemos soluciones integrales que generan valor.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center p-6">
                    <Recycle className="h-12 w-12 text-blue-600 mx-auto mb-4"/>
                    <h3 className="text-xl font-bold text-black">Economía Circular</h3>
                    <p className="text-gray-700">Transformamos residuos en recursos útiles, cerrando el ciclo de materiales.</p>
                </Card>
                 <Card className="text-center p-6">
                    <Leaf className="h-12 w-12 text-blue-600 mx-auto mb-4"/>
                    <h3 className="text-xl font-bold text-black">Sostenibilidad</h3>
                    <p className="text-gray-700">Reducimos el impacto ambiental mediante procesos eco-amigables.</p>
                </Card>
                 <Card className="text-center p-6">
                    <FilePenLine className="h-12 w-12 text-blue-600 mx-auto mb-4"/>
                    <h3 className="text-xl font-bold text-black">Cumplimiento Legal</h3>
                    <p className="text-gray-700">Garantizamos el cumplimiento de todas las normativas ambientales aplicables.</p>
                </Card>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-gray-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Generas Residuos de Manejo Especial?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">Descubre cómo podemos ayudarte a convertir tus residuos en recursos de valor y mejorar la sostenibilidad de tu empresa.</p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/contacto">Consulta Gratuita</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default RmePage;