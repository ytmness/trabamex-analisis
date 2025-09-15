import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Commitment from '@/components/sections/Commitment';

const HistoryPage = () => {
  return (
    <>
      <Helmet>
        <title>Nuestra Historia y Compromiso - TRABAMEX</title>
        <meta name="description" content="La historia y el compromiso de TRABAMEX, una empresa nacida para transformar el manejo de residuos peligrosos en México con seguridad y transparencia." />
      </Helmet>
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-gray-800"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 text-center">Nuestra Historia</h1>
            <div className="w-24 h-1.5 bg-red-600 mx-auto mb-12"></div>

            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                En TRABAMEX S.A. de C.V., nacimos con un propósito claro: transformar la forma en que se maneja y trata el residuo peligroso biológico-infeccioso (RPBI) en México, brindando un servicio integral, seguro y transparente que cumpla con los más altos estándares normativos y éticos.
              </p>
              <p>
                Nuestra historia comienza en el estado de Morelos, donde un equipo multidisciplinario, comprometido con la salud pública, la protección ambiental y la legalidad, detectó la necesidad urgente de ofrecer soluciones confiables y accesibles para el manejo adecuado de residuos peligrosos. Fue así como en mayo de 2025 iniciamos este proyecto con una visión clara: convertirnos en líderes en el sector del manejo integral de RP y RPBI, priorizando siempre la responsabilidad, la eficiencia y el cumplimiento normativo.
              </p>
              <p>
                Desde el primer día, nos propusimos ir más allá de la simple recolección. Invertimos en infraestructura propia, un centro de acopio y una planta de tratamiento con tecnología de autoclave, incineración y desinfección química, así como en unidades de transporte adaptadas especialmente para el traslado seguro de residuos biológico-infecciosos. Cada decisión fue tomada pensando en ofrecer un servicio integral que incluya desde el suministro de insumos hasta la disposición final, todo bajo un mismo esquema confiable y con trazabilidad total.
              </p>
              <p>
                Hoy, TRABAMEX es una empresa que se construye desde la convicción de que es posible combinar el desarrollo empresarial con el cuidado del entorno y la salud colectiva. Seguimos creciendo, tramitando cada permiso, certificación y requisito con rigor, conscientes de que operar de manera legal y profesional es la única forma de generar confianza y marcar la diferencia.
              </p>
              <p className="font-semibold text-black">
                Nuestra historia apenas comienza. Lo que nos impulsa día a día es el compromiso de convertirnos en el aliado ambiental de clínicas, hospitales, laboratorios, veterinarias, e instituciones públicas y privadas que requieren un manejo responsable de sus residuos peligrosos. Estamos aquí para servir con integridad y visión de futuro.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <Commitment />
    </>
  );
};

export default HistoryPage;
