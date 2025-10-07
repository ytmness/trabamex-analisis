import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: "TRABAMEX ha sido un aliado estratégico para nosotros. Su profesionalismo y cumplimiento normativo nos dan la tranquilidad que necesitamos para enfocarnos en nuestros pacientes.",
    name: "Ana Sofía R.",
    title: "Directora, Clínica Salud Total"
  },
  {
    quote: "La plataforma MIR es una herramienta increíble. Nos ha permitido optimizar nuestra gestión de residuos y tener una trazabilidad completa en tiempo real. ¡Totalmente recomendados!",
    name: "Carlos Gutiérrez",
    title: "Gerente de Planta, Industria Química"
  },
  {
    quote: "El servicio de recolección es siempre puntual y el personal muy capacitado. Desde que trabajamos con TRABAMEX, el manejo de nuestros RPBI es mucho más sencillo y seguro.",
    name: "Dra. Laura Méndez",
    title: "Odontóloga, Dental Care"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonios" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            La Voz de Nuestros Clientes
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Descubre por qué empresas líderes confían en nosotros para la gestión de sus residuos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full flex flex-col p-8 bg-gray-50 border-l-4 border-red-600 shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="flex-grow flex flex-col">
                  <Quote className="h-8 w-8 text-red-300 mb-4" />
                  <p className="text-gray-700 italic flex-grow mb-6">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-bold text-black">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
