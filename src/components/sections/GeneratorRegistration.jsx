import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Check } from 'lucide-react';

const serviceIncludes = [
  "Asesoría completa para el registro como generador",
  "Apoyo en tramitología ante autoridades competentes",
  "Orientación sobre normativas aplicables",
  "Seguimiento del proceso hasta su conclusión"
];

const whyChooseUs = [
  "Experiencia comprobada en el sector",
  "Conocimiento profundo de las regulaciones",
  "Proceso simplificado y eficiente",
  "Acceso posterior a nuestros servicios integrales"
];

const GeneratorRegistration = () => {
  const handleRequestAssistance = () => {
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="registro-generador" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gray-50 p-8 md:p-12 rounded-lg shadow-lg text-center"
        >
          <div className="inline-block bg-red-100 p-4 rounded-full mb-6">
            <FileText className="h-10 w-10 text-red-600" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Regístrate como Generador
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            Asesoramos a personas y empresas que necesitan registrarse como generadores de residuos peligrosos o requieren apoyo para realizar el trámite ante las autoridades competentes.
          </p>

          <div className="grid md:grid-cols-2 gap-8 text-left mb-10">
            <div>
              <h3 className="text-xl font-bold text-black mb-4">¿Qué incluye nuestro servicio?</h3>
              <ul className="space-y-3">
                {serviceIncludes.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="h-2 w-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black mb-4">¿Por qué elegir TRABAMEX?</h3>
              <ul className="space-y-3">
                {whyChooseUs.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="h-2 w-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button onClick={handleRequestAssistance} size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold">
            Solicitar Asesoría
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Contacta con nuestro equipo especializado para iniciar tu proceso de registro
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default GeneratorRegistration;
