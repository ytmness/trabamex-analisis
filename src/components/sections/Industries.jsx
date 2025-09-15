import React from 'react';
import { motion } from 'framer-motion';
import { Heart, FlaskConical, School, Smile, Factory, Pill, Zap, Sparkles } from 'lucide-react';

const industries = [
  {
    icon: Heart,
    title: "Hospitales y Clínicas",
    description: "Gestión especializada de RPBI para instalaciones de salud de todos los tamaños."
  },
  {
    icon: Sparkles,
    title: "Consultorios Dentales",
    description: "Soluciones para el manejo de residuos especiales generados en la práctica odontológica."
  },
  {
    icon: FlaskConical,
    title: "Laboratorios",
    description: "Manejo adecuado de residuos químicos y biológicos generados en laboratorios clínicos y de investigación."
  },
  {
    icon: School,
    title: "Escuelas de Medicina",
    description: "Gestión responsable de residuos generados en prácticas académicas y de investigación médica."
  },
  {
    icon: Smile,
    title: "Veterinarias",
    description: "Servicios adaptados para la gestión de residuos biológicos de origen animal."
  },
  {
    icon: Factory,
    title: "Industria General",
    description: "Manejo de Residuos Peligrosos (RP) generados en diversos procesos industriales."
  },
  {
    icon: Pill,
    title: "Farmacéuticas",
    description: "Soluciones para la gestión de medicamentos caducos y residuos farmacéuticos."
  },
  {
    icon: Zap,
    title: "Centros de Investigación",
    description: "Gestión especializada para residuos de laboratorios de investigación científica."
  }
];

const Industries = () => {
  return (
    <section id="industrias" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Industrias que Atendemos
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            En TRABAMEX nos especializamos en brindar soluciones para el manejo de residuos peligrosos adaptadas a las necesidades específicas de cada sector.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="industry-card"
            >
              <industry.icon className="h-8 w-8 text-red-600 mb-5" />
              <h3 className="text-xl font-bold text-black mb-2">{industry.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{industry.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Industries;
