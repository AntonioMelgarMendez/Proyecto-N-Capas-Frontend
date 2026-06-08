import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import GuestHome from '../features/guest/pages/GuestHome';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/guest" element={<GuestHome />} />
        {/* Fallback wildcard to redirect undefined routes back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
