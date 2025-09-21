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
      // Crear nuevo usuario usando Edge Function
      try {
        console.log('🔍 Invitando usuario:', { fullName, email, phone, role });
        
        // Obtener el ID del admin actual
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          toast({
            variant: 'destructive',
            title: 'Error de autenticación',
            description: 'No se pudo obtener la información del administrador actual.',
          });
          setLoading(false);
          return;
        }

        // Llamar a la Edge Function para crear usuario
        const { data, error } = await supabase.functions.invoke('invite-user', {
          body: {
            email: email,
            full_name: fullName,
            password: password,
            role: role,
            phone: phone || null,
            company_name: null,
            admin_user_id: currentUser.id
          }
        });

        console.log('🔍 Edge Function Response:', { data, error });

        if (error) {
          console.error('❌ Error invitando usuario:', error);
          toast({
            variant: 'destructive',
            title: 'Error al invitar usuario',
            description: error.message,
          });
        } else {
          console.log('✅ Usuario invitado:', data);
          toast({
            title: 'Usuario creado exitosamente',
            description: `Usuario ${email} creado. Se ha enviado un email de verificación. El usuario debe confirmar su email antes de poder iniciar sesión.`,
          });
          
          onSuccess({
            id: data.user_id,
            full_name: fullName,
            email: email,
            phone: phone,
            role: role
          });
        }
      } catch (error) {
        console.error('❌ Error inesperado:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Error inesperado al invitar usuario',
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
