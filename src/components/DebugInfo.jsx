import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLocation, useParams } from 'react-router-dom';

const DebugInfo = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const params = useParams();

  if (!process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs font-mono max-w-md z-50">
      <div className="font-bold mb-2">🐛 DEBUG INFO</div>
      
      <div className="space-y-1">
        <div><strong>Ruta actual:</strong> {location.pathname}</div>
        <div><strong>Parámetros:</strong> {JSON.stringify(params)}</div>
        <div><strong>Usuario:</strong> {user?.email || 'No autenticado'}</div>
        <div><strong>ID Usuario:</strong> {user?.id || 'N/A'}</div>
        <div><strong>Perfil:</strong> {profile ? '✅ Cargado' : '❌ No cargado'}</div>
        <div><strong>Rol:</strong> {profile?.role || 'N/A'}</div>
        <div><strong>Loading:</strong> {loading ? '⏳ Sí' : '✅ No'}</div>
        <div><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="font-bold text-yellow-400">🔍 Estado de Navegación</div>
        <div>Ruta base esperada: /mir/{profile?.role || 'undefined'}</div>
        <div>¿Ruta válida?: {location.pathname.startsWith(`/mir/${profile?.role || 'undefined'}`) ? '✅ Sí' : '❌ No'}</div>
      </div>
    </div>
  );
};

export default DebugInfo;
