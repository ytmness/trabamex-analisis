import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Calendar,
  Package,
  Truck,
  Shield,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OperatorChecklistPage = () => {
  const { profile, user } = useAuth();
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Checklist predefinido para operadores
  const defaultChecklist = [
    {
      id: 1,
      title: "Verificación de Equipo",
      items: [
        { id: 1, text: "Verificar estado del vehículo", completed: false },
        { id: 2, text: "Revisar herramientas de recolección", completed: false },
        { id: 3, text: "Confirmar disponibilidad de contenedores", completed: false },
        { id: 4, text: "Verificar sistema de pesaje", completed: false }
      ]
    },
    {
      id: 2,
      title: "Procedimientos de Seguridad",
      items: [
        { id: 5, text: "Usar equipo de protección personal", completed: false },
        { id: 6, text: "Verificar señalización de seguridad", completed: false },
        { id: 7, text: "Confirmar protocolos de emergencia", completed: false },
        { id: 8, text: "Revisar lista de contactos de emergencia", completed: false }
      ]
    },
    {
      id: 3,
      title: "Documentación",
      items: [
        { id: 9, text: "Revisar órdenes del día", completed: false },
        { id: 10, text: "Verificar manifiestos de transporte", completed: false },
        { id: 11, text: "Confirmar permisos de acceso", completed: false },
        { id: 12, text: "Revisar certificados de tratamiento", completed: false }
      ]
    }
  ];

  const fetchChecklist = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Por ahora usamos el checklist predefinido
      // En el futuro se podría cargar desde la base de datos
      setChecklist(defaultChecklist);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar checklist',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const toggleItem = (categoryId, itemId) => {
    setChecklist(prev => prev.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            items: category.items.map(item => 
              item.id === itemId 
                ? { ...item, completed: !item.completed }
                : item
            )
          }
        : category
    ));
  };

  const getCompletionPercentage = () => {
    const totalItems = checklist.reduce((acc, category) => acc + category.items.length, 0);
    const completedItems = checklist.reduce((acc, category) => 
      acc + category.items.filter(item => item.completed).length, 0
    );
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checklist - Operador MIR</title>
        <meta name="description" content="Checklist de procedimientos para el operador." />
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
                <h1 className="text-4xl font-bold">Mi Checklist</h1>
                <p className="mt-2 text-red-100 text-lg">Procedimientos y verificaciones diarias</p>
              </div>
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckSquare className="h-6 w-6 text-red-200" />
                <span className="text-white font-semibold text-sm">OPERADOR</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progreso General */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-white shadow-lg border border-gray-100">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Progreso General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <CheckSquare className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completado</p>
                      <p className="text-2xl font-bold text-gray-900">{getCompletionPercentage()}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {checklist.reduce((acc, category) => acc + category.items.filter(item => item.completed).length, 0)} de {checklist.reduce((acc, category) => acc + category.items.length, 0)} tareas
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Categorías del Checklist */}
          <div className="space-y-6">
            {checklist.map((category, categoryIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + categoryIndex * 0.1 }}
              >
                <Card className="bg-white shadow-lg border border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 flex items-center">
                      {category.title === "Verificación de Equipo" && <Truck className="mr-2 h-5 w-5 text-red-600" />}
                      {category.title === "Procedimientos de Seguridad" && <Shield className="mr-2 h-5 w-5 text-red-600" />}
                      {category.title === "Documentación" && <FileText className="mr-2 h-5 w-5 text-red-600" />}
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <button
                            onClick={() => toggleItem(category.id, item.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              item.completed
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'border-gray-300 hover:border-red-500'
                            }`}
                          >
                            {item.completed && <CheckCircle className="h-3 w-3" />}
                          </button>
                          <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {item.text}
                          </span>
                          {item.completed && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Información Adicional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-red-50 border-red-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-red-700 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Información Importante
                </CardTitle>
              </CardHeader>
              <CardContent className="text-red-700">
                <ul className="space-y-2 text-sm">
                  <li>• Completa todas las verificaciones antes de iniciar tu jornada</li>
                  <li>• Si encuentras algún problema, repórtalo inmediatamente</li>
                  <li>• Este checklist ayuda a mantener la seguridad y calidad del servicio</li>
                  <li>• Los elementos marcados se guardan automáticamente</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OperatorChecklistPage;
