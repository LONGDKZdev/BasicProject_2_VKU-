/**
 * Simple Auth Context - Không dùng Supabase Auth
 * Chỉ dùng Supabase như database, tự quản lý session
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
} from '../services/simpleAuthService';

const AuthInfo = createContext();

const SESSION_KEY = 'hotel_booking_session';

/**
 * Lưu session vào localStorage
 */
const saveSession = (user) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    userId: user.id,
    email: user.email,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 ngày
  }));
};

/**
 * Lấy session từ localStorage
 */
const getSession = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
};

/**
 * Xóa session
 */
const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const SimpleAuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state on app load
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        const session = getSession();
        if (session && session.userId) {
          // Load user data
          const userData = await getUserById(session.userId);
          if (userData) {
            setUser(userData);
          } else {
            // User không tồn tại, xóa session
            clearSession();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Register
   */
  const register = useCallback(async (email, password, name = '') => {
    try {
      setLoading(true);
      setError(null);

      const result = await registerUser(email, password, name);

      if (result.success) {
        setUser(result.user);
        saveSession(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during registration';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login
   */
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await loginUser(email, password);

      if (result.success) {
        setUser(result.user);
        saveSession(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during login';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Admin Login (same as login, but with admin check)
   */
  const adminLogin = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await loginUser(email, password);

      if (result.success) {
        if (!result.user.isAdmin) {
          setError('User does not have admin privileges');
          return { success: false, error: 'User does not have admin privileges' };
        }
        setUser(result.user);
        saveSession(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during admin login';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      clearSession();
      setUser(null);
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during logout';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset Password Request
   */
  const resetPasswordRequest = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      const result = await requestPasswordReset(email);
      if (result.success) {
        return { success: true, resetCode: result.resetCode }; // Trả về code để test
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during password reset';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset Password với code
   */
  const resetPasswordWithCode = useCallback(async (email, code, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      const result = await resetPassword(email, code, newPassword);
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during password reset';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update Password (for logged-in user)
   */
  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const result = await changePassword(user.id, currentPassword, newPassword);
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred updating password';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Update User Profile
   */
  const updateUserProfileHandler = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const result = await updateUserProfile(user.id, updates);
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred updating profile';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * OAuth Login (không hỗ trợ trong simple auth)
   */
  const loginWithOAuth = useCallback(async (provider) => {
    setError(`${provider} login is not available in simple auth mode`);
    return { success: false, error: `${provider} login is not available` };
  }, []);

  /**
   * Helper functions
   */
  const isAuthenticated = useCallback(() => {
    return user !== null && getSession() !== null;
  }, [user]);

  const isAdmin = useCallback(() => {
    return user?.isAdmin === true;
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const shareWithChildren = {
    // State
    user,
    loading,
    error,
    session: user ? { user } : null, // Compatible với code cũ

    // Auth methods
    login,
    adminLogin,
    register,
    loginWithOAuth,
    logout,
    resetPassword: resetPasswordRequest,
    resetPasswordWithCode,
    updatePassword,
    updateUserProfile: updateUserProfileHandler,

    // Helper methods
    isAuthenticated,
    isAdmin,
    clearError,
  };

  return (
    <AuthInfo.Provider value={shareWithChildren}>
      {children}
    </AuthInfo.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthInfo);
  if (!context) {
    throw new Error('useAuth must be used within SimpleAuthContext provider');
  }
  return context;
};

