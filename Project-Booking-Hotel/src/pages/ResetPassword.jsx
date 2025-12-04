import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { LogoDark } from '../assets';
import { FaLock, FaSpinner, FaCheck, FaArrowLeft } from 'react-icons/fa';
import Toast from '../components/Toast';
import { useAuth } from '../context/SimpleAuthContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { resetPasswordWithCode, loading, error: authError } = useAuth();

  // Lấy code và email từ URL query params
  const codeFromUrl = searchParams.get('code');
  const emailFromUrl = searchParams.get('email');

  useEffect(() => {
    if (codeFromUrl) {
      setFormData(prev => ({ ...prev, code: codeFromUrl }));
    }
    if (emailFromUrl) {
      setFormData(prev => ({ ...prev, email: emailFromUrl }));
    }
  }, [codeFromUrl, emailFromUrl]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.code || !formData.newPassword || !formData.confirmPassword) {
      setToast({
        message: 'Please fill in all fields',
        type: 'error'
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      setToast({
        message: 'Password must be at least 6 characters',
        type: 'error'
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setToast({
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    const result = await resetPasswordWithCode(formData.email, formData.code, formData.newPassword);
    
    if (result.success) {
      setToast({
        message: 'Password reset successfully!',
        type: 'success'
      });
      setSuccessMessage('Your password has been reset successfully. You will be redirected to the login page.');
      
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } else {
      setToast({
        message: result.error || 'Failed to reset password. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-accent/20 flex items-center justify-center p-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Reset Password Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent to-accent-hover p-8 text-center">
            <div className="flex justify-center mb-4">
              <LogoDark className="w-[180px] brightness-0 invert" />
            </div>
            <h1 className="text-2xl font-primary text-white mb-2">Reset Password</h1>
            <p className="text-white/90 text-sm">Enter your new password</p>
          </div>

          {!successMessage ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                  disabled={loading || !!emailFromUrl}
                />
              </div>

              {/* Reset Code */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">
                  Reset Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all uppercase"
                  placeholder="ABC123"
                  required
                  disabled={loading || !!codeFromUrl}
                  maxLength="6"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 6-character code sent to your email
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">
                  New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-accent transition-colors text-sm"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  At least 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-accent transition-colors text-sm"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Reset Password
                  </>
                )}
              </button>

              {/* Back Links */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
                >
                  <FaArrowLeft />
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <div className="p-8 space-y-6">
              <div className="text-center mb-6">
                <FaCheck className="text-5xl text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Password Reset Successfully!</h2>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  {successMessage}
                </p>
              </div>

              <Link
                to="/login"
                className="block w-full btn btn-primary btn-lg text-center"
              >
                Go to Sign In
              </Link>
            </div>
          )}

          {/* Footer */}
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

export default ResetPassword;

