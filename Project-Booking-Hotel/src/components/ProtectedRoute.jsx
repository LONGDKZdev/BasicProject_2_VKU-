import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/SimpleAuthContext';
import { FaSpinner } from 'react-icons/fa';

const ProtectedRoute = ({ children, requireAdmin = false, disallowAdmin = false, redirectTo }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  const fallbackLogin = redirectTo || (requireAdmin ? '/login' : '/login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-accent mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to={fallbackLogin} state={{ from: location }} replace />;
  }

  // Admin-only route check
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <h1 className="h2 text-primary mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Admin access required.
          </p>
          <a href="/" className="btn btn-primary btn-sm">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Prevent admin from accessing user pages if needed
  if (disallowAdmin && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;