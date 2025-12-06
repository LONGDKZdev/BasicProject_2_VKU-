import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogoDark } from '../assets';
import { FaEnvelope, FaSpinner, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import Toast from '../components/Toast';
import { useAuth } from '../context/SimpleAuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [resetCode, setResetCode] = useState('');
  const navigate = useNavigate();
  const { resetPassword, loading, error: authError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setResetCode('');

    if (!email) {
      setToast({
        message: 'Please enter your email address',
        type: 'error'
      });
      return;
    }

    // Thử gọi C# API trước
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      const apiResponse = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (apiResponse.ok) {
        const apiResult = await apiResponse.json();
        if (apiResult.success) {
          const code = apiResult.resetCode || 'N/A';
          setResetCode(code);
          setToast({
            message: 'Password reset email sent successfully!',
            type: 'success'
          });
          setSuccessMessage(`A password reset code has been sent to your email. Code expires in 15 minutes.`);
          setTimeout(() => {
            navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${code}`);
          }, 3000);
          return;
        }
      }
    } catch (apiError) {
      console.warn('C# API not available, using fallback:', apiError);
    }

    // Fallback: Dùng logic hiện tại
    const result = await resetPassword(email);
    
    if (result.success) {
      const code = result.resetCode || 'N/A';
      setResetCode(code);
      setToast({
        message: `Password reset code generated!`,
        type: 'success'
      });
      setSuccessMessage(`A password reset code has been generated. Use this code to reset your password. Code expires in 1 hour.`);
      
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${code}`);
      }, 3000);
    } else {
      setToast({
        message: result.error || 'Failed to generate reset code. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-accent/20 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Forgot Password Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent to-accent-hover p-8 text-center">
            <div className="flex justify-center mb-4">
              <LogoDark className="w-[180px] brightness-0 invert" />
            </div>
            <h1 className="text-2xl font-primary text-white mb-2">Forgot Password?</h1>
            <p className="text-white/90 text-sm">We'll send you a password reset link</p>
          </div>

          {/* Form */}
          {!successMessage ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">
                  Email Address
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
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the email address associated with your account and we'll send you a password reset link.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaEnvelope />
                    Send Reset Link
                  </>
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center pt-4">
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
                <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Reset Link Sent!</h2>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-blue-900">
                  {successMessage}
                </p>
                {resetCode && (
                  <div className="mt-3 p-3 bg-white rounded border-2 border-blue-300">
                    <p className="text-xs text-blue-700 mb-1 font-semibold">Your Reset Code:</p>
                    <p className="text-2xl font-mono font-bold text-blue-900 tracking-wider text-center">
                      {resetCode}
                    </p>
                    <p className="text-xs text-blue-600 mt-2 text-center">
                      (You will be redirected to reset page in 3 seconds)
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full btn btn-primary btn-lg text-center"
                >
                  Back to Sign In
                </Link>
                <button
                  onClick={() => {
                    setSuccessMessage('');
                    setEmail('');
                    setResetCode('');
                  }}
                  className="w-full btn btn-secondary btn-sm"
                >
                  Request Another Code
                </button>
              </div>
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

export default ForgotPassword;

