import React from 'react';
import { AdminCard, AdminCardHeader, AdminCardTitle, AdminCardDescription, AdminCardContent } from './ui/admin-card';
import { UserCard, UserCardHeader, UserCardTitle, UserCardDescription, UserCardContent } from './ui/user-card';
import { AdminButton } from './ui/admin-button';
import { UserButton } from './ui/user-button';

const ThemeDemo = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🎨 Demostración de Temas</h1>
        <p className="text-xl text-gray-600">Compara la diferencia entre el panel de Admin y Usuario</p>
      </div>

      {/* Tema Admin */}
      <div className="admin-theme p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">👨‍💼 Panel de Administrador</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdminCard className="admin-card">
            <AdminCardHeader>
              <AdminCardTitle className="text-white">Dashboard Operativo</AdminCardTitle>
              <AdminCardDescription className="text-gray-300">Control total del sistema</AdminCardDescription>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Órdenes Activas:</span>
                  <span className="text-white font-bold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Rutas en Proceso:</span>
                  <span className="text-white font-bold">8</span>
                </div>
                <AdminButton className="w-full">
                  Ver Detalles
                </AdminButton>
              </div>
            </AdminCardContent>
          </AdminCard>

          <AdminCard className="admin-card">
            <AdminCardHeader>
              <AdminCardTitle className="text-white">Acciones Rápidas</AdminCardTitle>
              <AdminCardDescription className="text-gray-300">Funciones administrativas</AdminCardDescription>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="grid grid-cols-2 gap-3">
                <AdminButton variant="outline" className="flex flex-col h-20 justify-center items-center gap-2">
                  <span>Nueva Orden</span>
                </AdminButton>
                <AdminButton variant="outline" className="flex flex-col h-20 justify-center items-center gap-2">
                  <span>Nueva Ruta</span>
                </AdminButton>
              </div>
            </AdminCardContent>
          </AdminCard>
        </div>
      </div>

      {/* Tema Usuario */}
      <div className="user-theme p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">👷 Panel de Usuario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserCard className="user-card">
            <UserCardHeader>
              <UserCardTitle>Mis Rutas</UserCardTitle>
              <UserCardDescription>Gestión de rutas diarias</UserCardDescription>
            </UserCardHeader>
            <UserCardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rutas Asignadas:</span>
                  <span className="text-gray-900 font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estado:</span>
                  <span className="text-green-600 font-bold">En Proceso</span>
                </div>
                <UserButton className="w-full">
                  Ver Detalles
                </UserButton>
              </div>
            </UserCardContent>
          </UserCard>

          <UserCard className="user-card">
            <UserCardHeader>
              <UserCardTitle>Actividad Reciente</UserCardTitle>
              <UserCardDescription>Últimas acciones realizadas</UserCardDescription>
            </UserCardHeader>
            <UserCardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Ruta completada</div>
                  <div className="text-xs">Hace 2 horas</div>
                </div>
                <UserButton variant="outline" className="w-full">
                  Ver Historial
                </UserButton>
              </div>
            </UserCardContent>
          </UserCard>
        </div>
      </div>

      {/* Comparación */}
      <div className="bg-gray-50 p-8 rounded-lg">
        <h3 className="text-2xl font-bold text-center mb-6">📊 Diferencias Clave</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">🎭 Tema Admin</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Fondo oscuro (negro/gris muy oscuro)</li>
              <li>• Texto blanco para contraste</li>
              <li>• Tarjetas con sombras profundas</li>
              <li>• Botones con colores invertidos</li>
              <li>• Colores más profesionales y serios</li>
              <li>• Ideal para uso prolongado en oficina</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">🌟 Tema Usuario</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Fondo claro (blanco/gris muy claro)</li>
              <li>• Texto oscuro para legibilidad</li>
              <li>• Tarjetas con sombras suaves</li>
              <li>• Botones con colores vibrantes</li>
              <li>• Colores más amigables y accesibles</li>
              <li>• Perfecto para uso móvil y campo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botones de demostración */}
      <div className="bg-white p-8 rounded-lg border">
        <h3 className="text-2xl font-bold text-center mb-6">🔘 Comparación de Botones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Botones Admin</h4>
            <div className="space-y-3">
              <AdminButton>Botón Principal</AdminButton>
              <AdminButton variant="outline">Botón Outline</AdminButton>
              <AdminButton variant="secondary">Botón Secundario</AdminButton>
              <AdminButton variant="ghost">Botón Ghost</AdminButton>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Botones Usuario</h4>
            <div className="space-y-3">
              <UserButton>Botón Principal</UserButton>
              <UserButton variant="outline">Botón Outline</UserButton>
              <UserButton variant="secondary">Botón Secundario</UserButton>
              <UserButton variant="ghost">Botón Ghost</UserButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
