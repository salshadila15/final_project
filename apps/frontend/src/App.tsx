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
import ProfilePage from './pages/tenant/TenantProfile';
import SettingPage from './pages/tenant/TenantSettings';
import TenantPropertiesEdit from './pages/tenant/TenantPropertiesEdit';
import TenantPropertyDetail from './pages/tenant/TenantPropertyDetail';
import ExplorePage from './pages/user/ExplorePage';
import PropertyDetail from './pages/user/PropertyDetail';
import BookingPage from './pages/user/BookingPage';
import TransactionPage from './pages/user/TransactionPage';

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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingPage />} />
          <Route
            path="/tenant/dashboard"
            element={
              <RoleRoute allowedRole="TENANT">
                <TenantDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/user/dashboard"
            element={
              <RoleRoute allowedRole="USER">
                <UserDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/tenant/properties/add"
            element={
              <RoleRoute allowedRole="TENANT">
                <CreatePropertyPage />
              </RoleRoute>
            }
          />
          <Route
            path="/tenant/properties/:id"
            element={
              <RoleRoute allowedRole="TENANT">
                <TenantPropertyDetail />
              </RoleRoute>
            }
          />
          <Route
            path="/tenant/properties/edit/:id"
            element={
              <RoleRoute allowedRole="TENANT">
                <TenantPropertiesEdit />
              </RoleRoute>
            }
          />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route
            path="/booking"
            element={
              <RoleRoute allowedRole="USER">
                <BookingPage />
              </RoleRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <RoleRoute allowedRole="USER">
                <TransactionPage />
              </RoleRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
