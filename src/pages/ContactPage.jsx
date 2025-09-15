import React, { useRef, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Phone, Mail, MapPin, Loader2, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactPage = ({ service = false }) => {
  const form = useRef();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const [serviceSubject, setServiceSubject] = useState('');

  useEffect(() => {
    if (service && location.state?.service) {
      setServiceSubject(`Solicitud de servicio: ${location.state.service}`);
    }
  }, [service, location.state]);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(form.current);
    const nombre = formData.get('nombre');
    const email = formData.get('email');
    const mensaje = formData.get('mensaje');

    if (!nombre || !email || !mensaje) {
        toast({
            title: "Error",
            description: "Por favor, completa todos los campos requeridos.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    emailjs.sendForm(
        'service_9q7n7eb', 
        'template_faaiipa', 
        form.current, 
        '_ZdCvoKY9CCN5Ffcf'
      )
      .then((result) => {
          console.log(result.text);
          toast({
            title: "¡Mensaje Enviado!",
            description: "Gracias por contactarnos. Te responderemos a la brevedad.",
          });
          form.current.reset();
          if (service && location.state?.service) {
             setServiceSubject(`Solicitud de servicio: ${location.state.service}`);
          }
      }, (error) => {
          console.log(error.text);
          toast({
            title: "Error al enviar",
            description: "Hubo un problema al enviar tu mensaje. Inténtalo de nuevo.",
            variant: "destructive",
          });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Helmet>
        <title>{service ? 'Solicitar Servicio' : 'Contacto'} - TRABAMEX</title>
        <meta name="description" content="Ponte en contacto con nosotros para recibir asesoramiento personalizado." />
      </Helmet>
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          
          {service && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
              <Button asChild variant="ghost">
                <Link to="/dashboard/servicios">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Servicios
                </Link>
              </Button>
            </motion.div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              {service ? 'Solicitar un Servicio' : 'Contáctanos'}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {service 
                ? 'Completa el formulario para solicitar tu servicio. Nos pondremos en contacto contigo a la brevedad.' 
                : 'Estamos listos para atender tus necesidades. Ponte en contacto para recibir asesoramiento personalizado.'}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-5 gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="lg:col-span-3 bg-white p-8 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Envíanos un Mensaje</h2>
              <form ref={form} onSubmit={sendEmail} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <Input id="nombre" name="nombre" type="text" placeholder="Tu nombre" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">Empresa (Opcional)</label>
                  <Input id="empresa" name="empresa" type="text" placeholder="Nombre de tu empresa" />
                </div>
                 {service && (
                    <div>
                        <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                        <Input id="asunto" name="asunto" type="text" value={serviceSubject} readOnly className="bg-gray-100" />
                    </div>
                )}
                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <Textarea id="mensaje" name="mensaje" rows="4" placeholder="¿Cómo podemos ayudarte?" required />
                </div>
                <div>
                  <Button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-base">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="space-y-8">
                  <div className="bg-white p-8 rounded-xl shadow-lg">
                      <h3 className="text-2xl font-bold mb-4 text-gray-800">Información de Contacto</h3>
                      <div className="space-y-4">
                          <div className="flex items-start">
                              <MapPin className="h-6 w-6 text-red-600 mt-1 mr-4 flex-shrink-0" />
                              <div>
                                  <p className="font-semibold">Dirección</p>
                                  <p className="text-gray-600">Calle 21 Este 205, Civac, Jiutepec, Morelos, México</p>
                              </div>
                          </div>
                          <div className="flex items-start">
                              <Phone className="h-6 w-6 text-red-600 mt-1 mr-4 flex-shrink-0" />
                              <div>
                                  <p className="font-semibold">Teléfono</p>
                                  <p className="text-gray-600">+52 (777) 259 1019</p>
                              </div>
                          </div>
                          <div className="flex items-start">
                              <Mail className="h-6 w-6 text-red-600 mt-1 mr-4 flex-shrink-0" />
                              <div>
                                  <p className="font-semibold">Email</p>
                                  <p className="text-gray-600">contacto@trabamex.com</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
