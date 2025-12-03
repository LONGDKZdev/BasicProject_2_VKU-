import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaLock } from 'react-icons/fa';

const ProtectedRoute = ({ children, requireAdmin = false, disallowAdmin = false, redirectTo }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  // Determine redirect URL
  const fallbackRedirect = redirectTo || (requireAdmin ? '/admin/login' : '/login');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Checking access...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.warn('User not authenticated, redirecting to:', fallbackRedirect);
    return <Navigate to={fallbackRedirect} state={{ from: location }} replace />;
  }

  // Check if user is active
  if (user?.status !== 'active') {
    console.warn('User account is not active');
    return (
      <Navigate to={fallbackRedirect} state={{ from: location }} replace />
    );
  }

  // If route requires admin privileges
  if (requireAdmin) {
    if (!isAdmin()) {
      console.warn('User is not admin, access denied');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
            <FaLock className="text-5xl text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You need administrator privileges to access this page.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Back to Home
            </a>
          </div>
        </div>
      );
    }
  }

  // If route disallows admin (like user dashboard)
  if (disallowAdmin && isAdmin()) {
    console.warn('Admin user trying to access user-only page, redirecting to admin');
    return <Navigate to="/admin" replace />;
  }

  // User is authorized, render the component
  return children;
};

export default ProtectedRoute;