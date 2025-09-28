import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient';
import { Loader2, Package } from 'lucide-react';

const PlanAssignmentDialog = ({ isOpen, onClose, userId, userName, onPlanAssigned }) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar planes',
        description: 'No se pudieron cargar los planes disponibles',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlan = async () => {
    if (!selectedPlan) {
      toast({
        variant: 'destructive',
        title: 'Selecciona un plan',
        description: 'Debes seleccionar un plan para asignar',
      });
      return;
    }

    try {
      setAssigning(true);

      // Primero, desactivar TODOS los planes actuales del usuario (no solo ACTIVE)
      const { error: deactivateError } = await supabase
        .from('plans')
        .update({ status: 'INACTIVE' })
        .eq('customer_id', userId);

      if (deactivateError) {
        console.error('Error deactivating existing plans:', deactivateError);
        throw deactivateError;
      }

      // Crear el nuevo plan
      const { error: insertError } = await supabase
        .from('plans')
        .insert({
          customer_id: userId,
          name: selectedPlan,
          status: 'ACTIVE',
          start_date: new Date().toISOString(),
          frequency: 'MONTHLY'
        });

      if (insertError) {
        console.error('Error inserting new plan:', insertError);
        throw insertError;
      }

      toast({
        title: 'Plan asignado exitosamente',
        description: `Se ha asignado el ${selectedPlan} a ${userName}`,
      });

      onPlanAssigned();
    } catch (error) {
      console.error('Error assigning plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error al asignar plan',
        description: `No se pudo asignar el plan. Error: ${error.message}`,
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedPlan('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Asignar Plan a {userName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Cargando planes...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Selecciona un plan para asignar a este usuario:
              </p>
              
              <div className="space-y-2">
                {plans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlan === plan.name
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.name}
                      checked={selectedPlan === plan.name}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{plan.name}</div>
                      <div className="text-sm text-gray-500">{plan.description}</div>
                      <div className="text-sm text-gray-600">
                        ${plan.monthly_price} / mes • {plan.included_weight_kg} kg incluidos
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={assigning}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAssignPlan}
              disabled={!selectedPlan || assigning}
              className="bg-red-600 hover:bg-red-700"
            >
              {assigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Asignando...
                </>
              ) : (
                'Asignar Plan'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanAssignmentDialog;
