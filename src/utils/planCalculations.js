import supabase from '@/lib/customSupabaseClient.js';

// Función para calcular el uso del plan de un usuario
export const calculatePlanUsage = async (userId) => {
  try {
    // Obtener el plan activo del usuario
    const { data: userPlan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('customer_id', userId)
      .eq('status', 'ACTIVE')
      .order('start_date', { ascending: false })
      .limit(1)
      .single();

    if (planError || !userPlan) {
      return {
        hasPlan: false,
        usage: 0,
        limit: 0,
        percentage: 0,
        planName: 'Sin plan asignado'
      };
    }

    // Calcular el período del ciclo actual
    const startDate = new Date(userPlan.start_date);
    const now = new Date();
    
    // Calcular cuántos ciclos han pasado desde el inicio
    const monthsPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 30));
    const cycleStart = new Date(startDate);
    cycleStart.setMonth(startDate.getMonth() + monthsPassed);
    
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setMonth(cycleStart.getMonth() + 1);

    // Obtener las solicitudes de recolección del ciclo actual
    const { data: serviceOrders, error: ordersError } = await supabase
      .from('service_orders')
      .select('quantity, unit, status')
      .eq('customer_id', userId)
      .gte('created_at', cycleStart.toISOString())
      .lt('created_at', cycleEnd.toISOString())
      .in('status', ['COLLECTED', 'TREATED', 'CERTIFIED']);

    if (ordersError) {
      console.error('Error fetching service orders:', ordersError);
      return {
        hasPlan: true,
        usage: 0,
        limit: 0,
        percentage: 0,
        planName: userPlan.name,
        error: ordersError.message
      };
    }

    // Calcular el peso total recolectado en el ciclo actual
    const totalWeight = serviceOrders.reduce((sum, order) => {
      const weight = parseFloat(order.quantity) || 0;
      // Convertir a kg si es necesario
      const weightInKg = order.unit === 'kg' ? weight : weight / 1000;
      return sum + weightInKg;
    }, 0);

    // Obtener el límite del plan desde subscription_plans
    const { data: subscriptionPlan, error: subError } = await supabase
      .from('subscription_plans')
      .select('included_weight_kg, monthly_price')
      .eq('name', userPlan.name)
      .single();

    const planLimit = subscriptionPlan?.included_weight_kg || 100; // Default 100kg
    const monthlyPrice = subscriptionPlan?.monthly_price || 3200; // Default $3200
    const percentage = Math.min((totalWeight / planLimit) * 100, 100);

    return {
      hasPlan: true,
      usage: Math.round(totalWeight * 100) / 100, // Redondear a 2 decimales
      limit: planLimit,
      percentage: Math.round(percentage * 100) / 100, // Redondear a 2 decimales
      planName: userPlan.name,
      monthlyPrice: monthlyPrice,
      cycleStart: cycleStart.toISOString(),
      cycleEnd: cycleEnd.toISOString(),
      ordersCount: serviceOrders.length
    };

  } catch (error) {
    console.error('Error calculating plan usage:', error);
    return {
      hasPlan: false,
      usage: 0,
      limit: 0,
      percentage: 0,
      planName: 'Error al calcular',
      error: error.message
    };
  }
};

// Función para obtener estadísticas del plan
export const getPlanStats = async (userId) => {
  try {
    const planUsage = await calculatePlanUsage(userId);
    
    if (!planUsage.hasPlan) {
      return {
        ...planUsage,
        nextCollection: null,
        averageUsage: 0,
        remainingWeight: 0
      };
    }

    // Obtener la próxima recolección programada (simplificado)
    const nextOrder = null;

    // Calcular el peso restante
    const remainingWeight = Math.max(0, planUsage.limit - planUsage.usage);

    return {
      ...planUsage,
      nextCollection: nextOrder ? {
        date: nextOrder.created_at,
        type: nextOrder.residue_type
      } : null,
      remainingWeight: Math.round(remainingWeight * 100) / 100,
      isOverLimit: planUsage.usage > planUsage.limit
    };

  } catch (error) {
    console.error('Error getting plan stats:', error);
    return {
      hasPlan: false,
      usage: 0,
      limit: 0,
      percentage: 0,
      planName: 'Error al obtener estadísticas',
      error: error.message
    };
  }
};
