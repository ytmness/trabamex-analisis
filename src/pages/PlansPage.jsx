import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getPlanStats } from '@/utils/planCalculations';

const CircularProgress = ({ percentage, usage, limit }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        <circle
          className="text-gray-200"
          strokeWidth="15"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="100"
          cy="100"
        />
        <motion.circle
          className="text-red-600"
          strokeWidth="15"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="100"
          cy="100"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{usage}kg</span>
        <span className="text-sm text-gray-500">de {limit}kg</span>
        <span className="text-sm font-semibold text-gray-600 mt-1">{percentage}% usado</span>
      </div>
    </div>
  );
};

const plans = [
  {
    range: '0-10kg',
    description: 'Ideal para pequeñas clínicas',
    price: '1,200',
    exceed: '18.00',
    isCurrent: false,
  },
  {
    range: '0-100kg',
    description: 'Perfecto para consultorios medianos',
    price: '3,200',
    exceed: '17.00',
    isCurrent: true,
  },
  {
    range: '0-250kg',
    description: 'Para hospitales y grandes instalaciones',
    price: '6,500',
    exceed: '14.00',
    isCurrent: false,
  },
];

const benefits = [
    'Carta de bienvenida',
    'Certificado de cumplimiento ambiental',
    'Entrega de manifiesto en cada recolección',
    'Calendario de días de recolección',
    'Manual gráfico de usuario sobre clasificación y manejo de residuos',
];

const PlansPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [planStats, setPlanStats] = useState({
    hasPlan: false,
    usage: 0,
    limit: 0,
    percentage: 0,
    planName: 'Sin plan asignado',
    remainingWeight: 0,
    monthlyPrice: 0,
    isOverLimit: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlanStats = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const stats = await getPlanStats(user.id);
        setPlanStats(stats);
      } catch (error) {
        console.error('Error loading plan stats:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar datos del plan',
          description: 'No se pudieron cargar las estadísticas del plan',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlanStats();
  }, [user, toast]);

  const handleNotImplemented = () => {
    toast({
      title: "🚧 ¡Función en desarrollo!",
      description: "Esta característica aún no está implementada, ¡pero puedes solicitarla en tu próximo mensaje! 🚀",
      variant: "default",
    });
  };

  return (
    <>
      <Helmet>
        <title>Planes - MIR</title>
        <meta name="description" content="Consulta tu plan actual y explora otros planes disponibles." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        {/* Botón de regresar al dashboard */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/mir/user'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar al Dashboard
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-50 p-8 rounded-xl border border-red-100 mb-12"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <span className="ml-2 text-gray-600">Cargando datos del plan...</span>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Plan Actual: {planStats.hasPlan ? planStats.planName : 'Sin plan asignado'}
              </h1>
              <p className="text-center text-gray-600 mb-2">
                {planStats.hasPlan ? `$${planStats.monthlyPrice?.toLocaleString()}/mes` : 'Sin precio asignado'}
              </p>
              <div className="flex flex-col md:flex-row items-center justify-around gap-8 mt-8">
                <CircularProgress 
                  percentage={planStats.percentage} 
                  usage={planStats.usage}
                  limit={planStats.limit}
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Beneficios incluidos</h3>
                  <ul className="space-y-3">
                    {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-red-600" />
                            <span className="text-gray-700">{benefit}</span>
                        </li>
                    ))}
                  </ul>
                  {planStats.hasPlan && (
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <p className="text-sm text-gray-600">
                        <strong>Peso restante:</strong> {planStats.remainingWeight}kg
                      </p>
                      {planStats.isOverLimit && (
                        <p className="text-sm text-red-600 font-medium mt-1">
                          ⚠️ Has excedido el límite de tu plan
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Planes disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className={`bg-white p-8 rounded-xl shadow-md border transition-all ${plan.isCurrent ? 'border-red-600 border-2' : 'border-gray-200'}`}
              >
                {plan.isCurrent && <Badge className="absolute -top-3 right-4 bg-red-600">Actual</Badge>}
                <h3 className="text-xl font-bold text-gray-800">{plan.range}</h3>
                <p className="text-gray-500 mt-1 mb-4">{plan.description}</p>
                <p className="text-4xl font-bold text-gray-900">${plan.price}<span className="text-lg font-medium text-gray-500">/mes</span></p>
                <p className="text-sm text-gray-500 mt-1">Excedente: ${plan.exceed} MXN/Kg</p>
                <Button 
                  onClick={handleNotImplemented} 
                  variant={plan.isCurrent ? 'destructive' : 'outline'} 
                  className="w-full mt-6"
                  disabled={plan.isCurrent}
                >
                  {plan.isCurrent ? 'Plan Actual' : 'Cambiar plan'}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default PlansPage;
