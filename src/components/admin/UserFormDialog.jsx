import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserForm } from './UserForm';

export const UserFormDialog = ({ isOpen, setIsOpen, user, onSuccess, defaultRole }) => {
  const isEditing = !!user;
  const title = isEditing ? 'Editar Usuario' : `Crear Nuevo ${defaultRole === 'user' ? 'Cliente' : 'Operador'}`;
  const description = isEditing
    ? `Modifica los detalles para ${user.full_name || user.email}.`
    : `Completa el formulario para añadir un nuevo ${defaultRole === 'user' ? 'cliente' : 'operador'} al sistema.`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <UserForm 
            user={user} 
            onSuccess={onSuccess}
            defaultRole={defaultRole}
        />
      </DialogContent>
    </Dialog>
  );
};
