import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import GuestHome from '../features/guest/pages/GuestHome';
import PropertyCatalog from '../features/catalog/pages/PropertyCatalog';
import PropertyDetail from '../features/catalog/pages/PropertyDetail';
import CheckoutPage from '../features/checkout/pages/CheckoutPage';
import PaymentSuccessPage from '../features/checkout/pages/PaymentSuccessPage';
import TenantReservations from '../features/guest/pages/TenantReservations';
import LandlordDashboard from '../features/landlord/pages/LandlordDashboard';
import PropertyForm from '../features/landlord/pages/PropertyForm';
import LandlordReviews from '../features/landlord/pages/LandlordReviews';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/guest" element={<GuestHome />} />

        {/* Módulo 3 — Catálogo (Inquilino) */}
        <Route path="/tenant" element={<Navigate to="/guest" replace />} />
        <Route path="/tenant/catalog" element={<PropertyCatalog />} />
        <Route path="/tenant/property/:id" element={<PropertyDetail />} />
        <Route path="/tenant/checkout/:reservationId" element={<CheckoutPage />} />
        <Route path="/tenant/reservations" element={<TenantReservations />} />
        <Route path="/tenant/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<Navigate to="/guest" replace />} />

        {/* Módulo 3 — Dashboard Arrendador */}
        <Route path="/landlord" element={<Navigate to="/landlord/properties" replace />} />
        <Route path="/landlord/properties" element={<LandlordDashboard />} />
        <Route path="/landlord/properties/:id" element={<PropertyForm />} />
        <Route path="/landlord/reviews" element={<LandlordReviews />} />

        {/* Fallback wildcard to redirect undefined routes back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
