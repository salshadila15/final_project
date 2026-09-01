import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import RegisterPage from './pages/register';
import LoginPage from './pages/login';
import VerifyPasswordPage from './pages/verifyPassword';
import DashboardPage from './pages/dashboard';
import RoleRoute from './route/RoleRoutes';
import TenantDashboard from './pages/tenant/TenantDashboard';
import UserDashboard from './pages/user/UserDashboard';
import CreatePropertyPage from './pages/tenant/CreateProperty';

function App() {
  return (
    // HANYA BOLEH ADA <Routes> DI SINI, TANPA <Router> ATAU <BrowserRouter> APAPUN!
    <BrowserRouter>
    <AuthProvider>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-password" element={<VerifyPasswordPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/tenant/dashboard" element={<RoleRoute allowedRole='TENANT'><TenantDashboard /></RoleRoute>} />
      <Route path="/user/dashboard" element={<RoleRoute allowedRole='USER'><UserDashboard /></RoleRoute>} />
      <Route path="/properties/add" element={<RoleRoute allowedRole='TENANT'><CreatePropertyPage /></RoleRoute>} />
    </Routes>
    </AuthProvider>
    </BrowserRouter>
  );
}

export default App;