import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isEmailConfirmed } = useAuth();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (!isEmailConfirmed()) {
        return <Navigate to="/verificar-email" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
