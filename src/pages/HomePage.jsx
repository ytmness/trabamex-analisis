import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import About from '@/components/sections/About';
import Industries from '@/components/sections/Industries';
import Contact from '@/components/sections/Contact';
import GeneratorRegistration from '@/components/sections/GeneratorRegistration';
import MirIntro from '@/components/sections/MirIntro';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>TRABAMEX - Servicios Integrales de Residuos Peligrosos</title>
        <meta name="description" content="TRABAMEX: Líderes en servicios integrales de residuos peligrosos y biológico-infecciosos. Suministro, recolección, transporte, acopio y disposición final." />
      </Helmet>
      <Hero />
      <Services />
      <About />
      <GeneratorRegistration />
      <MirIntro />
      <Industries />
      <Contact />
    </>
  );
};

export default HomePage;
