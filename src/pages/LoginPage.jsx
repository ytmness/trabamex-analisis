import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';
import supabase from '../lib/customSupabaseClient.js';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn, user, loading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            // Siempre usar el rol real del usuario, no el seleccionado manualmente
            const getUserRole = async () => {
                try {
                    // Usar la tabla profiles para obtener el rol
                    const { data: userProfile, error } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();
                    
                    if (error) {
                        console.error('Error obteniendo rol del usuario:', error);
                        // Fallback al rol por defecto
                        navigate('/mir/user', { replace: true });
                        return;
                    }
                    
                    // Mapear roles al formato de las rutas
                    let roleRoute = 'user';
                    if (userProfile.role === 'admin') {
                        roleRoute = 'admin';
                    } else if (userProfile.role === 'operador') {
                        roleRoute = 'operador';
                    }
                    
                    // Redirigir al rol real del usuario
                    console.log('Login exitoso, redirigiendo...');
                    navigate(`/mir/${roleRoute}`, { replace: true });
                } catch (error) {
                    console.error('Error obteniendo rol del usuario:', error);
                    // Fallback al rol por defecto
                    navigate('/mir/user', { replace: true });
                }
            };
            
            getUserRole();
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        
        try {
            const { error } = await signIn(email, password);
            if (error) {
                console.error('Error de login:', error);
                
                // Mensajes más específicos según el tipo de error
                let errorMessage = error.message;
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Tu email no ha sido confirmado. Revisa tu correo y haz clic en el enlace de verificación.';
                } else if (error.message.includes('too many requests')) {
                    errorMessage = 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.';
                }
                
                alert('Error en el login: ' + errorMessage);
            } else {
                console.log('Login exitoso, redirigiendo...');
                // La redirección se manejará automáticamente en el useEffect
            }
        } catch (error) {
            console.error('Error inesperado:', error);
            alert('Error inesperado en el login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Ingresar - MIR | TRABAMEX</title>
                <meta name="description" content="Ingresa a tu cuenta MIR para gestionar tus residuos." />
            </Helmet>
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-lg"
                >
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Ingresa a tu cuenta MIR
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            o{' '}
                            <Link to="/register" className="font-medium text-red-600 hover:text-red-500">
                                crea una cuenta nueva
                            </Link>
                        </p>
                    </div>

                    {/* Información del Sistema */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            El sistema detectará automáticamente tu rol de usuario
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <Label htmlFor="email-address">Correo Electrónico</Label>
                                <Input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="mt-1"
                                    placeholder="correo@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="mt-1"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm">
                                <a href="#" className="font-medium text-red-600 hover:text-red-500">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                                                 <div className="pt-4">
                             <Button 
                                 type="submit" 
                                 className="w-full bg-red-600 hover:bg-red-700" 
                                 disabled={loading || authLoading}
                             >
                                 {(loading || authLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                 Ingresar
                             </Button>
                         </div>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default LoginPage;
