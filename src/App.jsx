import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CertificationsPage from './pages/CertificationsPage';
import HistoryPage from './pages/HistoryPage';
import MirPage from './pages/MirPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';
import TrackingPage from './pages/TrackingPage';
import TrackingHubPage from './pages/TrackingHubPage';
import ServicesPage from './pages/ServicesPage';
import SchedulePage from './pages/SchedulePage';
import RequestPage from './pages/RequestPage';
import PlansPage from './pages/PlansPage';
import ChecklistPage from './pages/ChecklistPage';
import CronogramaPage from './pages/CronogramaPage';
import ContactPage from './pages/ContactPage';
import ProtectedRoute from './components/ProtectedRoute';
import PastCollectionsPage from './pages/PastCollectionsPage';
import SuppliesRequestPage from './pages/SuppliesRequestPage';
import OperatorDashboardPage from './pages/operator/OperatorDashboardPage';
import OperatorRoutesPage from './pages/operator/OperatorRoutesPage';
import OperatorOrdersPage from './pages/operator/OperatorOrdersPage';
import OperatorRouteDetailPage from './pages/operator/OperatorRouteDetailPage';
import OperatorStopDetailPage from './pages/operator/OperatorStopDetailPage';
import OperatorIncidentPage from './pages/operator/OperatorIncidentPage';
import OperatorIncidentsPage from './pages/operator/OperatorIncidentsPage';
import OperatorChecklistPage from './pages/operator/OperatorChecklistPage';
import OperatorHistoryPage from './pages/operator/OperatorHistoryPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAssignmentsPage from './pages/admin/AdminAssignmentsPage';
import AdminClientsPage from './pages/admin/AdminClientsPage';
import AdminClientDetailPage from './pages/admin/AdminClientDetailPage';
import AdminOperatorsPage from './pages/admin/AdminOperatorsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminRoutesPage from './pages/admin/AdminRoutesPage';
import AdminPlansPage from './pages/admin/AdminPlansPage';
import AdminIncidentsPage from './pages/admin/AdminIncidentsPage';
import AdminTreatmentsPage from './pages/admin/AdminTreatmentsPage';
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage';
import AdminSuppliesRequestsPage from './pages/admin/AdminSuppliesRequestsPage';
import AdminSuppliesRequestDetailPage from './pages/admin/AdminSuppliesRequestDetailPage';
import AdminPlanManagementPage from './pages/admin/AdminPlanManagementPage';
import UserIncidentsPage from './pages/UserReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import RpPage from './pages/RpPage';
import RpbiPage from './pages/RpbiPage';
import RmePage from './pages/RmePage';
import IncinerationPage from './pages/IncinerationPage';
import FiscalDestructionPage from './pages/FiscalDestructionPage';
import BlogPage from './pages/Blog';
import BlogPostPage from './pages/BlogPostPage';
import { useAuth } from './contexts/SupabaseAuthContext';

