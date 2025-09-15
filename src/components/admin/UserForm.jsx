import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import supabase from '../../lib/customSupabaseClient.js';
import { Loader2 } from 'lucide-react';

export const UserForm = ({ user, onSuccess, defaultRole }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(defaultRole || 'user');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!user;

  useEffect(() => {
    if (isEditing) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || defaultRole);
    }
  }, [user, isEditing, defaultRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isEditing) {
      // Update existing user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone })
        .eq('id', user.id)
        .select()
        .single();
      
      let roleError = null;
      if (role !== user.role) {
         const { error } = await supabase.rpc('set_user_role', {
            uid: user.id,
            new_role: role
         });
         roleError = error;
      }

      if (profileError || roleError) {
        toast({
          variant: 'destructive',
          title: 'Error al actualizar',
          description: profileError?.message || roleError?.message,
        });
      } else {
        toast({ title: 'Éxito', description: 'Usuario actualizado correctamente.' });
        onSuccess(profileData);
      }
    } else {
      // Create new user profile (manual process)
      try {
        // Usar función RPC para crear usuario automáticamente
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_user_profile', {
          p_full_name: fullName,
          p_email: email,
          p_phone: phone,
          p_role: role
        });

        console.log('🔍 RPC Response:', { rpcData, rpcError });
        console.log('🔍 RPC Data Details:', JSON.stringify(rpcData, null, 2));

        if (!rpcError && rpcData && rpcData.success) {
          // Función RPC funcionó correctamente
          if (rpcData.user_id) {
            // Usuario realmente creado
            toast({ 
              title: 'Éxito', 
              description: 'Usuario creado correctamente.' 
            });
            onSuccess({
              id: rpcData.user_id,
              full_name: fullName,
              email: email,
              phone: phone,
              role: role
            });
          } else {
            // Solo validación exitosa, mostrar instrucciones
            const instructions = `✅ VALIDACIÓN EXITOSA

📋 INFORMACIÓN DEL USUARIO:
• Nombre: ${fullName}
• Email: ${email}
• Teléfono: ${phone}
• Rol: ${role === 'user' ? 'Cliente' : role === 'operator' ? 'Operador' : 'Administrador'}

⚠️ PASO FINAL REQUERIDO:
Para completar la creación, ve a tu Dashboard de Supabase:
1. Authentication → Users → Add User
2. Email: ${email}
3. Password: [GENERA_UNA_CONTRASEÑA_TEMPORAL]
4. Marca "Auto-confirm email"
5. Crea el usuario

🔐 CREDENCIALES PARA ENVIAR AL USUARIO:
Email: ${email}
Password: [LA_CONTRASEÑA_QUE_GENERASTE]
URL de login: ${window.location.origin}/login

✅ Los datos han sido validados. Solo falta crear el usuario en Auth.`;

            // Copiar al portapapeles
            try {
              await navigator.clipboard.writeText(instructions);
              toast({
                title: 'Validación exitosa',
                description: 'Las instrucciones se han copiado al portapapeles.',
              });
            } catch (clipboardError) {
              console.log('No se pudo copiar al portapapeles');
              toast({
                title: 'Validación exitosa',
                description: 'Revisa la consola para ver las instrucciones completas.',
              });
            }

            // Mostrar alert con instrucciones
            alert(instructions);

            // Simular éxito para cerrar el modal
            onSuccess({
              full_name: fullName,
              email: email,
              phone: phone,
              role: role
            });
          }
        } else {
          // Función RPC no existe o falló, mostrar instrucciones manuales
          const instructions = `🎉 PREPARACIÓN PARA CREAR USUARIO

📋 INFORMACIÓN DEL USUARIO:
• Nombre: ${fullName}
• Email: ${email}
• Teléfono: ${phone}
• Rol: ${role === 'user' ? 'Cliente' : role === 'operator' ? 'Operador' : 'Administrador'}

⚠️ PASOS REQUERIDOS:
1️⃣ Ve a tu Dashboard de Supabase:
   https://supabase.com/dashboard/project/[TU-PROJECT-ID]

2️⃣ Authentication → Users → Add User:
   • Email: ${email}
   • Password: [GENERA_UNA_CONTRASEÑA_TEMPORAL]
   • Marca "Auto-confirm email"
   • Crea el usuario

3️⃣ Una vez creado el usuario, regresa aquí y usa el botón "Actualizar" para sincronizar los datos.

🔐 CREDENCIALES PARA ENVIAR AL USUARIO:
Email: ${email}
Password: [LA_CONTRASEÑA_QUE_GENERASTE]
URL de login: ${window.location.origin}/login

✅ Después de crear el usuario en Auth, el perfil se sincronizará automáticamente.`;

          // Copiar al portapapeles
          try {
            await navigator.clipboard.writeText(instructions);
            toast({
              title: 'Instrucciones preparadas',
              description: 'Las instrucciones se han copiado al portapapeles.',
            });
          } catch (clipboardError) {
            console.log('No se pudo copiar al portapapeles');
            toast({
              title: 'Instrucciones preparadas',
              description: 'Revisa la consola para ver las instrucciones completas.',
            });
          }

          // Mostrar alert con instrucciones
          alert(instructions);

          // Simular éxito para cerrar el modal
          onSuccess({
            full_name: fullName,
            email: email,
            phone: phone,
            role: role
          });
        }
      } catch (error) {
        console.error('Error preparing user creation:', error);
        toast({
          variant: 'destructive',
          title: 'Error al preparar creación de usuario',
          description: error.message || 'Error desconocido',
        });
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre Completo</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isEditing} />
      </div>
      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Cliente</SelectItem>
            <SelectItem value="operator">Operador</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
      </Button>
    </form>
  );
};
