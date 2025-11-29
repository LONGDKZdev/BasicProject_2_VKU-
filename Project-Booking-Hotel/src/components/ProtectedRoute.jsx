import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const ProtectedRoute = ({ children, requireAdmin = false, disallowAdmin = false, redirectTo }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  const fallbackLogin = redirectTo || (requireAdmin ? '/admin/login' : '/login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-accent mx-auto mb-4" />
          <p className="text-gray-600">Checking...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Redirect to login page with return url
    return <Navigate to={fallbackLogin} state={{ from: location }} replace />;
  }

  if (disallowAdmin && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    // User is logged in but not admin
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <h1 className="h2 text-primary mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You need administrator privileges to access this page.
          </p>
          <a href="/" className="btn btn-primary btn-sm">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

