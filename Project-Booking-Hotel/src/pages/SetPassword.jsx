import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/SimpleAuthContext';
import { supabase } from '../utils/supabaseClient';
import { hashPassword } from '../services/simpleAuthService';
import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaCheck, FaTimes } from 'react-icons/fa';
import Toast from '../components/Toast';

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setUser } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const email = searchParams.get('email') || user?.email;

  useEffect(() => {
    // Nếu không có email, redirect về login
    if (!email && !user) {
      navigate('/login');
    }
  }, [email, user, navigate]);

  // Password strength validation - Tương tự Register.jsx
  const passwordRequirements = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    };
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordRequirements).every(req => req === true);
  }, [passwordRequirements]);

  // Check if passwords match
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null; // Not checked yet
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation - Tương tự Register.jsx
    if (!password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (!isPasswordValid) {
      setError('Mật khẩu không đáp ứng đủ yêu cầu. Vui lòng kiểm tra các yêu cầu bên dưới.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      // Hash password
      const passwordHash = await hashPassword(password);

      // Tìm user hiện tại
      const targetEmail = email || user?.email;
      if (!targetEmail) {
        throw new Error('Không tìm thấy email');
      }

      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', targetEmail)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw new Error('Không tìm thấy tài khoản');
      }

      if (!existingUser) {
        throw new Error('Tài khoản không tồn tại');
      }

      // Update password
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Không thể cập nhật mật khẩu: ' + updateError.message);
      }

      // Update user trong context
      setUser(updatedUser);

      setToast({
        message: 'Đặt mật khẩu thành công!',
        type: 'success'
      });

      // Redirect về home sau 1.5 giây
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Set password error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-accent/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
              <FaLock className="text-2xl text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Đặt Mật Khẩu
            </h2>
            <p className="text-gray-600 text-sm">
              Vui lòng đặt mật khẩu cho tài khoản của bạn
            </p>
            {email && (
              <p className="text-gray-500 text-xs mt-2">
                Email: {email}
              </p>
            )}
          </div>

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-primary">
                Mật khẩu mới
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
                  placeholder="Nhập mật khẩu mới"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-accent transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
              {/* Password Strength Indicator - Tương tự Register.jsx */}
              {password && (
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Yêu cầu mật khẩu:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordRequirements.minLength ? (
                        <FaCheck className="text-green-600 flex-shrink-0" />
                      ) : (
                        <FaTimes className="text-gray-400 flex-shrink-0" />
                      )}
                      <span>Ít nhất 8 ký tự</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordRequirements.hasUpperCase ? (
                        <FaCheck className="text-green-600 flex-shrink-0" />
                      ) : (
                        <FaTimes className="text-gray-400 flex-shrink-0" />
                      )}
                      <span>Một chữ hoa (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordRequirements.hasLowerCase ? (
                        <FaCheck className="text-green-600 flex-shrink-0" />
                      ) : (
                        <FaTimes className="text-gray-400 flex-shrink-0" />
                      )}
                      <span>Một chữ thường (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordRequirements.hasNumber ? (
                        <FaCheck className="text-green-600 flex-shrink-0" />
                      ) : (
                        <FaTimes className="text-gray-400 flex-shrink-0" />
                      )}
                      <span>Một số (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs sm:col-span-2 ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordRequirements.hasSpecialChar ? (
                        <FaCheck className="text-green-600 flex-shrink-0" />
                      ) : (
                        <FaTimes className="text-gray-400 flex-shrink-0" />
                      )}
                      <span>Một ký tự đặc biệt (!@#$%...)</span>
                    </div>
                  </div>
                  {isPasswordValid && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-green-600 font-semibold flex items-center gap-2">
                        <FaCheck className="flex-shrink-0" />
                        Mật khẩu đáp ứng tất cả yêu cầu
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-primary">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${
                    confirmPassword && passwordsMatch === false
                      ? 'border-red-300 bg-red-50'
                      : confirmPassword && passwordsMatch === true
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Nhập lại mật khẩu"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-accent transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {confirmPassword && passwordsMatch !== null && (
                <div className="mt-1.5">
                  {passwordsMatch ? (
                    <p className="text-xs text-green-600 flex items-center gap-1.5">
                      <FaCheck className="flex-shrink-0" />
                      Mật khẩu khớp
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 flex items-center gap-1.5">
                      <FaTimes className="flex-shrink-0" />
                      Mật khẩu không khớp
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || passwordsMatch === false}
              className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Xác nhận
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-accent transition-colors"
            >
              Bỏ qua (có thể đặt sau)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;

