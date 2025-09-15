import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <section id="nosotros" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Líderes en Gestión de Residuos Peligrosos
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              TRABAMEX es una empresa líder en el manejo integral de Residuos Peligrosos (RP) y Residuos Peligrosos Biológico-Infecciosos (RPBI) en México.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Con sede en Civac, Jiutepec, Morelos, hemos establecido un sólido compromiso con la protección del medio ambiente y la salud pública, ofreciendo soluciones completas que cumplen con todas las normativas vigentes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                <Link to="/nuestra-historia">Conocer Nuestra Historia</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
                <Link to="/certificaciones">Certificaciones</Link>
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              className="rounded-lg shadow-2xl w-full h-96 object-cover" 
              alt="Equipo profesional de manejo de residuos peligrosos"
              src="https://images.unsplash.com/photo-1632988145815-344270bb3167" />
            <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-2xl font-bold">100+</div>
              <div className="text-sm">Clientes Satisfechos</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
