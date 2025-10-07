import supabase from '@/lib/customSupabaseClient.js';

// Función para calcular el uso del plan de un usuario
export const calculatePlanUsage = async (profileId) => {
  try {
    // Obtener el plan activo del usuario
    const { data: userPlanData, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('customer_id', profileId)
      .eq('status', 'ACTIVE')
      .order('start_date', { ascending: false })
      .limit(1);

    if (planError || !userPlanData || userPlanData.length === 0) {
      return {
        hasPlan: false,
        usage: 0,
        limit: 0,
        percentage: 0,
        planName: 'Sin plan asignado'
      };
    }

    const userPlan = userPlanData[0];
    
    // Obtener detalles del plan desde subscription_plans usando el nombre
    const { data: planDetailsData, error: planDetailsError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', userPlan.name)
      .eq('is_active', true)
      .single();

    if (planDetailsError || !planDetailsData) {
      console.error('Error fetching plan details:', planDetailsError);
      return {
        hasPlan: true,
        usage: 0,
        limit: 100, // Default limit
        percentage: 0,
        planName: userPlan.name,
        monthlyPrice: 0,
        annualPrice: 0,
        error: 'Plan details not found'
      };
    }

    const planDetails = planDetailsData;

    // Calcular período actual (módulo mensual basado en el inicio del plan)
    const startDate = new Date(userPlan.start_date);
    const now = new Date();
    
    // Calcular cuántos ciclos mensuales han pasado desde el inicio
    const monthsPassed = Math.floor((now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()));
    const cycleStart = new Date(startDate);
    cycleStart.setMonth(startDate.getMonth() + monthsPassed);
    
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setMonth(cycleStart.getMonth() + 1);

    // Obtener las órdenes completadas del ciclo actual
    const { data: serviceOrders, error: ordersError } = await supabase
      .from('service_orders')
      .select('quantity, unit, status, created_at')
      .eq('customer_id', profileId)
      .gte('created_at', cycleStart.toISOString())
      .lt('created_at', cycleEnd.toISOString())
      .in('status', ['COMPLETED', 'TREATED', 'CERTIFIED']);

    if (ordersError) {
      console.error('Error fetching service orders:', ordersError);
      return {
        hasPlan: true,
        usage: 0,
        limit: planDetails.included_weight_kg,
        percentage: 0,
        planName: userPlan.name,
        monthlyPrice: planDetails.monthly_price,
        annualPrice: planDetails.annual_price,
        error: ordersError.message
      };
    }

    // Calcular el peso total usado en el ciclo actual
    const totalWeight = (serviceOrders || []).reduce((sum, order) => {
      const weight = parseFloat(order.quantity) || 0;
      // Convertir a kg si es necesario (asumiendo que las unidades pueden variar)
      const weightInKg = order.unit === 'kg' ? weight : weight / 1000;
      return sum + weightInKg;
    }, 0);

    const planLimit = parseFloat(planDetails.included_weight_kg) || 0;
    const percentage = planLimit > 0 ? Math.round((totalWeight / planLimit) * 100) : 0;

    return {
      hasPlan: true,
      usage: Math.round(totalWeight * 100) / 100,
      limit: planLimit,
      percentage: percentage,
      planName: planDetails.name || userPlan.name,
      monthlyPrice: parseFloat(planDetails.monthly_price) || 0,
      annualPrice: parseFloat(planDetails.annual_price) || 0,
      cycleStart: cycleStart.toISOString(),
      cycleEnd: cycleEnd.toISOString(),
      ordersCount: serviceOrders?.length || 0,
      planCategory: planDetails.plan_category
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
export const getPlanStats = async (profileId) => {
  try {
    const planUsage = await calculatePlanUsage(profileId);
    
    if (!planUsage.hasPlan) {
      return {
        ...planUsage,
        nextCollection: null,
        averageUsage: 0,
        remainingWeight: 0,
        isOverLimit: false,
        isOverDiscount: false
      };
    }

    // Obtener la próxima recolección programada
    const { data: nextOrderData, error: nextOrderError } = await supabase
      .from('service_orders')
      .select('scheduled_date, notes, status')
      .eq('customer_id', profileId)
      .eq('status', 'SCHEDULED')
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .limit(1);

    let nextCollection = null;
    if (!nextOrderError && nextOrderData && nextOrderData.length > 0) {
      nextCollection = {
        date: new Date(nextOrderData[0].scheduled_date),
        notes: nextOrderData[0].notes
      };
    }

    // Calcular el peso restante
    const remainingWeight = Math.max(0, planUsage.limit - planUsage.usage);
    const isOverLimit = planUsage.usage > planUsage.limit;
    const isOverDiscount = planUsage.percentage >= 80;

    return {
      ...planUsage,
      nextCollection,
      remainingWeight: Math.round(remainingWeight * 100) / 100,
      isOverLimit,
      isOverDiscount
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

// Función para obtener todos los planes disponibles
export const getAvailablePlans = async (type = 'RPBI') => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .eq('plan_type', type)
      .order('monthly_price', { ascending: true });

    if (error) {
      console.error('Error fetching available plans:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAvailablePlans:', error);
    return [];
  }
};

// Función para asignar/cambiar plan del usuario
export const assignPlanToUser = async (profileId, planName, assignmentType = 'annual') => {
  try {
    // Desactivar plan actual
    const { error: deactivateError } = await supabase
      .from('plans')
      .update({ status: 'INACTIVE', updated_at: new Date().toISOString() })
      .eq('customer_id', profileId)
      .eq('status', 'ACTIVE');

    if (deactivateError) {
      console.error('Error deactivating current plan:', deactivateError);
    }

    // Obtener detalles del plan desde subscription_plans
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .eq('is_active', true)
      .single();

    if (planError || !planData) {
      console.error('Error fetching plan details:', planError);
      return false;
    }

    // Crear nueva asignación de plan
    const { error: assignError } = await supabase
      .from('plans')
      .insert({
        customer_id: profileId,
        name: planData.name,
        description: planData.description,
        frequency: assignmentType,
        start_date: new Date().toISOString(),
        status: 'ACTIVE'
      });

    if (assignError) {
      console.error('Error assigning new plan:', assignError);
      throw assignError;
    }

    return true;
  } catch (error) {
    console.error('Error in assignPlanToUser:', error);
    return false;
  }
};
