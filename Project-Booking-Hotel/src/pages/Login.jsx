import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaSpinner, FaGoogle, FaFacebook } from 'react-icons/fa';
import Toast from '../components/Toast';
import { STATIC_ASSETS } from '../utils/assetUrls';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if trying to access admin login
  useEffect(() => {
    const isAdmin = location.pathname === '/admin/login' || location.search.includes('admin=true');
    setIsAdminLogin(isAdmin);
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || (isAdminLogin ? '/admin' : '/');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, isAdminLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }

    try {
      // Call signIn from AuthContext
      const result = await signIn(email, password);

      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
        setToast({
          message: result.error || 'Login failed',
          type: 'error',
          duration: 3000,
        });
        setIsLoading(false);
        return;
      }

      // Check if user is admin when trying to access admin panel
      if (isAdminLogin) {
        // Admin check will be done by ProtectedRoute
        setToast({
          message: 'Login successful! Redirecting to dashboard...',
          type: 'success',
          duration: 2000,
        });
      } else {
        setToast({
          message: 'Login successful!',
          type: 'success',
          duration: 2000,
        });
      }

      // Redirect will be handled by useEffect above
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
      setToast({
        message: 'An error occurred during login',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      setIsLoading(true);
      console.log(`OAuth login with ${provider} - Coming soon`);
      setToast({
        message: `${provider} login coming soon!`,
        type: 'info',
        duration: 2000,
      });
    } catch (err) {
      console.error('OAuth error:', err);
      setToast({
        message: `${provider} login failed`,
        type: 'error',
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email && password;
  const isSubmitDisabled = !isFormValid || isLoading || loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <Toast message={toast?.message} type={toast?.type} duration={toast?.duration} />

      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={STATIC_ASSETS.logoDark}
            alt="Logo"
            className="w-32 mx-auto mb-4"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-bold text-gray-800">
            {isAdminLogin ? 'Admin Login' : 'Guest Login'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isAdminLogin ? 'Manage your hotel' : 'Book your perfect stay'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                disabled={isLoading || loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                disabled={isLoading || loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                disabled={isLoading || loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium transition"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isLoading || loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* OAuth Divider */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm">Or continue with</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleOAuthLogin('Google')}
            disabled={isLoading || loading}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition"
          >
            <FaGoogle className="text-red-500" />
            <span className="text-sm font-medium">Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('Facebook')}
            disabled={isLoading || loading}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition"
          >
            <FaFacebook className="text-blue-600" />
            <span className="text-sm font-medium">Facebook</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-amber-600 hover:text-amber-700 font-semibold transition"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        {isAdminLogin && (
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;