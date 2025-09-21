import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Detectar si estamos en el dashboard
  const isInDashboard = location.pathname.includes('/mir/');
  
  // Función para obtener la URL de inicio correcta según el contexto
  const getHomeUrl = () => {
    if (isInDashboard && profile?.role) {
      return `/mir/${profile.role}`;
    }
    return '/';
  };

  const handleNavClick = (sectionId) => {
    setIsMobileMenuOpen(false);
    const section = document.getElementById(sectionId);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const homeSection = document.getElementById(sectionId);
        if (homeSection) {
          homeSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { name: 'Servicio', id: 'servicios' },
    { name: 'Nosotros', id: 'nosotros' },
    { name: 'Industrias', id: 'industrias' },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-md"
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="text-2xl font-bold text-black">TRABAMEX</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link to={getHomeUrl()} className="text-black hover:text-red-600 transition-colors font-medium">Inicio</Link>
            {navLinks.map((link) => (
              <a
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="text-black hover:text-red-600 transition-colors font-medium cursor-pointer"
              >
                {link.name}
              </a>
            ))}
            <Link to="/mir" className="text-red-600 hover:text-red-700 transition-colors font-bold">Conoce MIR</Link>
            <Button onClick={() => handleNavClick('contacto')} className="bg-red-600 hover:bg-red-700 text-white font-bold">
              Contacto
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="md:hidden absolute top-0 left-0 w-full h-screen bg-white/95 backdrop-blur-sm z-50"
          >
            <div className="container mx-auto px-4">
              <div className="flex justify-end h-20 items-center">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center space-y-8 mt-16">
                 <Link to={getHomeUrl()} className="text-2xl text-black hover:text-red-600 transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="text-2xl text-black hover:text-red-600 transition-colors font-medium cursor-pointer"
                  >
                    {link.name}
                  </a>
                ))}
                <Link to="/mir" className="text-2xl text-red-600 hover:text-red-700 transition-colors font-bold" onClick={() => setIsMobileMenuOpen(false)}>Conoce MIR</Link>
                <Button onClick={() => handleNavClick('contacto')} size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold">
                  Contacto
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
