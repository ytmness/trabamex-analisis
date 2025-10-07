import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Star, Pill, FileLock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getPlanStats, getAvailablePlans, assignPlanToUser } from '@/utils/planCalculations';

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

const BenefitItem = ({ text, icon: Icon = Check, iconColor = "text-red-500" }) => (
  <li className="flex items-start gap-3">
    <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
    <span className="text-gray-600">{text}</span>
  </li>
);

const StyledPlanCard = ({ plan, isFeatured = false, onActionClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-white p-8 rounded-lg shadow-md flex flex-col h-full border ${isFeatured ? 'border-red-500 border-2' : 'border-gray-200'}`}
    >
        <div className="flex-grow">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.title}</h3>
            <div className="mb-4">
                <span className="text-4xl font-bold text-red-600">{plan.priceDisplay}</span>
                {plan.priceUnit && <span className="text-gray-500 ml-1">{plan.priceUnit}</span>}
            </div>
            <p className="text-sm text-gray-500 mb-4">{plan.priceSubtext}</p>
            <p className="text-gray-600 mb-6">{plan.description}</p>

            {plan.includes && (
                <>
                    <h4 className="font-bold text-gray-800 mb-3">Incluye:</h4>
                    <ul className="space-y-2 mb-6">
                        {plan.includes.map((item, index) => (
                            <BenefitItem key={index} text={item} />
                        ))}
                    </ul>
                </>
            )}

            {plan.mainBenefits && (
                <>
                    <h4 className="font-bold text-gray-800 mb-3">Beneficios principales:</h4>
                    <ul className="space-y-2">
                        {plan.mainBenefits.map((item, index) => (
                            <BenefitItem key={index} text={item.text} icon={item.included ? CheckCircle : XCircle} iconColor={item.included ? "text-green-500" : "text-red-500"} />
                        ))}
                    </ul>
                </>
            )}
        </div>
        <Button
            onClick={onActionClick}
            className={`w-full mt-8 py-3 ${isFeatured ? 'bg-red-600 hover:bg-red-700' : 'bg-white text-red-600 border border-red-600 hover:bg-red-50'}`}
        >
            {isFeatured ? 'Seleccionar Plan' : 'Más Información'}
        </Button>
    </motion.div>
);


const rpbiPlansData = [
  {
    title: 'Microgenerador',
    priceDisplay: '$4,560',
    priceUnit: 'MXN/año',
    priceSubtext: '$380/mes (anual) • $400/mes (mensual)',
    description: 'La solución más práctica y económica para microgeneradores que buscan estar en regla.',
    includes: [
      '7 kg mensuales (84 kg/año) en plan anual',
      '5 kg mensuales (60 kg/año) en plan mensual',
      'Recolección mensual incluida',
      'Insumos gratuitos según necesidades',
      'Certificados oficiales de disposición final',
      'Acceso a Plataforma MIR',
      'Línea de atención al cliente',
    ],
    mainBenefits: [
      { text: 'Pensado para consultorios pequeños', included: true },
      { text: 'Cumplimiento normativo garantizado', included: true },
      { text: 'Insumos y certificados incluidos', included: true },
      { text: 'Sin preocupaciones por trámites', included: true },
    ],
    isFeatured: true,
  },
  {
    title: 'Plan Básico',
    priceDisplay: '$26,400',
    priceUnit: 'MXN/año',
    priceSubtext: '$2,200/mes (anual) • $2,700/mes (mensual)',
    description: 'Perfecto para instituciones que generan volúmenes bajos pero necesitan confiabilidad.',
    includes: [
      '12 kg mensuales (144 kg/año) en plan anual',
      '10 kg mensuales (120 kg/año) en plan mensual',
      'Recolección mensual incluida',
      'Insumos gratuitos según necesidades',
      'Certificados oficiales de disposición final',
      'Acceso a Plataforma MIR',
      'Línea de atención al cliente',
    ],
    mainBenefits: [
      { text: 'Ideal para laboratorios pequeños', included: true },
      { text: 'Tarifas accesibles con trazabilidad', included: true },
      { text: 'Soporte normativo completo', included: true },
      { text: 'Clínicas privadas y centros diagnóstico', included: true },
    ],
  },
  {
    title: 'Plan Empresarial',
    priceDisplay: '$62,400',
    priceUnit: 'MXN/año',
    priceSubtext: '$5,200/mes (anual) • $5,800/mes (mensual)',
    description: 'La opción más completa para clientes que requieren volumen medio-alto.',
    includes: [
      '105 kg mensuales (1260 kg/año) en plan anual',
      '100 kg mensuales (1200 kg/año) en plan mensual',
      'Recolección mensual incluida',
      'Insumos gratuitos según necesidades',
      'Certificados oficiales de disposición final',
      'Acceso a Plataforma MIR',
      'Línea de atención al cliente',
    ],
    mainBenefits: [
      { text: 'Para hospitales medianos', included: true },
      { text: 'Precio competitivo (~$14.80/kg)', included: true },
      { text: 'Servicio integral con soporte', included: true },
      { text: 'Laboratorios clínicos y centros investigación', included: true },
    ],
  },
  {
    title: 'Plan Corporativo',
    priceDisplay: '$96,000',
    priceUnit: 'MXN/año',
    priceSubtext: '$7,860/mes (anual) • $8,833/mes (mensual)',
    description: 'El paquete más robusto para instituciones con grandes volúmenes de RPBI.',
    includes: [
      '258 kg mensuales (3096 kg/año) en plan anual',
      '250 kg mensuales (3000 kg/año) en plan mensual',
      'Recolección mensual incluida',
      'Insumos gratuitos según necesidades',
      'Certificados oficiales de disposición final',
      'Acceso a Plataforma MIR',
      'Línea de atención al cliente',
    ],
    mainBenefits: [
      { text: 'Para hospitales grandes y universidades', included: true },
      { text: 'Máxima cobertura, menor costo por kilo', included: true },
      { text: 'Garantía ante auditorías ambientales', included: true },
      { text: 'Total cumplimiento legal', included: true },
    ],
  },
];

const rpMedicinePlans = [
    {
        title: 'Medicamentos no controlados',
        priceDisplay: '$30',
        priceUnit: '/kg',
        priceSubtext: '50 kg mínimo',
        description: 'Gestión segura para medicamentos que no requieren control especial.',
        includes: null,
        mainBenefits: [
            { text: 'Transporte seguro', included: true },
            { text: 'Incineración autorizada', included: true },
            { text: 'Certificado de destrucción oficial', included: true },
        ],
    },
    {
        title: 'Medicamentos controlados',
        priceDisplay: '$60',
        priceUnit: '/kg',
        priceSubtext: '25 kg mínimo',
        description: 'Manejo especializado para medicamentos controlados bajo estrictas normas.',
        includes: null,
        mainBenefits: [
            { text: 'Todo lo de "No controlados"', included: true },
            { text: 'Manejo con permisos especiales y protocolos de seguridad', included: true },
            { text: 'Cumplimiento estricto con normativa sanitaria', included: true },
        ],
    },
];

const oilPlans = [
    {
        title: 'Plan Anual',
        priceDisplay: '$64,360',
        priceUnit: 'MXN/año',
        priceSubtext: '$5,363/mes',
        description: 'La mejor opción para un servicio continuo y económico.',
        includes: ['5,000 kg/año (416 kg/mes)', 'Costo por kg extra: $5.32 MXN'],
        mainBenefits: [
            { text: 'Precio más bajo por kilo (~$12.87–14.40/kg)', included: true },
            { text: 'Incluye hasta $3,000 en insumos (6 tambos plásticos de 200 L, reutilizables)', included: true },
            { text: 'Branding incluido en tambos', included: true },
            { text: 'Recolección mensual incluida (12 al año)', included: true },
            { text: 'Certificados de disposición final', included: true },
            { text: 'Acceso a Plataforma MIR', included: true },
        ],
        isFeatured: true,
    },
    {
        title: 'Plan Mensual',
        priceDisplay: '$71,126',
        priceUnit: 'MXN/año',
        priceSubtext: '$5,927/mes',
        description: 'Flexibilidad mensual con un servicio completo y confiable.',
        includes: ['400 kg/mes', 'Costo por kg extra: $8.62 MXN'],
        mainBenefits: [
            { text: 'Precio competitivo por kilo (~$14.80–15.00/kg)', included: true },
            { text: 'Incluye hasta $2,000 en insumos (6 tambos plásticos de 200 L)', included: true },
            { text: 'Recolección mensual incluida', included: true },
            { text: 'Certificados oficiales', included: true },
            { text: 'Acceso a MIR', included: true },
            { text: 'No incluye branding', included: false },
        ],
    },
    {
        title: 'Servicio Libre',
        priceDisplay: '$18',
        priceUnit: '/kg',
        priceSubtext: 'Sin límite de recolección',
        description: 'Paga solo por lo que generas, ideal para necesidades variables.',
        includes: null,
        mainBenefits: [
            { text: 'Flexibilidad total: paga solo lo que generes', included: true },
            { text: 'Incluye recolección, disposición final y certificados', included: true },
            { text: 'No incluye insumos, branding ni acceso a MIR', included: false },
        ],
    },
];

const fiscalDestructionPlan = {
    title: 'Medicamentos – Destrucción Fiscal',
    priceDisplay: '$75',
    priceUnit: '/kg',
    priceSubtext: '25 kg mínimo',
    description: 'Cumplimiento total para la destrucción de medicamentos con implicaciones fiscales.',
    includes: null,
    mainBenefits: [
        { text: 'Todo lo de "Medicamentos controlados"', included: true },
        { text: 'Acta fiscal de destrucción', included: true },
        { text: 'Aviso/documentación para SAT', included: true },
        { text: 'Supervisión de autoridad sanitaria/fiscal si aplica', included: true },
    ],
};

const PlansPage = () => {
  const { toast } = useToast();
  const { profile, loading: authLoading } = useAuth();
  const [planStats, setPlanStats] = useState({
    hasPlan: false,
    usage: 0,
    limit: 0,
    percentage: 0,
    planName: 'Sin plan asignado',
    remainingWeight: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    nextCollection: null,
    isOverLimit: false
  });
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas del plan
  useEffect(() => {
    const loadPlanStats = async () => {
      if (!profile?.id) return;
      
      try {
        setLoading(true);
        const stats = await getPlanStats(profile.id);
        setPlanStats(stats);
        
        // Cargar planes RPBI disponibles
        const plans = await getAvailablePlans('RPBI');
        setAvailablePlans(plans);
      } catch (error) {
        console.error('Error loading plan stats:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas del plan.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (profile?.id) {
    loadPlanStats();
    }
  }, [profile?.id, toast]);

  const handlePlanSelection = async (planName) => {
    if (!profile?.id) return;

    try {
      const success = await assignPlanToUser(profile.id, planName, 'annual');
      if (success) {
        toast({
          title: "¡Plan actualizado!",
          description: `Tu plan ha sido cambiado a ${planName}`,
          variant: "default",
        });
        // Recargar estadísticas
        const stats = await getPlanStats(profile.id);
        setPlanStats(stats);
      } else {
        toast({
          title: "Error",
          description: "No se pudo cambiar el plan. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      toast({
        title: "Error", 
        description: "No se pudo cambiar el plan. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-50 p-8 rounded-xl border border-red-100 mb-12"
        >
              <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Plan Actual: {planStats.hasPlan ? planStats.planName : 'Sin plan asignado'}
              </h1>
              <p className="text-center text-gray-600 mb-2">
            {planStats.hasPlan && planStats.annualPrice > 0 
              ? `$${planStats.annualPrice.toLocaleString()} MXN/año` 
              : 'Sin precio asignado'
            }
              </p>
              <div className="flex flex-col md:flex-row items-center justify-around gap-8 mt-8">
            {loading ? (
              <div className="flex items-center justify-center w-48 h-48">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : (
                <CircularProgress 
                  percentage={planStats.percentage} 
                  usage={planStats.usage}
                  limit={planStats.limit}
                />
            )}
                <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Consumo del mes</h3>
                  <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-gray-700">
                    {planStats.hasPlan 
                      ? `Has consumido ${planStats.usage}kg de tu plan de ${planStats.limit}kg.`
                      : 'No tienes un plan activo asignado.'
                    }
                  </span>
                </li>
                {planStats.remainingWeight > 0 && (
                  <li className="flex items-center gap-3">
                    <span className="text-gray-700">
                      Te quedan {planStats.remainingWeight}kg disponibles este mes.
                    </span>
                        </li>
                )}
                      {planStats.isOverLimit && (
                  <li className="flex items-center gap-3">
                    <span className="text-red-600 font-semibold">
                      ⚠️ Has excedido el límite de tu plan.
                    </span>
                  </li>
                )}
              </ul>
                </div>
              </div>
        </motion.div>

        <Tabs defaultValue="rpbi" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="rpbi">RPBI</TabsTrigger>
            <TabsTrigger value="rp">RP</TabsTrigger>
            <TabsTrigger value="rme">RME</TabsTrigger>
            <TabsTrigger value="fiscal">DESTRUCCIÓN FISCAL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rpbi">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : (
                availablePlans.length > 0 ? (
                  availablePlans.map((plan, index) => (
                    <StyledPlanCard 
                      key={plan.id || index} 
                      plan={{
                        title: plan.name,
                        priceDisplay: `$${plan.annual_price.toLocaleString()}`,
                        priceUnit: 'MXN/año',
                        priceSubtext: `$${plan.monthly_price.toLocaleString()}/mes (anual)`,
                        description: plan.description,
                        includes: [
                          `${plan.included_weight_kg || plan.monthly_limit || 0} kg mensuales (${(plan.included_weight_kg || plan.monthly_limit || 0) * 12} kg/año)`,
                          'Recolección mensual incluida',
                          'Insumos gratuitos según necesidades',
                          'Certificados oficiales de disposición final',
                          'Acceso a Plataforma MIR',
                          'Línea de atención al cliente',
                        ],
                        mainBenefits: [
                          { text: `Plan ${plan.plan_category}`, included: true },
                          { text: 'Cumplimiento normativo garantizado', included: true },
                          { text: 'Precio por kg extra: $' + plan.extra_kg_price, included: true },
                          { text: 'Sin preocupaciones por trámites', included: true },
                        ],
                        isFeatured: index === 0
                      }} 
                      isFeatured={index === 0} 
                      onActionClick={() => handlePlanSelection(plan.name)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No hay planes disponibles</p>
                  </div>
                )
              )}
            </div>
          </TabsContent>

          <TabsContent value="rp">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Planes de Medicamentos (RP)</h2>
            <p className="text-center text-gray-600 mb-8">Gestión segura para farmacias, distribuidores y laboratorios.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {rpMedicinePlans.map((plan, index) => (
                <StyledPlanCard key={index} plan={plan} onActionClick={handleNotImplemented} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rme">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Grasas y Aceites Vegetales (RME)</h2>
            <p className="text-center text-gray-600 mb-8">Soluciones para la industria alimentaria y restaurantera.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {oilPlans.map((plan, index) => (
                <StyledPlanCard 
                key={index}
                  plan={plan} 
                  isFeatured={plan.isFeatured} 
                  onActionClick={handleNotImplemented} 
                />
            ))}
          </div>
          </TabsContent>

          <TabsContent value="fiscal">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Destrucción Fiscal</h2>
            <p className="text-center text-gray-600 mb-8">Cumplimiento y seguridad para la destrucción de medicamentos con implicaciones fiscales.</p>
            <div className="max-w-2xl mx-auto">
              <StyledPlanCard plan={fiscalDestructionPlan} onActionClick={handleNotImplemented} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PlansPage;