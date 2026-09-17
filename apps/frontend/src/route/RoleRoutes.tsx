import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface RoleRouteProps {
  allowedRole: 'USER' | 'TENANT';
  children: React.ReactNode;
}

export default function RoleRoute({ allowedRole, children }: RoleRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Jika role user yang login tidak sesuai dengan yang diizinkan, lempar ke halaman lain
  if (user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'TENANT' ? '/tenant/dashboard' : '/user/dashboard'} replace />;
  }

  return <>{children}</>;
}