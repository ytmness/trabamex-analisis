import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Truck, Recycle, Package, CheckCircle } from 'lucide-react';

const services = [
  {
    icon: Package,
    title: "Suministro de Insumos",
    description: "Contenedores especializados, bolsas rojas, etiquetas de identificación y todo el material necesario para el manejo seguro de residuos.",
    features: ["Contenedores certificados", "Bolsas de alta resistencia", "Etiquetas de identificación", "Material de protección"]
  },
  {
    icon: Truck,
    title: "Recolección y Transporte",
    description: "Servicio de recolección programada con vehículos especializados y personal capacitado para el transporte seguro.",
    features: ["Recolección programada", "Vehículos especializados", "Personal certificado", "Rutas optimizadas"]
  },
  {
    icon: Shield,
    title: "Acopio Temporal",
    description: "Instalaciones seguras y certificadas para el almacenamiento temporal de residuos antes de su disposición final.",
    features: ["Instalaciones certificadas", "Sistemas de seguridad", "Control de temperatura", "Monitoreo 24/7"]
  },
  {
    icon: Recycle,
    title: "Disposición Final",
    description: "Tratamiento y disposición final de residuos mediante tecnologías ambientalmente responsables y certificadas.",
    features: ["Tecnología avanzada", "Certificaciones ambientales", "Trazabilidad completa", "Cumplimiento normativo"]
  }
];

const Services = () => {
  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Nuestros Servicios Integrales
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ofrecemos una solución completa para el manejo de residuos peligrosos y biológico-infecciosos, 
            cumpliendo con todas las normativas ambientales y de seguridad.
          </p>
          <div className="section-divider w-24 mx-auto mt-8"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="service-card p-8"
            >
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <service.icon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-black">{service.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
              
              <ul className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
