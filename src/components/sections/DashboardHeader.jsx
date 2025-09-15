import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from "../ui/button";
import {
  Bell,
  UserCircle,
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
  Users,
  UserCog,
  Truck,
  Package,
  FileText,
  ShieldAlert,
  FlaskConical,
  ArrowLeft,
  Home,
  User,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "../ui/use-toast";

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Funciones de navegación rápida
  const goToUserPanel = () => {
    navigate('/mir/user');
  };

  const goToAdminPanel = () => {
    navigate('/mir/admin');
  };

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate('/mir');
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    // Por ahora, usar rutas hardcodeadas basadas en la URL
    const currentPath = window.location.pathname;
    let role = 'usuario';
    
    if (currentPath.includes('/admin')) {
      role = 'admin';
    } else if (currentPath.includes('/operador')) {
      role = 'operador';
    } else {
      role = 'usuario';
    }
    
    const base = `/mir/${role}`;
    
    const userLinks = [
      { to: base, text: 'Inicio', icon: LayoutDashboard },
      { to: `${base}/solicitar`, text: 'Solicitar', icon: PlusCircle },
      { to: `${base}/cronograma`, text: 'Cronograma', icon: FileText },
      { to: `${base}/checklist`, text: 'Checklist', icon: FileText },
      { to: `${base}/planes`, text: 'Planes', icon: FileText },
      { to: `${base}/tracking`, text: 'Tracking', icon: Truck },
      { to: `${base}/servicios`, text: 'Servicios', icon: FileText },
    ];

    const operatorLinks = [
      { to: base, text: 'Mis Rutas', icon: Truck, end: true },
    ];
    
    const adminLinks = [
      { to: base, text: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: `${base}/tracking`, text: 'Tracking', icon: Truck },
      { to: `${base}/clientes`, text: 'Clientes', icon: Users },
      { to: `${base}/operadores`, text: 'Operadores', icon: UserCog },
      { to: `${base}/ordenes`, text: 'Órdenes', icon: Package },
      { to: `${base}/rutas`, text: 'Rutas', icon: Truck },
      { to: `${base}/planes-admin`, text: 'Planes', icon: FileText },
      { to: `${base}/tratamientos`, text: 'Tratamientos', icon: FlaskConical },
      { to: `${base}/incidencias`, text: 'Incidencias', icon: ShieldAlert },
    ];

    switch (role) {
      case 'usuario':
        return userLinks;
      case 'operador':
        return operatorLinks;
      case 'admin':
        return adminLinks;
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const NavItems = ({ isMobile }) => (
    <nav className={`flex items-center ${isMobile ? 'flex-col space-y-4' : 'space-x-6'}`}>
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={({ isActive }) =>
            `text-sm font-medium transition-colors flex items-center gap-2 ${
              isActive
                ? 'text-red-600'
                : 'text-gray-600 hover:text-black'
            } ${isMobile ? 'text-lg' : ''}`
          }
        >
          {link.icon && <link.icon className="h-4 w-4" />}
          {link.text}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/mir/${user?.role || 'usuario'}`} className="flex items-center gap-2">
                <span className="font-bold text-2xl text-black">TRABAMEX</span>
              </Link>

              {/* Botones de navegación rápida */}
              {user?.role === 'admin' && (
                <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
                  {/* Botón Regresar */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={goBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    title="Regresar"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Regresar</span>
                  </Button>

                  {/* Botón Inicio */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={goHome}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    title="Inicio"
                  >
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Inicio</span>
                  </Button>

                  {/* Botón Panel de Cliente */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={goToUserPanel}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Panel de Cliente"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Cliente</span>
                  </Button>

                  {/* Botón Panel de Admin */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={goToAdminPanel}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Panel de Administrador"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="hidden lg:flex">
              <NavItems />
            </div>

            <div className="flex items-center gap-4">
               {user?.role === 'usuario' && (
                <div className="hidden sm:flex">
                    <Button asChild className="bg-red-600 hover:bg-red-700">
                    <Link to={`/mir/${user?.role}/solicitar`}>
                        Solicitar recolección
                    </Link>
                    </Button>
                </div>
               )}
              <Button variant="ghost" size="icon" title="Notificaciones">
                <Bell className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" title="Perfil">
                <UserCircle className="h-6 w-6 text-gray-600" />
              </Button>
              <div className="lg:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-sm fixed top-20 left-0 w-full z-30 shadow-md"
          >
            <div className="container mx-auto px-4 py-8 flex flex-col items-center space-y-6">
              <NavItems isMobile />
              {user?.role === 'usuario' && (
                <Button asChild className="bg-red-600 hover:bg-red-700 w-full mt-4">
                    <Link to={`/mir/${user?.role}/solicitar`} onClick={() => setIsMobileMenuOpen(false)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Solicitar recolección
                    </Link>
                </Button>
              )}
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                Cerrar Sesión
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardHeader;
