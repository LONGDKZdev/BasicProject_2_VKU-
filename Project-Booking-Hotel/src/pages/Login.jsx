import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/SimpleAuthContext';
import { FaEnvelope, FaLock, FaSpinner, FaGoogle, FaFacebook, FaUserShield, FaUser } from 'react-icons/fa';
import Toast from '../components/Toast';

const STORAGE_URL = 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState('user'); // 'user' or 'admin'
  const [toast, setToast] = useState(null);
  
  const { login, adminLogin, loginWithOAuth, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Auto-detect role from URL path
    const isAdmin = location.pathname === '/admin/login' || location.search.includes('admin=true');
    if (isAdmin) {
      setUserRole('admin');
    }
  }, [location]);

  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || (userRole === 'admin' ? '/admin' : '/');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, userRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Sử dụng role được chọn để quyết định login method
    const result = userRole === 'admin'
      ? await adminLogin(email, password)
      : await login(email, password);
    
    if (result.success) {
      setToast({
        message: `Welcome back, ${result.user.name || result.user.email}!`,
        type: 'success'
      });
      setTimeout(() => {
        // Redirect dựa trên role được chọn hoặc role thực tế của user
        let redirectPath = '/';
        if (userRole === 'admin' || result.user.isAdmin) {
          redirectPath = '/admin';
        } else {
          redirectPath = '/';
        }
        const from = location.state?.from?.pathname || redirectPath;
        navigate(from, { replace: true });
      }, 1500);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleOAuthLogin = async (provider) => {
    if (userRole === 'admin') {
      setError('OAuth login is not available for admin');
      return;
    }

    setError('');
    const result = await loginWithOAuth(provider);
    
    if (result.success) {
      setToast({
        message: `Welcome, ${result.user.name || result.user.email}!`,
        type: 'success'
      });
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } else {
      setError(`Failed to login with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-accent/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-accent to-accent-hover p-8 text-center">
            <div className="flex justify-center mb-4">
              <img src={`${STORAGE_URL}/logo-dark.svg`} alt="logo" className="w-[180px] brightness-0 invert" />
            </div>
            <h1 className="text-2xl font-primary text-white mb-2">
              Sign In
            </h1>
            <p className="text-white/90 text-sm">
              Welcome back
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-primary">
                Login As
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserRole('user')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    userRole === 'user'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <FaUser />
                  <span className="font-semibold">User</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('admin')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    userRole === 'admin'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <FaUserShield />
                  <span className="font-semibold">Admin</span>
                </button>
              </div>
              {userRole === 'admin' && (
                <p className="mt-2 text-xs text-gray-500">
                  Admin login requires admin privileges
                </p>
              )}
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-primary">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="admin@hotel.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-primary">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-accent transition-colors text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-accent hover:text-accent-hover transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {userRole === 'user' && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaGoogle className="text-red-500" />
                    <span className="text-sm font-semibold">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('facebook')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaFacebook className="text-blue-600" />
                    <span className="text-sm font-semibold">Facebook</span>
                  </button>
                </div>
              </>
            )}

            {userRole === 'admin' && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* <p className="text-xs font-semibold text-gray-700 mb-2">Admin Credentials:</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Email:</strong> admin@hotel.com</p>
                  <p><strong>Password:</strong> admin123</p>
                </div> */}
              </div>
            )}

            {userRole === 'user' && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-accent hover:text-accent-hover font-semibold">
                    Sign Up
                  </Link>
                </p>
              </div>
            )}
          </form>

          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Hotel Booking. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Login;