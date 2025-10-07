import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Award, CheckCircle, Leaf } from 'lucide-react';

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
              Líderes en Gestión Integral de Residuos
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              TRABAMEX es una empresa líder en el manejo integral de Residuos Peligrosos (RP), Residuos Peligrosos Biológico-Infecciosos (RPBI) y Residuos de Manejo Especial (RME) en México.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Con sede en Civac, Jiutepec, Morelos, nuestro compromiso es ofrecer soluciones seguras, eficientes y en total cumplimiento con la normativa ambiental, protegiendo la salud pública y el ecosistema.
            </p>
            <ul className="space-y-4 mb-8 text-gray-700">
                <li className="flex items-center">
                    <Award className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                    <span>Empresa joven con un equipo experimentado y comprometido.</span>
                </li>
                <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                    <span>Certificaciones que avalan nuestra calidad y seguridad.</span>
                </li>
                <li className="flex items-center">
                    <Leaf className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                    <span>Compromiso total con la sostenibilidad y el medio ambiente.</span>
                </li>
            </ul>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                <Link to="/nuestra-historia">Nuestra Historia</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
                <Link to="/certificaciones">Ver Certificaciones</Link>
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative h-[450px]"
          >
            <div className="absolute top-0 left-0 w-[70%] h-[70%] rounded-lg shadow-2xl overflow-hidden">
                <img className="w-full h-full object-cover" alt="Técnico con traje de protección manejando contenedores" src="https://images.unsplash.com/photo-1576918783754-00613f24b68b" />
            </div>
            <div className="absolute bottom-0 right-0 w-[60%] h-[60%] rounded-lg shadow-2xl overflow-hidden border-4 border-white">
                <img className="w-full h-full object-cover" alt="Científico mirando por un microscopio" src="https://horizons-cdn.hostinger.com/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/1-tratamiento-residuos-peligrosos-VYMdD.webp" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
