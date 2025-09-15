import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Phone, Mail, MapPin, Loader2 } from 'lucide-react';

const Contact = () => {
  const form = useRef();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
    <section id="contacto" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Contáctanos</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos listos para atender tus necesidades de gestión de residuos peligrosos. Ponte en contacto con nosotros para recibir asesoramiento personalizado.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-6">Envíanos un Mensaje</h3>
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
                <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                <Input id="empresa" name="empresa" type="text" placeholder="Nombre de tu empresa" />
              </div>
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
                    'Enviar Mensaje'
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-8">
                <div>
                    <h3 className="text-2xl font-bold mb-4">Información de Contacto</h3>
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
                <div className="bg-gray-800 text-white p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Horario de Atención</h3>
                    <ul className="space-y-2 text-gray-300">
                        <li><span className="font-semibold">Lunes a Viernes:</span> 8:00 AM - 6:00 PM</li>
                        <li><span className="font-semibold">Sábados:</span> 9:00 AM - 2:00 PM</li>
                        <li><span className="font-semibold">Domingos:</span> Cerrado</li>
                    </ul>
                    <div className="border-t border-gray-600 mt-4 pt-4">
                       <p className="font-semibold">Servicio de emergencia disponible 24/7</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
