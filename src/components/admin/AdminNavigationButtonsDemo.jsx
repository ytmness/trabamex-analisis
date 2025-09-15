import React from 'react';
import AdminNavigationButtons from './AdminNavigationButtons';

const AdminNavigationButtonsDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Demo: Botones de Navegación Administrativa</h1>
        
        <div className="space-y-8">
          {/* Demo 1: Con todas las opciones */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Navegación Completa (por defecto)</h2>
            <AdminNavigationButtons />
          </div>

          {/* Demo 2: Solo botones principales */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Solo Botones Principales</h2>
            <AdminNavigationButtons showQuickActions={false} />
          </div>

          {/* Demo 3: Sin botón de regresar */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Sin Botón de Regresar</h2>
            <AdminNavigationButtons showBackButton={false} />
          </div>

          {/* Demo 4: Sin botón de inicio */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Sin Botón de Inicio</h2>
            <AdminNavigationButtons showHomeButton={false} />
          </div>

          {/* Demo 5: Personalizado */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Personalizado (sin acciones rápidas, sin botón de regresar)</h2>
            <AdminNavigationButtons 
              showBackButton={false} 
              showQuickActions={false}
              className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200"
            />
          </div>
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Características del Componente:</h3>
          <ul className="text-blue-700 space-y-2">
            <li>• <strong>Botón Regresar:</strong> Navega a la página anterior</li>
            <li>• <strong>Botón Inicio:</strong> Navega a la página principal</li>
            <li>• <strong>Dashboard Admin:</strong> Navega al panel de administrador</li>
            <li>• <strong>Panel Cliente:</strong> Navega al panel de cliente</li>
            <li>• <strong>Acciones Rápidas:</strong> 8 botones para navegar a funciones administrativas</li>
            <li>• <strong>Personalizable:</strong> Puedes ocultar/mostrar elementos según necesites</li>
            <li>• <strong>Responsive:</strong> Se adapta a diferentes tamaños de pantalla</li>
          </ul>
        </div>

        <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Uso en Páginas de Admin:</h3>
          <div className="text-green-700 space-y-2">
            <p><strong>Importar:</strong></p>
            <code className="bg-green-100 px-2 py-1 rounded text-sm">import AdminNavigationButtons from '@/components/admin/AdminNavigationButtons';</code>
            
            <p className="mt-3"><strong>Usar en el JSX:</strong></p>
            <code className="bg-green-100 px-2 py-1 rounded text-sm">{'<AdminNavigationButtons />'}</code>
            
            <p className="mt-3"><strong>Personalizar:</strong></p>
            <code className="bg-green-100 px-2 py-1 rounded text-sm">{'<AdminNavigationButtons showBackButton={false} showQuickActions={false} />'}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigationButtonsDemo;
