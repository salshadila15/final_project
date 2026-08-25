import { Routes, Route, Navigate } from 'react-router';

import RegisterPage from './pages/register';
import LoginPage from './pages/login';
import VerifyPasswordPage from './pages/verifyPassword';
import DashboardPage from './pages/dashboard';

function App() {
  return (
    // HANYA BOLEH ADA <Routes> DI SINI, TANPA <Router> ATAU <BrowserRouter> APAPUN!
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-password" element={<VerifyPasswordPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;