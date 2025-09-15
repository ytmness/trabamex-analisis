import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient.js';

const SuppliesRequestPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requestedItems, setRequestedItems] = useState([
    { supply: '', size: '', quantity: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSupplies = [
    { name: 'Bolsas Rojas', sizes: ['Chica (5L)', 'Mediana (20L)', 'Grande (50L)'] },
    { name: 'Bolsas Amarillas', sizes: ['Chica (5L)', 'Mediana (20L)', 'Grande (50L)'] },
    { name: 'Contenedores Rojos PC', sizes: ['1L', '2.5L', '5L'] },
    { name: 'Contenedores Amarillos PL', sizes: ['1L', '2.5L', '5L'] },
    { name: 'Barriles de Metal', sizes: ['50L', '100L', '200L'] },
    { name: 'Barriles de Plástico', sizes: ['50L', '100L', '200L'] },
  ];

  // Validar que el usuario esté autenticado
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder a esta página.</p>
          <button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate(`/mir/user`);
  };

  const handleAddItem = () => {
    setRequestedItems([...requestedItems, { supply: '', size: '', quantity: '' }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = requestedItems.filter((_, i) => i !== index);
    setRequestedItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...requestedItems];
    newItems[index][field] = value;
    if (field === 'supply') {
        newItems[index].size = '';
    }
    setRequestedItems(newItems);
  };

  const validateForm = () => {
    // Validar que al menos un item tenga todos los campos completos
    const hasValidItem = requestedItems.some(item => 
      item.supply && item.size && item.quantity && parseInt(item.quantity) > 0
    );
    
    if (!hasValidItem) {
      alert('Debes completar al menos un insumo con todos sus campos.');
      return false;
    }

    // Validar que no haya items incompletos
    const hasIncompleteItem = requestedItems.some(item => 
      (item.supply || item.size || item.quantity) && 
      (!item.supply || !item.size || !item.quantity || parseInt(item.quantity) <= 0)
    );

    if (hasIncompleteItem) {
      alert('Todos los campos de cada insumo deben estar completos.');
      return false;
    }

    return true;
  };

  const getSizesForSupply = (supplyName) => {
    const supply = availableSupplies.find(s => s.name === supplyName);
    return supply ? supply.sizes : [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Filtrar solo los items válidos
      const validItems = requestedItems.filter(item => 
        item.supply && item.size && item.quantity && parseInt(item.quantity) > 0
      );

      // Crear la solicitud principal
      const { data: requestData, error: requestError } = await supabase
        .from('supplies_requests')
        .insert({
          user_id: user.id,
          client_id: user.client_id || null,
          operator_id: null, // Sin asignar inicialmente
          status: 'pending',
          notes: notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (requestError) {
        throw new Error(`Error al crear la solicitud: ${requestError.message}`);
      }

      // Crear los items de la solicitud
      const requestItems = validItems.map(item => ({
        request_id: requestData.id,
        item_name: item.supply, // Mapear supply_name a item_name (NOT NULL)
        supply_name: item.supply,
        size: item.size,
        quantity: parseInt(item.quantity),
        created_at: new Date().toISOString()
      }));

      const { error: itemsError } = await supabase
        .from('supplies_request_items')
        .insert(requestItems);

      if (itemsError) {
        throw new Error(`Error al guardar los items: ${itemsError.message}`);
      }

      // Crear un registro de actividad
      const { error: activityError } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'supplies_request',
          description: `Solicitud de insumos creada con ID: ${requestData.id}`,
          metadata: {
            request_id: requestData.id,
            items_count: validItems.length,
            total_items: validItems.reduce((sum, item) => sum + parseInt(item.quantity), 0)
          },
          created_at: new Date().toISOString()
        });

      if (activityError) {
        console.warn('Error al crear registro de actividad (no crítico):', activityError);
      }

      alert(`✅ Solicitud enviada exitosamente! ID: ${requestData.id}`);

      // Limpiar el formulario
      setRequestedItems([{ supply: '', size: '', quantity: '' }]);
      setNotes('');
      
      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        navigate(`/mir/user`);
      }, 2000);

    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      alert(`❌ Error al enviar la solicitud: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button 
          onClick={handleBack}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          disabled={isSubmitting}
        >
          ← Volver al Dashboard
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Solicitud de Insumos</h1>
        <p className="text-lg text-gray-500 mt-1">Pide los materiales que necesitas para la gestión de tus residuos.</p>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-red-600">📦</span>
            <h2 className="text-xl font-bold text-gray-800">Detalles de la Solicitud</h2>
          </div>
          
          <div className="space-y-6">
            {requestedItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-8 gap-4 items-end p-4 border rounded-lg bg-gray-50">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insumo</label>
                  <select 
                    value={item.supply} 
                    onChange={(e) => handleItemChange(index, 'supply', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selecciona un insumo</option>
                    {availableSupplies.map(supply => (
                      <option key={supply.name} value={supply.name}>{supply.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño/Capacidad</label>
                  <select 
                    value={item.size} 
                    onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                    disabled={!item.supply || isSubmitting}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selecciona</option>
                    {getSizesForSupply(item.supply).map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                  <input 
                    type="number" 
                    placeholder="Ej. 10" 
                    value={item.quantity} 
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    disabled={isSubmitting}
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="md:col-span-1 flex justify-center">
                  {requestedItems.length > 1 && !isSubmitting && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveItem(index)}
                      className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button 
              type="button" 
              onClick={handleAddItem} 
              disabled={isSubmitting}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              ➕ Añadir otro insumo
            </button>
          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas Adicionales</label>
            <textarea 
              placeholder="Cualquier indicación especial para tu solicitud..." 
              rows={4} 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex justify-end mt-8">
            <button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud de Insumos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuppliesRequestPage;
