import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, MapPin, Clock, QrCode, Weight, Camera, AlertTriangle, Trash2, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const OperatorStopDetailPage = () => {
  const { stopId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scannedCodes, setScannedCodes] = useState([]);
  const [currentCode, setCurrentCode] = useState('');

  const handleAction = (actionName, payload) => {
    toast({
      title: `Acción: ${actionName}`,
      description: `Se ha ejecutado la acción para la parada ${stopId}.`,
    });
    // Here you would call Supabase to insert a tracking_event
  };

  const handleScanCode = () => {
    if (currentCode.trim() === '') {
      toast({ variant: 'destructive', title: 'Código vacío', description: 'Por favor, introduce un código para escanear.' });
      return;
    }
    if (scannedCodes.includes(currentCode)) {
      toast({ variant: 'destructive', title: 'Código duplicado', description: 'Este contenedor ya ha sido escaneado.' });
      return;
    }
    setScannedCodes([...scannedCodes, currentCode]);
    setCurrentCode('');
  };

  const removeCode = (codeToRemove) => {
    setScannedCodes(scannedCodes.filter(code => code !== codeToRemove));
  };

  return (
    <>
      <Helmet>
        <title>{`Parada ${stopId} - Operador MIR`}</title>
        <meta name="description" content={`Gestionando la parada de servicio ${stopId}.`} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-white shadow-lg mb-8">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold">Parada: Hospital Central</h1>
                <p className="mt-2 text-red-100 text-lg">ID de Orden: {stopId}</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)} 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la Ruta
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white shadow-lg border border-gray-100">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Información de la Parada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-600">
                <p className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-red-600" /> Av. Siempre Viva 123</p>
                <p className="flex items-center"><Clock className="mr-2 h-4 w-4 text-red-600" /> Ventana: 09:00 - 11:00</p>
              </CardContent>
            </Card>
          </motion.div>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Acciones de Proceso</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Button onClick={() => handleAction('Llegué al sitio')} className="bg-red-600 hover:bg-red-700 text-white">Llegué al sitio</Button>
              <Button onClick={() => handleAction('Confirmar Recolectados')} className="bg-red-600 hover:bg-red-700 text-white">Confirmar Recolectados</Button>
              <Button onClick={() => handleAction('Salir a Acopio')} className="bg-red-600 hover:bg-red-700 text-white">Salir a Acopio</Button>
              <Button onClick={() => handleAction('Ingresado a Acopio')} className="bg-red-600 hover:bg-red-700 text-white">Ingresado a Acopio</Button>
              <Button onClick={() => handleAction('Hacia Planta')} className="bg-red-600 hover:bg-red-700 text-white">Hacia Planta</Button>
              <Button onClick={() => handleAction('Inicio Tratamiento')} className="bg-red-600 hover:bg-red-700 text-white">Inicio Tratamiento</Button>
              <Button onClick={() => handleAction('Tratamiento Terminado')} className="bg-red-600 hover:bg-red-700 text-white">Tratamiento Terminado</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scan Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-gray-900">
                <QrCode className="mr-2 text-red-600"/> Escanear Contenedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="Ingresar código manualmente" 
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
                <Button onClick={handleScanCode} className="bg-red-600 hover:bg-red-700 text-white">
                  <PlusCircle className="h-4 w-4 mr-2"/>Añadir
                </Button>
                <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                  <Camera className="h-4 w-4"/>
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Contenedores escaneados:</Label>
                {scannedCodes.length > 0 ? (
                  <ul className="border border-gray-200 rounded-md p-2 space-y-1">
                    {scannedCodes.map(code => (
                      <li key={code} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-gray-700">{code}</span>
                        <Button variant="ghost" size="icon" onClick={() => removeCode(code)}>
                          <Trash2 className="h-4 w-4 text-red-500"/>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Ningún contenedor escaneado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weight & Photo Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-white shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-gray-900">
                <Weight className="mr-2 text-red-600"/> Pesado y Verificado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gross-weight" className="text-gray-700">Peso Bruto (kg)</Label>
                  <Input id="gross-weight" type="number" placeholder="e.g., 25.5" className="border-gray-300 focus:border-red-500 focus:ring-red-500" />
                </div>
                <div>
                  <Label htmlFor="tare-weight" className="text-gray-700">Tara (kg)</Label>
                  <Input id="tare-weight" type="number" placeholder="e.g., 1.2" className="border-gray-300 focus:border-red-500 focus:ring-red-500" />
                </div>
                <div>
                  <Label htmlFor="net-weight" className="text-gray-700">Peso Neto (kg)</Label>
                  <Input id="net-weight" type="number" placeholder="24.3" disabled className="bg-gray-100 border-gray-300" />
                </div>
              </div>
              <div>
                <Label className="text-gray-700">Fotografía de Báscula (Opcional)</Label>
                <Button variant="outline" className="w-full flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50">
                  <Camera className="h-4 w-4" /> Tomar Foto
                </Button>
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => handleAction('Guardar Pesaje')}>Guardar Pesaje y Verificación</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Incident Report */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-yellow-50 border-yellow-400 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-700 text-xl">
                <AlertTriangle className="mr-2"/> Reportar Incidencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Si encuentras algún problema, repórtalo aquí. Esto no cambiará el estado de la orden pero notificará al administrador.</p>
              <Button asChild variant="destructive" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                <Link to={`/mir/${profile.role}/incident/new?stopId=${stopId}`}>
                  Crear Reporte de Incidencia
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
    </>
  );
};

export default OperatorStopDetailPage;
