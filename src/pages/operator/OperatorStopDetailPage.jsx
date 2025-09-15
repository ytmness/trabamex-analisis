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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la Ruta
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Parada: Hospital Central</CardTitle>
              <CardDescription>ID de Orden: {stopId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-600">
              <p className="flex items-center"><MapPin className="mr-2 h-4 w-4" /> Av. Siempre Viva 123</p>
              <p className="flex items-center"><Clock className="mr-2 h-4 w-4" /> Ventana: 09:00 - 11:00</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle>Acciones de Proceso</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Button onClick={() => handleAction('Llegué al sitio')}>Llegué al sitio</Button>
              <Button onClick={() => handleAction('Confirmar Recolectados')}>Confirmar Recolectados</Button>
              <Button onClick={() => handleAction('Salir a Acopio')}>Salir a Acopio</Button>
              <Button onClick={() => handleAction('Ingresado a Acopio')}>Ingresado a Acopio</Button>
              <Button onClick={() => handleAction('Hacia Planta')}>Hacia Planta</Button>
              <Button onClick={() => handleAction('Inicio Tratamiento')}>Inicio Tratamiento</Button>
              <Button onClick={() => handleAction('Tratamiento Terminado')}>Tratamiento Terminado</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scan Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center"><QrCode className="mr-2"/> Escanear Contenedores</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="Ingresar código manualmente" 
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value)}
                />
                <Button onClick={handleScanCode}><PlusCircle className="h-4 w-4 mr-2"/>Añadir</Button>
                <Button variant="outline"><Camera className="h-4 w-4"/></Button>
              </div>
              <div className="space-y-2">
                <Label>Contenedores escaneados:</Label>
                {scannedCodes.length > 0 ? (
                  <ul className="border rounded-md p-2 space-y-1">
                    {scannedCodes.map(code => (
                      <li key={code} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span>{code}</span>
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
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Weight className="mr-2"/> Pesado y Verificado</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gross-weight">Peso Bruto (kg)</Label>
                  <Input id="gross-weight" type="number" placeholder="e.g., 25.5" />
                </div>
                <div>
                  <Label htmlFor="tare-weight">Tara (kg)</Label>
                  <Input id="tare-weight" type="number" placeholder="e.g., 1.2" />
                </div>
                <div>
                  <Label htmlFor="net-weight">Peso Neto (kg)</Label>
                  <Input id="net-weight" type="number" placeholder="24.3" disabled />
                </div>
              </div>
              <div>
                <Label>Fotografía de Báscula (Opcional)</Label>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Tomar Foto
                </Button>
              </div>
              <Button className="w-full" onClick={() => handleAction('Guardar Pesaje')}>Guardar Pesaje y Verificación</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Incident Report */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-yellow-400">
            <CardHeader><CardTitle className="flex items-center text-yellow-700"><AlertTriangle className="mr-2"/> Reportar Incidencia</CardTitle></CardHeader>
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
    </>
  );
};

export default OperatorStopDetailPage;
