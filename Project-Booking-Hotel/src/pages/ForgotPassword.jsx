import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogoDark } from '../assets';
import { FaEnvelope, FaSpinner, FaArrowLeft, FaCheckCircle, FaCopy } from 'react-icons/fa';
import Toast from '../components/Toast';
import { sendResetCodeEmail, isEmailConfigured } from '../utils/emailService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [resetCode, setResetCode] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
    const user = users.find(u => u.email === email);

    if (!user) {
      setError('Email not found. Please check your email address.');
      setLoading(false);
      return;
    }

    // Generate reset code (6 digits)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store reset code with email and expiry (10 minutes)
    const resetData = {
      email: email,
      code: resetCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    };

    localStorage.setItem('password_reset', JSON.stringify(resetData));

    // Send email with reset code
    if (isEmailConfigured()) {
      // EmailJS is configured - send real email
      const emailResult = await sendResetCodeEmail(email, resetCode, user.name || 'User');
      
      if (emailResult.success) {
        setToast({
          message: `Reset code sent to ${email}! Please check your inbox.`,
          type: 'success'
        });
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 2000);
      } else {
        setError(emailResult.error || 'Failed to send email. Please try again.');
        // Still show code in modal as fallback
        setResetCode(resetCode);
        setShowCodeModal(true);
      }
    } else {
      // EmailJS not configured - show code in modal (demo mode)
      setResetCode(resetCode);
      setShowCodeModal(true);
      setToast({
        message: 'Email service not configured. Showing code in modal.',
        type: 'info'
      });
    }
    
    setLoading(false);
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
            <p className="text-white/90 text-sm">Enter your email to receive reset code</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                We'll send a 6-digit reset code to your email address.
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
                  Send Reset Code
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

      {/* Reset Code Modal - Demo Only */}
      {showCodeModal && resetCode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-accent to-accent-hover p-6 text-center">
              <FaCheckCircle className="text-5xl text-white mx-auto mb-4" />
              <h2 className="text-2xl font-primary text-white mb-2">Reset Code Sent!</h2>
              <p className="text-white/90 text-sm">
                In production, this code would be sent to your email
              </p>
            </div>

            <div className="p-8">
              <div className="bg-gray-50 border-2 border-dashed border-accent rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 mb-3 text-center">Your Reset Code:</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-white px-6 py-4 rounded-lg border-2 border-accent">
                    <p className="text-4xl font-mono font-bold text-accent tracking-widest">
                      {resetCode}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetCode);
                      setToast({
                        message: 'Code copied to clipboard!',
                        type: 'success'
                      });
                    }}
                    className="p-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                    title="Copy code"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Demo Mode:</strong> In production, this 6-digit code would be sent to <strong>{email}</strong> via email. 
                  The code expires in 10 minutes.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    setResetCode(null);
                    navigate('/reset-password', { state: { email } });
                  }}
                  className="w-full btn btn-primary btn-lg"
                >
                  Continue to Reset Password
                </button>
                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    setResetCode(null);
                  }}
                  className="w-full btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;

