import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const handleServicesClick = () => {
    const servicesSection = document.getElementById('servicios');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactClick = () => {
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-start overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://storage.googleapis.com/hostinger-horizons-assets-prod/fd2fddc7-4c04-4322-9b0a-f43371bdbe1b/765d4aeb112197c2487511ae1438f7a0.png" 
          alt="Trabajador de TRABAMEX manejando residuos peligrosos de forma segura"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-left">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-2xl mr-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-white hero-text-shadow">
            Gestión Integral de Residuos Peligrosos
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-start">
            <Button 
              onClick={handleServicesClick}
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 text-lg"
            >
              Nuestros Servicios
            </Button>
            <Button 
              onClick={handleContactClick}
              variant="outline" 
              size="lg" 
              className="bg-white text-black border-white hover:bg-transparent hover:text-white px-8 py-4 text-lg"
            >
              Contáctanos
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
