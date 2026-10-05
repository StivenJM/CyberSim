import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteByRoleProps {
    children: React.ReactNode;
    requiredRole: 'estudiante' | 'profesor';
}

const ProtectedRouteByRole = ({ children, requiredRole }: ProtectedRouteByRoleProps) => {
    const { isAuthenticated, isEmailConfirmed, getUserRole } = useAuth();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (!isEmailConfirmed()) {
        return <Navigate to="/verificar-email" replace />;
    }

    const userRole = getUserRole();

    if (userRole !== requiredRole) {
        const redirectTo = userRole === 'profesor' ? '/docente' : '/seleccion-niveles';
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRouteByRole;
