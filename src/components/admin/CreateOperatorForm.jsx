import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Save, X, Truck } from 'lucide-react';
import { AdminButton } from '@/components/ui/admin-button';
import supabase from '../../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';

const CreateOperatorForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    address: '',
    licenseNumber: '',
    vehicleType: 'camioneta'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const vehicleTypes = [
    { value: 'camioneta', label: 'Camioneta' },
    { value: 'camion', label: 'Camión' },
    { value: 'pickup', label: 'Pickup' },
    { value: 'moto', label: 'Motocicleta' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';

    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.fullName) newErrors.fullName = 'El nombre completo es requerido';
    if (!formData.phone) newErrors.phone = 'El teléfono es requerido';
    if (!formData.address) newErrors.address = 'La dirección es requerida';
    if (!formData.licenseNumber) newErrors.licenseNumber = 'El número de licencia es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Llamar a la función RPC para crear el perfil del operador
      const { data, error } = await supabase.rpc('create_operator_profile', {
        p_email: formData.email,
        p_full_name: formData.fullName,
        p_phone: formData.phone,
        p_address: formData.address,
        p_license_number: formData.licenseNumber,
        p_vehicle_type: formData.vehicleType
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.success) {
        // Operador creado exitosamente
        toast({
          title: '✅ Operador creado exitosamente',
          description: `Perfil creado para ${formData.fullName}. Ahora crea el usuario en Supabase Auth.`,
        });

        // Mostrar instrucciones para crear el usuario
        const successMessage = `🎉 PERFIL DE OPERADOR CREADO EXITOSAMENTE!

📋 INFORMACIÓN DEL OPERADOR:
• Nombre: ${formData.fullName}
• Email: ${formData.email}
• Teléfono: ${formData.phone}
• Dirección: ${formData.address}
• Licencia: ${formData.licenseNumber}
• Vehículo: ${formData.vehicleType}

⚠️ PASO FINAL REQUERIDO:
Para completar la creación, ve a tu Dashboard de Supabase:
1. Authentication → Users → Add User
2. Email: ${formData.email}
3. Password: [GENERA_UNA_CONTRASEÑA_TEMPORAL]
4. Marca "Auto-confirm email"
5. Crea el usuario

🔐 CREDENCIALES PARA ENVIAR AL OPERADOR:
Email: ${formData.email}
Password: [LA_CONTRASEÑA_QUE_GENERASTE]
URL de login: ${window.location.origin}/login

✅ El perfil ya está configurado, solo falta crear el usuario en Auth.`;

        // Copiar al portapapeles
        try {
          await navigator.clipboard.writeText(successMessage);
          toast({
            title: 'Información copiada',
            description: 'Las instrucciones se han copiado al portapapeles.',
          });
        } catch (clipboardError) {
          console.log('No se pudo copiar al portapapeles');
        }

        onSuccess();
        onClose();
      } else {
        // Error en la función RPC
        if (data?.error?.includes('Usuario no encontrado')) {
          // Usuario no existe en Auth, mostrar instrucciones
          const instructions = `📋 USUARIO NO ENCONTRADO EN SUPABASE AUTH

Para completar la creación del operador, sigue estos pasos:

1️⃣ Ve a tu Dashboard de Supabase:
   https://supabase.com/dashboard/project/[TU-PROJECT-ID]

2️⃣ Authentication → Users → Add User:
   • Email: ${formData.email}
   • Password: [GENERA_UNA_CONTRASEÑA_TEMPORAL]
   • Marca "Auto-confirm email"

3️⃣ Una vez creado el usuario, regresa aquí y vuelve a intentar crear el operador.

✅ El formulario ya tiene toda la información guardada.`;

          alert(instructions);
          
          toast({
            title: 'Usuario no encontrado en Auth',
            description: 'Crea primero el usuario en Supabase Auth y luego vuelve a intentar.',
          });
        } else {
          throw new Error(data?.error || 'Error desconocido al crear operador');
        }
      }
      
    } catch (error) {
      console.error('Error creating operator:', error);
      
      // Si la función RPC no existe, mostrar instrucciones manuales
      if (error.message.includes('function') || error.message.includes('does not exist')) {
        const instructions = `📋 FUNCIÓN RPC NO ENCONTRADA

Para crear operadores automáticamente, necesitas ejecutar esta función SQL en tu base de datos:

${createOperatorFunctionSQL}

Una vez ejecutada, podrás crear operadores directamente desde el admin.

Por ahora, sigue las instrucciones manuales:
1. Ve a Supabase Dashboard → Authentication → Users → Add User
2. Crea el usuario con email: ${formData.email}
3. Ejecuta los comandos SQL manualmente`;

        alert(instructions);
        
        toast({
          title: 'Función RPC no encontrada',
          description: 'Se han mostrado las instrucciones para configurar la función automática.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al crear operador',
          description: error.message || 'Error desconocido',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Función SQL para mostrar al usuario
  const createOperatorFunctionSQL = `
-- Ejecuta esto en tu base de datos de Supabase:
CREATE OR REPLACE FUNCTION create_operator(
    p_email TEXT, p_password TEXT, p_full_name TEXT,
    p_phone TEXT, p_address TEXT, p_license_number TEXT, p_vehicle_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_result JSON;
BEGIN
    -- Verificar que el usuario actual sea admin
    IF NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Solo los administradores pueden crear operadores';
    END IF;

    -- Crear usuario en auth.users
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (p_email, crypt(p_password, gen_salt('bf')), NOW(), NOW(), NOW())
    RETURNING id INTO v_user_id;

    -- Insertar rol
    INSERT INTO user_roles (user_id, role, is_active) 
    VALUES (v_user_id, 'operator', true);

    -- Insertar operador
    INSERT INTO operators (user_id, full_name, email, phone, address, license_number, vehicle_type, is_active)
    VALUES (v_user_id, p_full_name, p_email, p_phone, p_address, p_license_number, p_vehicle_type, true);

    RETURN json_build_object('success', true, 'user_id', v_user_id, 'message', 'Operador creado exitosamente');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Conceder permisos
GRANT EXECUTE ON FUNCTION create_operator(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
`;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserPlus className="h-6 w-6" />
                             <h2 className="text-xl font-bold">Crear Operador</h2>
             </div>
             <button
               onClick={onClose}
               className="text-white/80 hover:text-white transition-colors"
             >
               <X className="h-5 w-5" />
             </button>
           </div>
           <p className="text-red-100 mt-2">Crear operador automáticamente desde el admin</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="operador@trabamex.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="h-4 w-4 inline mr-2" />
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="h-4 w-4 inline mr-2" />
              Confirmar Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Repite la contraseña"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Nombre Completo
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nombre y apellidos"
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Dirección
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="2"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Dirección completa"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          {/* License Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Número de Licencia
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Número de licencia de conducir"
            />
            {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Truck className="h-4 w-4 inline mr-2" />
              Tipo de Vehículo
            </label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {vehicleTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <AdminButton
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </AdminButton>
            <AdminButton
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
                             {loading ? (
                 <>
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                   Creando...
                 </>
               ) : (
                 <>
                   <Save className="h-4 w-4 mr-2" />
                   Crear Operador
                 </>
               )}
            </AdminButton>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateOperatorForm;
