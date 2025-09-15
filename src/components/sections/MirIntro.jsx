import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, CheckCircle } from 'lucide-react';

const MirIntro = () => {
  return (
    <section id="mir-intro" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-gray-50 rounded-lg shadow-lg overflow-hidden md:grid md:grid-cols-2 md:items-center">
          <motion.div 
            className="p-8 md:p-12"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide">Plataforma Digital</h2>
            <p className="text-3xl md:text-4xl font-bold text-black mt-2">
              Presentamos <span className="text-red-600">MIR</span>
            </p>
            <p className="mt-4 text-lg text-gray-600">
              Manejo Integral de Residuos: La solución digital para la gestión y seguimiento en tiempo real de tus servicios de recolección y suministro.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Trazabilidad completa de tus residuos.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Acceso a manifiestos y certificados al instante.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Optimiza tu plan de manejo y reduce costos.</span>
              </li>
            </ul>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold">
                <Link to="/mir" target="_blank" rel="noopener noreferrer">
                  Conoce MIR <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
          <motion.div 
            className="p-8 hidden md:block"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
             <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-72 h-72 bg-red-100 rounded-full blur-2xl"></div>
                <Smartphone className="relative h-64 w-64 text-red-400" />
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MirIntro;
