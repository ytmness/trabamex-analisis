import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { UserCard, UserCardContent, UserCardHeader, UserCardTitle, UserCardDescription } from '@/components/ui/user-card';
import { UserButton } from '@/components/ui/user-button';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  FileText, 
  History, 
  CheckSquare, 
  Box, 
  BarChart3, 
  Clock,
  Loader2 
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';

const UserDashboardPage = () => {
  const { profile, user } = useAuth();
  const [userData, setUserData] = useState({
    planUsage: { used: 0, total: 0 },
    activeRequests: [],
    nextCollection: null,
    manifests: [],
    collectionHistory: [],
    checklist: [],
    supplies: [],
    reports: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Aquí irían las consultas a Supabase para obtener datos del usuario
      // Por ahora usamos datos de ejemplo
      setUserData({
        planUsage: { used: 3, total: 10 },
        activeRequests: [
          { id: 1, type: 'Recolección', status: 'Pendiente', date: '2024-01-15' },
          { id: 2, type: 'Insumos', status: 'Aprobado', date: '2024-01-20' }
        ],
        nextCollection: { date: '2024-01-25', time: '09:00', type: 'Recolección Regular' },
        manifests: [
          { id: 1, date: '2024-01-10', status: 'Completado' },
          { id: 2, date: '2024-01-05', status: 'Completado' }
        ],
        collectionHistory: [
          { id: 1, date: '2024-01-10', type: 'Recolección', status: 'Completado' },
          { id: 2, date: '2024-01-05', type: 'Entrega', status: 'Completado' }
        ],
        checklist: [
          { id: 1, item: 'Separar residuos', completed: true },
          { id: 2, item: 'Verificar contenedores', completed: false }
        ],
        supplies: [
          { id: 1, name: 'Contenedores', quantity: 5, status: 'Disponible' },
          { id: 2, name: 'Bolsas', quantity: 20, status: 'Disponible' }
        ],
        reports: [
          { id: 1, title: 'Reporte Mensual', date: '2024-01-01', type: 'PDF' },
          { id: 2, title: 'Certificado Ambiental', date: '2024-01-01', type: 'PDF' }
        ]
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar datos',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const quickActions = [
    { text: 'Nueva Solicitud', to: '/mir/user/solicitar', icon: Package, color: 'bg-blue-600' },
    { text: 'Ver Checklist', to: '/mir/user/checklist', icon: CheckSquare, color: 'bg-green-600' },
    { text: 'Solicitar Insumos', to: '/mir/user/solicitar-insumos', icon: Box, color: 'bg-purple-600' },
    { text: 'Ver Reportes', to: '/mir/user/reportes', icon: BarChart3, color: 'bg-orange-600' }
  ];

  if (loading) {
    return (
      <div className="user-theme min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Cliente MIR</title>
        <meta name="description" content="Dashboard del cliente para gestionar servicios y solicitudes." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header con gradiente */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-white shadow-lg mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">¡Hola, {profile?.full_name || 'Cliente'}!</h1>
                <p className="mt-2 text-red-100 text-lg">Gestiona tus servicios de recolección de residuos</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userData.planUsage.used}</div>
                    <div className="text-sm text-red-100">Recolecciones usadas</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Estadísticas principales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Uso del Plan */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uso del Plan</p>
                  <p className="text-2xl font-bold text-gray-900">{userData.planUsage.used}/{userData.planUsage.total}</p>
                  <p className="text-xs text-gray-500">Recolecciones</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(userData.planUsage.used / userData.planUsage.total) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Solicitudes Activas */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Solicitudes Activas</p>
                  <p className="text-2xl font-bold text-gray-900">{userData.activeRequests.length}</p>
                  <p className="text-xs text-gray-500">Pendientes</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Próxima Recolección */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próxima Recolección</p>
                  <p className="text-lg font-bold text-gray-900">
                    {userData.nextCollection ? userData.nextCollection.date : 'Sin programar'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userData.nextCollection ? userData.nextCollection.time : 'No hay citas'}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </motion.div>


          {/* Acciones Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
                <p className="text-gray-600">Accede rápidamente a las funciones más comunes</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Link 
                    key={index} 
                    to={action.to} 
                    className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-red-100 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 border border-gray-200 hover:border-red-200"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="bg-white group-hover:bg-red-100 p-3 rounded-lg transition-colors">
                        <action.icon className="h-6 w-6 text-gray-600 group-hover:text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-red-700">{action.text}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Solicitudes Activas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Solicitudes Activas</h2>
                <p className="text-gray-600">Estado de tus solicitudes pendientes</p>
              </div>
              {userData.activeRequests.length > 0 ? (
                <div className="space-y-4">
                  {userData.activeRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Package className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{request.type}</div>
                          <div className="text-sm text-gray-600">{request.date}</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        request.status === 'Aprobado' ? 'bg-green-100 text-green-800 border border-green-200' :
                        'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No tienes solicitudes activas</p>
                  <p className="text-gray-400 text-sm">Crea una nueva solicitud usando las acciones rápidas</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Resumen de Actividad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Manifiestos */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{userData.manifests.length}</div>
                  <div className="text-sm text-gray-600">Manifiestos</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">Total de documentos generados</div>
            </div>

            {/* Historial */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <History className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{userData.collectionHistory.length}</div>
                  <div className="text-sm text-gray-600">Completadas</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">Recolecciones realizadas</div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {userData.checklist.filter(item => item.completed).length}/{userData.checklist.length}
                  </div>
                  <div className="text-sm text-gray-600">Tareas</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">Progreso del checklist</div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UserDashboardPage;
