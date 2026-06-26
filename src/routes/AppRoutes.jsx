import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Landing from '../pages/Landing';
import RegisterPage from '../pages/RegisterPage';
import GuestHome from '../features/guest/pages/GuestHome';
import PropertyCatalog from '../features/catalog/pages/PropertyCatalog';
import PropertyDetail from '../features/catalog/pages/PropertyDetail';
import CheckoutPage from '../features/checkout/pages/CheckoutPage';
import PaymentSuccessPage from '../features/checkout/pages/PaymentSuccessPage';
import PaymentCancelPage from '../features/checkout/pages/PaymentCancelPage';
import TenantReservations from '../features/guest/pages/TenantReservations';
import TenantKeyPage from '../features/guest/pages/TenantKeyPage';
import LandlordDashboard from '../features/landlord/pages/LandlordDashboard';
import LandlordExtensionRequests from '../features/landlord/pages/LandlordExtensionRequests';
import PropertyForm from '../features/landlord/pages/PropertyForm';
import LandlordReviews from '../features/landlord/pages/LandlordReviews';
import TenantMaintenance from '../features/guest/pages/TenantMaintenance';
import LandlordTickets from '../features/landlord/pages/LandlordTickets';
import LandlordAnalytics from '../features/landlord/pages/LandlordAnalytics';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import AdminUsers from '../features/admin/pages/AdminUsers';
import AdminProperties from '../features/admin/pages/AdminProperties';
import AdminKyc from '../features/admin/pages/AdminKyc';
import TenantFines from '../features/fines/pages/TenantFines';
import LandlordFines from '../features/fines/pages/LandlordFines';
import LandlordPreventive from '../features/landlord/pages/LandlordPreventive';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>

        {/* ── Públicas ── */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Catálogo público (GET properties no requiere auth en backend) */}
        <Route path="/tenant/catalog" element={<PropertyCatalog />} />
        <Route path="/tenant/property/:id" element={<PropertyDetail />} />

        {/* ── Stripe callbacks — sin role check (Stripe redirige aquí) ── */}
        <Route path="/tenant/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />

        {/* ── Administrador ── */}
        <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/properties" element={<AdminProperties />} />
          <Route path="/admin/kyc" element={<AdminKyc />} />
        </Route>

        {/* ── Inquilino ── */}
        <Route element={<PrivateRoute allowedRoles={['INQUILINO']} />}>
          <Route path="/guest" element={<GuestHome />} />
          <Route path="/tenant" element={<Navigate to="/guest" replace />} />
          <Route path="/tenant/checkout/:reservationId" element={<CheckoutPage />} />
          <Route path="/tenant/reservations" element={<TenantReservations />} />
          <Route path="/tenant/key" element={<TenantKeyPage />} />
          <Route path="/tenant/maintenance" element={<TenantMaintenance />} />
          <Route path="/tenant/fines" element={<TenantFines />} />
        </Route>

        {/* ── Arrendador ── */}
        <Route element={<PrivateRoute allowedRoles={['ARRENDADOR']} />}>
          <Route path="/landlord" element={<Navigate to="/landlord/properties" replace />} />
          <Route path="/landlord/properties" element={<LandlordDashboard />} />
          <Route path="/landlord/properties/:id" element={<PropertyForm />} />
          <Route path="/landlord/reviews" element={<LandlordReviews />} />
          <Route path="/landlord/requests" element={<LandlordExtensionRequests />} />
          <Route path="/landlord/tickets" element={<LandlordTickets />} />
          <Route path="/landlord/analytics" element={<LandlordAnalytics />} />
          <Route path="/landlord/fines" element={<LandlordFines />} />
          <Route path="/landlord/preventive" element={<LandlordPreventive />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
};

export default AppRoutes;