// Componente que renderiza el dashboard correcto según el rol
const DynamicDashboard = () => {
  const { user, profile } = useAuth();
  
  console.log('🎯 DynamicDashboard - Usuario:', user?.email);
  console.log('🎯 DynamicDashboard - Perfil:', profile);
  console.log('🎯 DynamicDashboard - Rol del perfil:', profile?.role);
  
  if (!user || !profile) {
    console.log('🎯 DynamicDashboard - Cargando...');
    return <div>Cargando...</div>;
  }

  console.log('🎯 DynamicDashboard - Renderizando dashboard para rol:', profile.role);
  
  switch (profile.role) {
    case 'admin':
      console.log('🎯 DynamicDashboard - Mostrando AdminDashboardPage');
      return <AdminDashboardPage />;
    case 'operator':
      console.log('🎯 DynamicDashboard - Mostrando OperatorDashboardPage');
      return <OperatorDashboardPage />;
    case 'user':
      console.log('🎯 DynamicDashboard - Mostrando DashboardPage (cliente)');
      return <DashboardPage />;
    default:
      console.log('🎯 DynamicDashboard - Rol no reconocido, mostrando DashboardPage por defecto');
      return <DashboardPage />;
  }
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="certificaciones" element={<CertificationsPage />} />
          <Route path="nuestra-historia" element={<HistoryPage />} />
          <Route path="mir" element={<MirPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="contacto" element={<ContactPage />} />
          <Route path="rpbi" element={<RpbiPage />} />
          <Route path="residuos-peligrosos" element={<RpPage />} />
          <Route path="rme" element={<RmePage />} />
          <Route path="incineracion" element={<IncinerationPage />} />
          <Route path="destruccion-fiscal" element={<FiscalDestructionPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="residuos/rpbi" element={<Navigate to="/rpbi" replace />} />
          <Route path="residuos/rp" element={<Navigate to="/residuos-peligrosos" replace />} />
          <Route path="residuos/rme" element={<Navigate to="/rme" replace />} />
          <Route path="/mir/app" element={<Navigate to="/login" replace />} />
        </Route>
        
        <Route path="/mir/:role" element={<ProtectedRoute allowedRoles={['admin', 'operator', 'user']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DynamicDashboard />} />
          
          <Route path="tracking" element={<ProtectedRoute allowedRoles={['admin', 'user']}><TrackingHubPage /></ProtectedRoute>} />
          <Route path="tracking/:orderId" element={<ProtectedRoute allowedRoles={['admin', 'operator', 'user']}><TrackingPage /></ProtectedRoute>} />
          
          {/* Admin Routes - MOVED FIRST to avoid conflicts */}
          <Route path="clientes" element={<ProtectedRoute allowedRoles={['admin']}><AdminClientsPage /></ProtectedRoute>} />
          <Route path="clientes/:clientId" element={<ProtectedRoute allowedRoles={['admin']}><AdminClientDetailPage /></ProtectedRoute>} />
          <Route path="operadores" element={<ProtectedRoute allowedRoles={['admin']}><AdminOperatorsPage /></ProtectedRoute>} />
          <Route path="ordenes-admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrdersPage /></ProtectedRoute>} />
          <Route path="rutas-admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminRoutesPage /></ProtectedRoute>} />
          <Route path="planes-admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPlansPage /></ProtectedRoute>} />
          <Route path="gestion-incidencias" element={<ProtectedRoute allowedRoles={['admin']}><AdminIncidentsPage /></ProtectedRoute>} />
          <Route path="incidencias" element={<ProtectedRoute allowedRoles={['admin']}><AdminIncidentsPage /></ProtectedRoute>} />
          <Route path="tratamientos" element={<ProtectedRoute allowedRoles={['admin']}><AdminTreatmentsPage /></ProtectedRoute>} />
          <Route path="certificados" element={<ProtectedRoute allowedRoles={['admin']}><AdminCertificatesPage /></ProtectedRoute>} />
          <Route path="supplies-requests" element={<ProtectedRoute allowedRoles={['admin']}><AdminSuppliesRequestsPage /></ProtectedRoute>} />
          <Route path="supplies-requests/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminSuppliesRequestDetailPage /></ProtectedRoute>} />
          <Route path="gestion-planes" element={<ProtectedRoute allowedRoles={['admin']}><AdminPlanManagementPage /></ProtectedRoute>} />
          <Route path="asignaciones" element={<ProtectedRoute allowedRoles={['admin']}><AdminAssignmentsPage /></ProtectedRoute>} />

          {/* User Routes - MOVED FIRST to avoid conflicts */}
          <Route path="servicios" element={<ProtectedRoute allowedRoles={['user']}><ServicesPage /></ProtectedRoute>} />
          <Route path="cronograma" element={<ProtectedRoute allowedRoles={['user']}><CronogramaPage /></ProtectedRoute>} />
          <Route path="solicitar" element={<ProtectedRoute allowedRoles={['user']}><RequestPage /></ProtectedRoute>} />
          <Route path="planes" element={<ProtectedRoute allowedRoles={['user']}><PlansPage /></ProtectedRoute>} />
          <Route path="checklist" element={<ProtectedRoute allowedRoles={['user']}><ChecklistPage /></ProtectedRoute>} />
          <Route path="manifiestos" element={<ProtectedRoute allowedRoles={['user']}><PastCollectionsPage /></ProtectedRoute>} />
          <Route path="solicitar-insumos" element={<ProtectedRoute allowedRoles={['user']}><SuppliesRequestPage /></ProtectedRoute>} />
          <Route path="mis-incidencias" element={<ProtectedRoute allowedRoles={['user']}><UserIncidentsPage /></ProtectedRoute>} />
          <Route path="notificaciones" element={<ProtectedRoute allowedRoles={['user']}><NotificationsPage /></ProtectedRoute>} />
          <Route path="historial" element={<ProtectedRoute allowedRoles={['user']}><PastCollectionsPage /></ProtectedRoute>} />
          <Route path="certificados" element={<ProtectedRoute allowedRoles={['user']}><CertificationsPage /></ProtectedRoute>} />
          <Route path="perfil" element={<ProtectedRoute allowedRoles={['user']}><ProfilePage /></ProtectedRoute>} />

          {/* Operator Routes */}
          <Route path="rutas" element={<ProtectedRoute allowedRoles={['operator']}><OperatorRoutesPage /></ProtectedRoute>} />
          <Route path="ordenes" element={<ProtectedRoute allowedRoles={['operator']}><OperatorOrdersPage /></ProtectedRoute>} />
          <Route path="route/:routeId" element={<ProtectedRoute allowedRoles={['operator']}><OperatorRouteDetailPage /></ProtectedRoute>} />
          <Route path="stop/:stopId" element={<ProtectedRoute allowedRoles={['operator']}><OperatorStopDetailPage /></ProtectedRoute>} />
          <Route path="incident/new" element={<ProtectedRoute allowedRoles={['operator']}><OperatorIncidentPage /></ProtectedRoute>} />
          <Route path="incidentes" element={<ProtectedRoute allowedRoles={['operator']}><OperatorIncidentsPage /></ProtectedRoute>} />
          <Route path="checklist-operador" element={<ProtectedRoute allowedRoles={['operator']}><OperatorChecklistPage /></ProtectedRoute>} />
          <Route path="historial-operador" element={<ProtectedRoute allowedRoles={['operator']}><OperatorHistoryPage /></ProtectedRoute>} />
        </Route>

        <Route path="/dashboard/*" element={<Navigate to="/login" replace />} />

      </Routes>
      <Toaster />
    </>
  );
}

export default App;
