import React, { useState, useEffect } from 'react';
import { X, User, Package, Calendar, CheckCircle } from 'lucide-react';
import supabase from '@/lib/customSupabaseClient.js';

const PlanAssignmentDialog = ({ isOpen, onClose, userId, userName }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      // Establecer fecha de inicio como hoy
      setStartDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan || !startDate) return;

    try {
      setIsSubmitting(true);
      
      // Buscar el plan seleccionado para obtener los detalles
      const plan = plans.find(p => p.id === selectedPlan);
      
      // Crear el plan asignado al usuario
      const { data, error } = await supabase
        .from('plans')
        .insert({
          customer_id: userId,
          name: plan.name,
          description: plan.description,
          frequency: 'MONTHLY', // Por defecto mensual
          start_date: startDate,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Crear registro de actividad
      await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: 'plan_assigned',
          description: `Plan "${plan.name}" asignado por admin`,
          metadata: {
            plan_id: data.id,
            plan_name: plan.name,
            monthly_price: plan.monthly_price,
            included_weight_kg: plan.included_weight_kg
          },
          created_at: new Date().toISOString()
        });

      alert(`✅ Plan "${plan.name}" asignado exitosamente a ${userName}`);
      onClose();
      
    } catch (error) {
      console.error('Error assigning plan:', error);
      alert(`❌ Error al asignar plan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Package className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Asignar Plan</h2>
              <p className="text-sm text-gray-600">Asignar plan a {userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Plan
            </label>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Cargando planes...</p>
              </div>
            ) : (
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Selecciona un plan</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.monthly_price}/mes - {plan.included_weight_kg}kg incluidos
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {selectedPlan && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Detalles del Plan</h3>
              {(() => {
                const plan = plans.find(p => p.id === selectedPlan);
                return plan ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio mensual:</span>
                      <span className="font-medium">${plan.monthly_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso incluido:</span>
                      <span className="font-medium">{plan.included_weight_kg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frecuencia:</span>
                      <span className="font-medium">{plan.pickup_frequency || 'Mensual'}</span>
                    </div>
                    {plan.description && (
                      <div className="mt-2">
                        <span className="text-gray-600">Descripción:</span>
                        <p className="text-gray-800 mt-1">{plan.description}</p>
                      </div>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedPlan || !startDate || isSubmitting}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Asignando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Asignar Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanAssignmentDialog;
