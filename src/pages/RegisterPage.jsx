import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';


const RegisterPage = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const { toast } = useToast();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const { data, error } = await signUp(email, password, fullName);
            setLoading(false);
            
            if (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error al registrar',
                    description: error.message,
                });
            } else {
                toast({
                    title: '¡Registro exitoso!',
                    description: 'Te hemos enviado un correo de verificación. Por favor confirma tu email antes de iniciar sesión.',
                });
                navigate('/login');
            }
        } catch (error) {
            setLoading(false);
            toast({
                variant: 'destructive',
                title: 'Error inesperado',
                description: 'Ocurrió un error inesperado durante el registro.',
            });
        }
    };

    return (
        <>
            <Helmet>
                <title>Registro - MIR | TRABAMEX</title>
                <meta name="description" content="Crea tu cuenta MIR para gestionar tus residuos." />
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
                            Crea tu cuenta MIR
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            ¿Ya tienes una?{' '}
                            <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
                                Ingresa aquí
                            </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <Label htmlFor="full-name">Nombre Completo</Label>
                                <Input
                                    id="full-name"
                                    name="name"
                                    type="text"
                                    required
                                    className="mt-1"
                                    placeholder="Tu nombre completo"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
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
                                    required
                                    className="mt-1"
                                    placeholder="Crea una contraseña segura"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Registrarme
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default RegisterPage;
