import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogoDark } from '../assets';
import { FaLock, FaSpinner, FaCheck, FaArrowLeft, FaKey } from 'react-icons/fa';
import Toast from '../components/Toast';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or from stored reset data
    const resetData = JSON.parse(localStorage.getItem('password_reset') || 'null');
    const emailFromState = location.state?.email;
    
    if (emailFromState) {
      setEmail(emailFromState);
    } else if (resetData?.email) {
      setEmail(resetData.email);
    } else {
      // No email found, redirect to forgot password
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.code || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.code.length !== 6) {
      setError('Reset code must be 6 digits');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check reset code
    const resetData = JSON.parse(localStorage.getItem('password_reset') || 'null');

    if (!resetData) {
      setError('Reset code expired or invalid. Please request a new one.');
      setLoading(false);
      return;
    }

    // Check if code matches
    if (resetData.code !== formData.code) {
      setError('Invalid reset code. Please check and try again.');
      setLoading(false);
      return;
    }

    // Check if code expired
    if (new Date(resetData.expiresAt) < new Date()) {
      setError('Reset code has expired. Please request a new one.');
      localStorage.removeItem('password_reset');
      setLoading(false);
      return;
    }

    // Check if email matches
    if (resetData.email !== email) {
      setError('Email mismatch. Please use the correct email.');
      setLoading(false);
      return;
    }

    // Update password in users list
    const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
    const updatedUsers = users.map(user => {
      if (user.email === email) {
        return {
          ...user,
          password: formData.newPassword // In production, this should be hashed
        };
      }
      return user;
    });

    localStorage.setItem('hotel_users', JSON.stringify(updatedUsers));
    
    // Remove reset data
    localStorage.removeItem('password_reset');

    setLoading(false);
    setToast({
      message: 'Password reset successfully! Redirecting to login...',
      type: 'success'
    });

    // Redirect to login after 2 seconds
    setTimeout(() => {
      navigate('/login');
    }, 2000);
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
            <p className="text-white/90 text-sm">
              {email ? `Enter code sent to ${email}` : 'Enter reset code and new password'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Reset Code */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-primary">
                Reset Code *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaKey className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  maxLength="6"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter the 6-digit code sent to your email
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
            <div className="flex items-center justify-between pt-4">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
              >
                <FaArrowLeft />
                Request New Code
              </Link>
              <Link
                to="/login"
                className="text-sm text-accent hover:text-accent-hover transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </form>

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

