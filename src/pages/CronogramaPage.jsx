import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient.js';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
  Truck,
  Loader2
} from 'lucide-react';

const CronogramaPage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userPlans, setUserPlans] = useState([]);
  const [recollections, setRecollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colores por tipo de plan
  const getPlanColor = (planType) => {
    switch(planType) {
      case 'RPBI': return 'bg-red-500';
      case 'RP': return 'bg-orange-500';
      case 'RME': return 'bg-green-500';
      case 'FISCAL': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanName = (planType) => {
    switch(planType) {
      case 'RPBI': return 'Biológico-Infecciosos';
      case 'RP': return 'Peligrosos';
      case 'RME': return 'Manejo Especial';
      case 'FISCAL': return 'Destrucción Fiscal';
      default: return planType;
    }
  };

  // Navegación del calendario
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Obtener datos del usuario
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      try {
        // Obtener planes del usuario
        const { data: plansData, error: plansError } = await supabase.rpc('get_user_plans', {
          p_user_id: profile?.id
        });

        if (plansError) throw plansError;
        setUserPlans(plansData || []);

        // Obtener recolecciones programadas
        const { data: recollectionsData, error: recollectionsError } = await supabase
          .from('service_orders')
          .select(`
            id,
            created_at,
            status,
            plan_id,
            quantity,
            unit,
            notes
          `)
          .eq('customer_id', profile?.id)
          .in('status', ['SCHEDULED', 'PROGRAMADO', 'EN_ROUTE_TO_PICKUP'])
          .order('created_at', { ascending: true });

        if (recollectionsError) throw recollectionsError;
        
        // Enriquecer recolecciones con datos del plan
        const enrichedRecollections = (recollectionsData || []).map(recollection => {
          const plan = plansData?.find(p => p.plan_id === recollection.plan_id);
          return {
            ...recollection,
            plans: plan ? {
              plan_name: plan.plan_name,
              plan_type: plan.plan_type
            } : null
          };
        });
        
        setRecollections(enrichedRecollections);

      } catch (error) {
        console.error('Error cargando datos del cronograma:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar cronograma',
          description: 'No se pudieron cargar los datos del cronograma',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.id, toast]);

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Obtener recolecciones para una fecha específica
  const getRecollectionsForDate = (date) => {
    return recollections.filter(recollection => {
      const recollectionDate = new Date(recollection.created_at);
      return recollectionDate.toDateString() === date.toDateString();
    });
  };

  // Estadísticas del mes
  const getMonthStats = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthRecollections = recollections.filter(recollection => {
      const recollectionDate = new Date(recollection.created_at);
      return recollectionDate.getFullYear() === year && recollectionDate.getMonth() === month;
    });

    const upcomingEvents = recollections.filter(recollection => {
      const recollectionDate = new Date(recollection.created_at);
      return recollectionDate >= new Date();
    });

    return {
      totalRecollections: monthRecollections.length,
      scheduledDeliveries: monthRecollections.filter(r => r.status === 'SCHEDULED').length,
      upcomingEvents: upcomingEvents.length
    };
  };

  const calendarDays = generateCalendarDays();
  const monthStats = getMonthStats();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="text-lg text-gray-600">Cargando cronograma...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cronograma - MIR</title>
        <meta name="description" content="Cronograma de recolecciones y eventos." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Cronograma</h1>
            <p className="text-gray-600">Gestiona y visualiza tus recolecciones programadas</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Calendario */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow-md border"
              >
                {/* Header del calendario */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-bold text-gray-800">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendario */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayRecollections = getRecollectionsForDate(day);
                    
                    return (
                      <div
                        key={index}
                        className={`
                          p-2 min-h-[60px] border border-gray-200 rounded-lg
                          ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                          ${isToday ? 'ring-2 ring-red-500' : ''}
                        `}
                      >
                        <div className={`text-sm ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>
                          {day.getDate()}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dayRecollections.map((recollection, idx) => (
                            <div
                              key={idx}
                              className={`
                                w-2 h-2 rounded-full ${getPlanColor(recollection.plans?.plan_type)}
                                ${dayRecollections.length > 1 ? 'opacity-70' : ''}
                              `}
                              title={`${recollection.plans?.plan_name || 'Recolección'} - ${recollection.quantity} ${recollection.unit}`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Leyenda */}
                {userPlans.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Leyenda de Planes:</h3>
                    <div className="flex flex-wrap gap-4">
                      {userPlans.map(plan => (
                        <div key={plan.plan_id} className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getPlanColor(plan.plan_type)}`} />
                          <span className="text-sm text-gray-600">
                            {getPlanName(plan.plan_type)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Próximos eventos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-lg shadow-md border mt-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-600" />
                  Próximos eventos
                </h2>
                {recollections.length > 0 ? (
                  <div className="space-y-3">
                    {recollections.slice(0, 5).map(recollection => (
                      <div key={recollection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getPlanColor(recollection.plans?.plan_type)}`} />
                          <div>
                            <p className="font-medium text-gray-800">
                              {recollection.plans?.plan_name || 'Recolección'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(recollection.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">
                            {recollection.quantity} {recollection.unit}
                          </p>
                          <p className="text-xs text-gray-500">
                            {recollection.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No hay eventos programados para este período.
                  </p>
                )}
              </motion.div>
            </div>

            {/* Panel lateral - Estadísticas */}
            <div className="space-y-6">
              {/* Estadísticas del mes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md border"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">Estadísticas del mes</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">{monthStats.totalRecollections}</p>
                    <p className="text-sm text-gray-500">Recolecciones este mes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{monthStats.scheduledDeliveries}</p>
                    <p className="text-sm text-gray-500">Entregas programadas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800">{monthStats.upcomingEvents}</p>
                    <p className="text-sm text-gray-500">Eventos próximos</p>
                  </div>
                </div>
              </motion.div>

              {/* Planes activos */}
              {userPlans.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white p-6 rounded-lg shadow-md border"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Planes activos</h3>
                  <div className="space-y-3">
                    {userPlans.map(plan => (
                      <div key={plan.plan_id} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${getPlanColor(plan.plan_type)}`} />
                        <div>
                          <p className="font-medium text-gray-800">{plan.plan_name}</p>
                          <p className="text-sm text-gray-500">{getPlanName(plan.plan_type)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CronogramaPage;
