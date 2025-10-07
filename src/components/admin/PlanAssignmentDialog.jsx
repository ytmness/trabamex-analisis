import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient';
import { Loader2, Package } from 'lucide-react';

const PlanAssignmentDialog = ({ isOpen, onClose, userId, userName, onPlanAssigned }) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedPlanType, setSelectedPlanType] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Resetear estado cuando se abre el dialog
      setSelectedPlanType('');
      setSelectedPlan('');
      setShowPlanSelection(false);
    }
  }, [isOpen]);

  const fetchPlans = async (planType) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .eq('plan_type', planType)
        .order('monthly_price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
      setShowPlanSelection(true);
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

  const handlePlanTypeSelection = async (planType) => {
    setSelectedPlanType(planType);
    await fetchPlans(planType);
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

      // Usar la función RPC para asignar adicional plan (sin desactivar otros)
      const { data: result, error: assignError } = await supabase.rpc('assign_additional_plan_to_user', {
        user_uuid: userId,
        plan_name: selectedPlan
      });

      if (assignError) {
        console.error('Error assigning additional plan:', assignError);
        throw assignError;
      }

      if (!result) {
        toast({
          variant: 'destructive',
          title: 'Error al asignar plan',
          description: 'El plan ya está asignado al usuario o no está disponible',
        });
        return;
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
    setSelectedPlanType('');
    setShowPlanSelection(false);
    onClose();
  };

  const handleBackToTypeSelection = () => {
    setSelectedPlan('');
    setSelectedPlanType('');
    setShowPlanSelection(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Asignar Plan a {userName}
          </DialogTitle>
          <DialogDescription>
            Selecciona el tipo de plan que deseas asignar a este usuario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center px-4 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Cargando planes...</span>
            </div>
          ) : !showPlanSelection ? (
            // Paso 1: Seleccionar tipo de plan
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Selecciona el tipo de plan:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePlanTypeSelection('RPBI')}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
                  >
                    <span className="text-xl">🏥</span>
                    <div>
                      <div className="font-medium text-sm">RPBI</div>
                      <div className="text-xs text-gray-500">Biológico-Infecciosos</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handlePlanTypeSelection('RP')}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
                  >
                    <span className="text-xl">⚗️</span>
                    <div>
                        <div className="font-medium text-sm">RP</div>
                        <div className="text-xs text-gray-500">Peligrosos</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handlePlanTypeSelection('RME')}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
                  >
                    <span className="text-xl">🌱</span>
                    <div>
                        <div className="font-medium text-sm">RME</div>
                        <div className="text-xs text-gray-500">Manejo Especial</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handlePlanTypeSelection('FISCAL')}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
                  >
                    <span className="text-xl">🔒</span>
                    <div>
                        <div className="font-medium text-sm">FISCAL</div>
                        <div className="text-xs text-gray-500">Destrucción Fiscal</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Paso 2: Seleccionar plan específico
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <button
                  onClick={handleBackToTypeSelection}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <span>←</span>
                  <span className="text-sm">Volver</span>
                </button>
                <span className="text-lg">
                  {selectedPlanType === 'RPBI' && '🏥'}
                  {selectedPlanType === 'RP' && '⚗️'}
                  {selectedPlanType === 'RME' && '🌱'}
                  {selectedPlanType === 'FISCAL' && '🔒'}
                </span>
                <p className="text-sm text-gray-600">
                  Planes disponibles para <strong>{selectedPlanType}</strong>:
                </p>
              </div>
              
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
              disabled={!selectedPlan || assigning || !showPlanSelection}
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
