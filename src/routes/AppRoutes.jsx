import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import GuestHome from '../features/guest/pages/GuestHome';
import PropertyCatalog from '../features/catalog/pages/PropertyCatalog';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/guest" element={<GuestHome />} />

        {/* Módulo 3 — Catálogo (Inquilino) */}
        <Route path="/tenant/catalog" element={<PropertyCatalog />} />

        {/* Fallback wildcard to redirect undefined routes back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
