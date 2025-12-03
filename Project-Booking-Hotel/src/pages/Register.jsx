import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaSpinner, FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import Toast from '../components/Toast';
import { STATIC_ASSETS } from '../utils/assetUrls';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { signUp, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^[0-9\-+\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        newsletter: true,
      });

      if (!result.success) {
        const errorMsg = result.error || 'Registration failed. Please try again.';
        setErrors({ submit: errorMsg });
        setToast({
          message: errorMsg,
          type: 'error',
          duration: 3000,
        });
        setIsLoading(false);
        return;
      }

      setToast({
        message: 'Registration successful! Redirecting to login...',
        type: 'success',
        duration: 2000,
      });

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.message || 'An unexpected error occurred';
      setErrors({ submit: errorMsg });
      setToast({
        message: errorMsg,
        type: 'error',
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  const handleOAuthRegister = async (provider) => {
    try {
      setIsLoading(true);
      console.log(`OAuth registration with ${provider} - Coming soon`);
      setToast({
        message: `${provider} registration coming soon!`,
        type: 'info',
        duration: 2000,
      });
    } catch (err) {
      console.error('OAuth error:', err);
      setToast({
        message: `${provider} registration failed`,
        type: 'error',
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = 
    formData.name && 
    formData.email && 
    formData.password && 
    formData.confirmPassword && 
    agreedToTerms;
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
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-2">Join us for amazing experiences</p>
        </div>

        {/* Submit Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{errors.submit}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading || loading}
              />
            </div>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading || loading}
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone Input (Optional) */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone Number (Optional)</label>
            <div className="relative">
              <FaPhone className="absolute left-4 top-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading || loading}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading || loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                disabled={isLoading || loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            <p className="text-gray-500 text-xs mt-1">Min 6 characters, must contain uppercase, lowercase, and numbers</p>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading || loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                disabled={isLoading || loading}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-3 mt-5">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (errors.terms) {
                  setErrors((prev) => ({ ...prev, terms: '' }));
                }
              }}
              className="w-5 h-5 mt-1 accent-amber-500 rounded cursor-pointer"
              disabled={isLoading || loading}
            />
            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
              I agree to the <a href="#" className="text-amber-600 hover:underline">Terms & Conditions</a> and{' '}
              <a href="#" className="text-amber-600 hover:underline">Privacy Policy</a>
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 mt-6"
          >
            {isLoading || loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* OAuth Divider */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm">Or register with</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleOAuthRegister('Google')}
            disabled={isLoading || loading}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition"
          >
            <FaGoogle className="text-red-500" />
            <span className="text-sm font-medium">Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthRegister('Facebook')}
            disabled={isLoading || loading}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition"
          >
            <FaFacebook className="text-blue-600" />
            <span className="text-sm font-medium">Facebook</span>
          </button>
        </div>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold transition">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;