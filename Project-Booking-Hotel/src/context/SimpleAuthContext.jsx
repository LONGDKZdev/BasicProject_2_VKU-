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
   * Ưu tiên dùng C# API, fallback sang Supabase nếu C# API không khả dụng
   */
  const resetPasswordRequest = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const { callWithFallback, callCSharpAPI } = await import('../services/dualApiService');
      const { requestPasswordReset } = await import('../services/simpleAuthService');
      
      const result = await callWithFallback(
        // C# API call
        async (signal) => {
          const response = await callCSharpAPI(
            '/api/auth/send-verification-code',
            {
              method: 'POST',
              body: JSON.stringify({ email })
            },
            signal
          );
          
          if (!response.success) {
            throw new Error(response.message || 'Failed to send verification code');
          }
          
          return { success: true, resetCode: response.resetCode };
        },
        // Supabase fallback
        async () => {
          return await requestPasswordReset(email);
        },
        5000 // 5 giây timeout
      );
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during password reset';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  /**
   * Reset Password với code
   * Ưu tiên dùng C# API, fallback sang Supabase nếu C# API không khả dụng
   */
  const resetPasswordWithCode = useCallback(async (email, code, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const { callWithFallback, callCSharpAPI } = await import('../services/dualApiService');
      const { resetPassword } = await import('../services/simpleAuthService');
      
      const result = await callWithFallback(
        // C# API call
        async (signal) => {
          const response = await callCSharpAPI(
            '/api/auth/verify-code-reset-password',
            {
              method: 'POST',
              body: JSON.stringify({ email, code, newPassword })
            },
            signal
          );
          
          if (!response.success) {
            throw new Error(response.message || 'Failed to reset password');
          }
          
        return { success: true };
        },
        // Supabase fallback
        async () => {
          return await resetPassword(email, code, newPassword);
        },
        5000 // 5 giây timeout
      );
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during password reset';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

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
   * OAuth Login với C# API và Fallback Supabase
   * Tự động fallback nếu C# API không khả dụng
   * Clear Google OAuth cache để tránh cache cũ
   */
  const loginWithOAuth = useCallback(async (provider) => {
    try {
      setError('');
      setLoading(true);
      
      // Clear OAuth cache và Supabase Auth session để tránh dùng account cũ
      try {
        // Clear Supabase Auth session trước (QUAN TRỌNG)
        const { supabase } = await import('../utils/supabaseClient');
        await supabase.auth.signOut();
        console.log('🧹 Cleared Supabase Auth session');
        
        // Clear localStorage cache
        const cacheKeys = Object.keys(localStorage).filter(key => 
          key.includes('google') || 
          key.includes('oauth') || 
          key.includes('gid') ||
          key.includes('supabase') ||
          key.includes('sb-')
        );
        cacheKeys.forEach(key => localStorage.removeItem(key));
        console.log(`🧹 Cleared ${cacheKeys.length} localStorage keys`);
        
        // Clear sessionStorage
        sessionStorage.clear();
        console.log('🧹 Cleared sessionStorage');
        
        // Clear cookies liên quan đến OAuth (nếu có)
        document.cookie.split(";").forEach(c => {
          const cookieName = c.trim().split("=")[0];
          if (cookieName.includes('google') || cookieName.includes('oauth') || cookieName.includes('gid')) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
        
        console.log('✅ OAuth cache cleared completely');
      } catch (cacheError) {
        console.warn('Failed to clear OAuth cache:', cacheError);
      }
      
      const { callWithFallback, callCSharpAPI } = await import('../services/dualApiService');
      
      // Bước 1: Thử gọi C# API để lấy OAuth URL (với timeout)
      const result = await callWithFallback(
        // C# API call
        async (signal) => {
          const urls = await callCSharpAPI('/api/auth/oauth/urls', { method: 'GET' }, signal);
          
          // Redirect đến OAuth provider qua C# API
          // Thêm prompt=select_account để user chọn account mới mỗi lần
          if (provider === 'google' && urls.googleAuthUrl) {
            // Thêm prompt=select_account để tránh cache account cũ
            const googleUrl = urls.googleAuthUrl.includes('prompt=')
              ? urls.googleAuthUrl.replace(/prompt=[^&]*/, 'prompt=select_account')
              : urls.googleAuthUrl + (urls.googleAuthUrl.includes('?') ? '&' : '?') + 'prompt=select_account';
            
            console.log('🔐 Redirecting to Google OAuth via C# API');
            window.location.href = googleUrl;
            return { success: true, redirecting: true };
          } else if (provider === 'facebook' && urls.facebookAuthUrl) {
            // Facebook: thêm auth_type=reauthenticate để tránh cache
            const facebookUrl = urls.facebookAuthUrl.includes('auth_type=')
              ? urls.facebookAuthUrl.replace(/auth_type=[^&]*/, 'auth_type=reauthenticate')
              : urls.facebookAuthUrl + (urls.facebookAuthUrl.includes('?') ? '&' : '?') + 'auth_type=reauthenticate';
            
            console.log('🔐 Redirecting to Facebook OAuth via C# API');
            window.location.href = facebookUrl;
            return { success: true, redirecting: true };
          }
          
          throw new Error('OAuth URL not found in C# API response');
        },
        // Supabase fallback
        async () => {
      const { supabase } = await import('../utils/supabaseClient');
          
          // Đảm bảo đã clear session (đã clear ở trên, nhưng clear lại để chắc chắn)
          await supabase.auth.signOut();
          
          // Clear thêm một lần nữa để chắc chắn
          try {
            const allKeys = Object.keys(localStorage);
            allKeys.forEach(key => {
              if (key.startsWith('sb-') || key.includes('supabase')) {
                localStorage.removeItem(key);
              }
            });
          } catch (e) {
            console.warn('Error clearing Supabase localStorage:', e);
          }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              // QUAN TRỌNG: Thêm query params để force user chọn account mới
              queryParams: provider === 'google' 
                ? { 
                    prompt: 'select_account',  // Force select account
                    access_type: 'offline'     // Get refresh token
                  } 
                : provider === 'facebook'
                ? { 
                    auth_type: 'reauthenticate',  // Force re-authenticate
                    display: 'popup'              // Use popup để tránh cache
                  }
                : {}
            },
            // Skip browser redirect để tránh cache
            skipBrowserRedirect: false
      });

      if (error) {
        throw new Error(`Supabase OAuth error: ${error.message}`);
      }
      
          return { success: true, data };
        },
        3000 // 3 giây timeout
      );
      
      return result;
    } catch (err) {
      console.error('OAuth login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

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
  const loginManual = useCallback((userData) => {
    setUser(userData);
    saveSession(userData); // Lưu vào LocalStorage
  }, []);

  const shareWithChildren = {
    // State
    user,
    setUser,
    loginManual,
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

