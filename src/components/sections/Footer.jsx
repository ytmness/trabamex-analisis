import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div>
            <span className="text-2xl font-bold text-white mb-4 block">TRABAMEX</span>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Soluciones integrales para el manejo de Residuos Peligrosos y Residuos Peligrosos Biológico-Infecciosos.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
          </div>
          
          <div>
            <span className="text-lg font-bold text-white mb-4 block tracking-wider">SERVICIOS</span>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#servicios" className="hover:text-white transition-colors">Venta de Insumos</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Recolección y Transporte</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Acopio de Residuos</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Disposición Final</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Capacitación</a></li>
            </ul>
          </div>
          
          <div>
            <span className="text-lg font-bold text-white mb-4 block tracking-wider">INDUSTRIAS</span>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#industrias" className="hover:text-white transition-colors">Hospitales y Clínicas</a></li>
              <li><a href="#industrias" className="hover:text-white transition-colors">Consultorios Dentales</a></li>
              <li><a href="#industrias" className="hover:text-white transition-colors">Laboratorios</a></li>
              <li><a href="#industrias" className="hover:text-white transition-colors">Industria General</a></li>
              <li><a href="#industrias" className="hover:text-white transition-colors">Veterinarias</a></li>
            </ul>
          </div>

          <div>
            <span className="text-lg font-bold text-white mb-4 block tracking-wider">CONTACTO</span>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start">
                <MapPin size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span>Civac, Jiutepec, Morelos</span>
              </li>
              <li className="flex items-start">
                <Phone size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                <a href="tel:+527771234567" className="hover:text-white transition-colors">+52 (777) 123-4567</a>
              </li>
              <li className="flex items-start">
                <Mail size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                <a href="mailto:contacto@trabamex.com" className="hover:text-white transition-colors">contacto@trabamex.com</a>
              </li>
            </ul>
          </div>

        </div>
      </div>
      
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; 2025 TRABAMEX. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
