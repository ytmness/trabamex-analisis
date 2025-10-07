import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, Flame, Recycle, Shield, Package, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
    { name: 'Servicios', id: 'servicios' },
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
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-black hover:text-red-600 transition-colors font-medium">
                Nosotros <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link to="/nuestra-historia" className="flex items-center">
                    Nuestra Historia
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/certificaciones" className="flex items-center">
                    Certificaciones
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-black hover:text-red-600 transition-colors font-medium">
                Manejo de Residuos <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link to="/residuos-peligrosos" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" /> Residuos Peligrosos (RP)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/rpbi" className="flex items-center">
                    <Recycle className="mr-2 h-4 w-4" /> Residuos Biológico-Infecciosos (RPBI)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/rme" className="flex items-center">
                    <Package className="mr-2 h-4 w-4" /> Residuos de Manejo Especial (RME)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/incineracion" className="flex items-center">
                    <Flame className="mr-2 h-4 w-4" /> Incineración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/destruccion-fiscal" className="flex items-center">
                    <Trash2 className="mr-2 h-4 w-4" /> Destrucción Fiscal
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.map((link) => (
              <a
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="text-black hover:text-red-600 transition-colors font-medium cursor-pointer"
              >
                {link.name}
              </a>
            ))}
            <Link to="/blog" className="text-black hover:text-red-600 transition-colors font-medium">Blog</Link>
            <Link to="/mir" className="text-red-600 hover:text-red-700 transition-colors font-bold">MIR</Link>
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
                 
                 {/* Menú móvil de Nosotros */}
                 <div className="text-2xl text-black font-medium">Nosotros</div>
                 <div className="flex flex-col items-center space-y-4">
                   <Link to="/nuestra-historia" className="text-xl text-gray-600 hover:text-red-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                     Nuestra Historia
                   </Link>
                   <Link to="/certificaciones" className="text-xl text-gray-600 hover:text-red-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                     Certificaciones
                   </Link>
                 </div>

                 {/* Menú móvil de residuos */}
                 <div className="text-2xl text-black font-medium">Manejo de Residuos</div>
                 <div className="flex flex-col items-center space-y-4">
                   <Link to="/residuos-peligrosos" className="text-xl text-gray-600 hover:text-red-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                     <Shield className="inline mr-2 h-5 w-5" /> Residuos Peligrosos (RP)
                   </Link>
                   <Link to="/rpbi" className="text-xl text-gray-600 hover:text-red-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                     <Recycle className="inline mr-2 h-5 w-5" /> Residuos Biológico-Infecciosos (RPBI)
                   </Link>
                   <Link to="/rme" className="text-xl text-gray-600 hover:text-red-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                     <Package className="inline mr-2 h-5 w-5" /> Residuos de Manejo Especial (RME)
                   </Link>
                   <Link to="/incineracion" className="text-xl text-gray-600 hover:text-red-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                     <Flame className="inline mr-2 h-5 w-5" /> Incineración
                   </Link>
                   <Link to="/destruccion-fiscal" className="text-xl text-gray-600 hover:text-red-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                     <Trash2 className="inline mr-2 h-5 w-5" /> Destrucción Fiscal
                   </Link>
                 </div>

                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="text-2xl text-black hover:text-red-600 transition-colors font-medium cursor-pointer"
                  >
                    {link.name}
                  </a>
                ))}
                <Link to="/blog" className="text-2xl text-black hover:text-red-600 transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                <Link to="/mir" className="text-2xl text-red-600 hover:text-red-700 transition-colors font-bold" onClick={() => setIsMobileMenuOpen(false)}>MIR</Link>
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
