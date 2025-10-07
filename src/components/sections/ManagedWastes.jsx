import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Biohazard, ShieldAlert, Recycle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const wasteTypes = [
  {
    title: 'Residuos Peligrosos Biológico-Infecciosos (RPBI)',
    description: 'Gestión especializada para residuos generados en atención médica que contienen agentes nocivos.',
    icon: <Biohazard className="h-10 w-10 text-red-500" />,
    link: '/residuos/rpbi',
    imageUrl: 'https://images.unsplash.com/photo-1602052577122-f73b9710adba',
    color: 'red'
  },
  {
    title: 'Residuos Peligrosos (RP)',
    description: 'Manejo seguro de residuos con características CRETIB (Corrosivo, Reactivo, Explosivo, Tóxico, Inflamable, Biológico-Infeccioso).',
    icon: <ShieldAlert className="h-10 w-10 text-orange-500" />,
    link: '/residuos/rp',
    imageUrl: 'https://images.unsplash.com/photo-1614195975309-a3baf592274f',
    color: 'orange'
  },
  {
    title: 'Residuos de Manejo Especial (RME)',
    description: 'Soluciones para residuos generados en procesos productivos que requieren un manejo específico por su volumen o composición.',
    icon: <Recycle className="h-10 w-10 text-blue-500" />,
    link: '/residuos/rme',
    imageUrl: 'https://images.unsplash.com/photo-1592833159091-10e59577d32f',
    color: 'blue'
  }
];

const ManagedWastes = () => {
  return (
    <section id="residuos-manejamos" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Residuos que Manejamos</h2>
          <p className="text-xl text-gray-600">
            Ofrecemos soluciones integrales y seguras para cada tipo de residuo, garantizando el cumplimiento normativo y la protección del medio ambiente.
          </p>
          <div className={`w-24 h-1.5 bg-red-600 mx-auto mt-6`}></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wasteTypes.map((waste, index) => (
            <motion.div
              key={waste.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Link to={waste.link} className="block h-full group">
                <Card className={`h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-t-4 border-${waste.color}-500`}>
                  <div className="relative">
                    <img src={waste.imageUrl} alt={`Banner de ${waste.title}`} className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    <div className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg">
                      {waste.icon}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-black">{waste.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600">{waste.description}</p>
                  </CardContent>
                  <div className="p-6 pt-0">
                     <div className={`flex items-center font-semibold text-${waste.color}-600 group-hover:text-${waste.color}-700`}>
                      Conocer más
                      <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManagedWastes;
