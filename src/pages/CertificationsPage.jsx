import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const certifications = [
  "Licencia de funcionamiento y uso de suelo en zona industrial",
  "Registro fiscal activo ante el SAT",
  "Centro de acopio de residuos peligrosos",
  "Planta de tratamiento y disposición final",
  "Transportista autorizado de RPBI",
  "Certificaciones internas en protocolos de seguridad, recolección y almacenamiento temporal, avaladas por nuestro Manual Interno de Capacitación"
];

const regulations = [
  "NOM-087-ECOL-SSA1-2002",
  "Ley General para la Prevención y Gestión Integral de los Residuos (LGPGIR)",
  "Ley General de Salud (LGS)",
  "Reglamento de la LGPGIR y LGS",
  "Normatividad de la Secretaría de Infraestructura, Comunicaciones y Transportes (SICT)",
  "Normatividad de la Secretaría del Medio Ambiente y Recursos Naturales (SEMARNAT)"
];

const CertificationsPage = () => {
  return (
    <>
      <Helmet>
        <title>Certificaciones - TRABAMEX</title>
        <meta name="description" content="Conozca las certificaciones, permisos y normativas que respaldan la operación de TRABAMEX en el manejo de residuos peligrosos." />
      </Helmet>
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-gray-800"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 text-center">Certificaciones</h1>
            <div className="w-24 h-1.5 bg-red-600 mx-auto mb-12"></div>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              En TRABAMEX, operamos con total apego a la normatividad ambiental y sanitaria vigente en México. Nuestro compromiso con la legalidad y la transparencia se refleja en cada uno de los permisos, autorizaciones y certificaciones que respaldan nuestras actividades.
            </p>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Contamos con la documentación oficial necesaria para brindar servicios de manejo integral de residuos peligrosos, incluyendo:
            </p>

            <div className="bg-gray-50 p-8 rounded-lg shadow-md mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">Documentación y Certificaciones</h2>
              <ul className="space-y-4">
                {certifications.map((cert, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="flex items-start"
                  >
                    <CheckCircle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{cert}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Adicionalmente, cada operación de recolección y disposición final realizada por TRABAMEX es documentada con manifiestos oficiales, bitácoras de recolección y derrames, y certificados de disposición final, garantizando la trazabilidad completa de los residuos desde su origen hasta su destino final.
            </p>

            <div className="bg-gray-50 p-8 rounded-lg shadow-md mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">Normativas que Nos Rigen</h2>
              <ul className="space-y-4">
                {regulations.map((reg, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="flex items-start"
                  >
                    <CheckCircle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{reg}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <p className="text-xl text-center font-semibold text-black leading-relaxed italic">
              "En TRABAMEX, más que cumplir, buscamos elevar el estándar. Creemos que operar de manera legal, transparente y profesional es el primer paso para generar confianza y contribuir a una gestión ambiental verdaderamente responsable."
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CertificationsPage;
