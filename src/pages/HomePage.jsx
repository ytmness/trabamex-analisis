import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import ManagedWastes from '@/components/sections/ManagedWastes';
import Services from '@/components/sections/Services';
import Industries from '@/components/sections/Industries';
import Testimonials from '@/components/sections/Testimonials';
import MirIntro from '@/components/sections/MirIntro';
import Contact from '@/components/sections/Contact';
import GeneratorRegistration from '@/components/sections/GeneratorRegistration';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>TRABAMEX - Servicios Integrales de Residuos Peligrosos</title>
        <meta name="description" content="TRABAMEX: Líderes en servicios integrales de residuos peligrosos y biológico-infecciosos. Suministro, recolección, transporte, acopio y disposición final." />
      </Helmet>
      <Hero />
      <About />
      <ManagedWastes />
      <Services />
      <Industries />
      <Testimonials />
      <MirIntro />
      <GeneratorRegistration />
      <Contact />
    </>
  );
};

export default HomePage;
