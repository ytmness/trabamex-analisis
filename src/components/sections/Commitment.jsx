import React from 'react';
import { motion } from 'framer-motion';

const commitments = [
  {
    title: "Excelencia Operativa",
    description: "Garantizamos un servicio eficiente y seguro en cada etapa del proceso de gestión de residuos."
  },
  {
    title: "Cumplimiento Normativo",
    description: "Operamos bajo estricto apego a las regulaciones ambientales mexicanas e internacionales."
  },
  {
    title: "Responsabilidad Ambiental",
    description: "Nuestras prácticas están diseñadas para minimizar el impacto ambiental y proteger los recursos naturales."
  }
];

const Commitment = () => {
  return (
    <section id="compromiso" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Nuestro Compromiso</h2>
            <div className="w-24 h-1.5 bg-red-600 mx-auto"></div>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {commitments.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex items-start md:items-center"
              >
                <div className="flex-shrink-0 mr-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-red-600 text-white rounded-full flex items-center justify-center">
                    <span className="text-xl md:text-2xl font-bold">{index + 1}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-base md:text-lg">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Commitment;
