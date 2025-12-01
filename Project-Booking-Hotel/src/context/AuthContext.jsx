import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthInfo = createContext();

/**
 * Transform Supabase user to application user shape
 */
const enrichUser = (supabaseUser, userMetadata = {}) => {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: userMetadata.full_name || supabaseUser.user_metadata?.full_name || '',
    phone: userMetadata.phone || supabaseUser.user_metadata?.phone || '',
    avatar: userMetadata.avatar_url || supabaseUser.user_metadata?.avatar_url || '',
    role: userMetadata.role || supabaseUser.user_metadata?.role || 'user',
    country: userMetadata.country || supabaseUser.user_metadata?.country || '',
    city: userMetadata.city || supabaseUser.user_metadata?.city || '',
    preferences: userMetadata.preferences || supabaseUser.user_metadata?.preferences || [],
    language: userMetadata.language || supabaseUser.user_metadata?.language || 'en',
    newsletter: userMetadata.newsletter !== false,
    bio: userMetadata.bio || supabaseUser.user_metadata?.bio || '',
    emailVerified: supabaseUser.email_confirmed_at !== null,
    createdAt: supabaseUser.created_at,
  };
};

/**
 * Fetch user profile from database
 */
const fetchUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Profile not found in DB, using auth metadata:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
};

/**
 * Create or update user profile in database
 */
const upsertUserProfile = async (userId, userData) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          full_name: userData.name,
          phone: userData.phone,
          avatar_url: userData.avatar,
          country: userData.country,
          city: userData.city,
          preferences: userData.preferences || [],
          language: userData.language || 'en',
          newsletter: userData.newsletter !== false,
          bio: userData.bio,
          role: userData.role || 'user',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Error upserting profile:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in upsertUserProfile:', err);
    return false;
  }
};

export const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  /**
   * Initialize auth state on app load
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user has existing session
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setUser(null);
          setSession(null);
        } else if (currentSession?.user) {
          // User is logged in
          setSession(currentSession);

          // Fetch extended profile from database
          const profile = await fetchUserProfile(currentSession.user.id);
          const enrichedUser = enrichUser(currentSession.user, profile);
          setUser(enrichedUser);
        } else {
          // No active session
          setSession(null);
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
   * Listen for auth state changes
   */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      setSession(newSession);

      if (newSession?.user) {
        const profile = await fetchUserProfile(newSession.user.id);
        const enrichedUser = enrichUser(newSession.user, profile);
        setUser(enrichedUser);
        setError(null);
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Email/Password Login
   */
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return { success: false, error: loginError.message };
      }

      if (data?.session?.user) {
        const profile = await fetchUserProfile(data.session.user.id);
        const enrichedUser = enrichUser(data.session.user, profile);
        setUser(enrichedUser);
        setSession(data.session);
        return { success: true, user: enrichedUser };
      }

      return { success: false, error: 'Login failed' };
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during login';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Admin Login (same as login, but with role check)
   */
  const adminLogin = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return { success: false, error: loginError.message };
      }

      if (data?.session?.user) {
        const profile = await fetchUserProfile(data.session.user.id);
        const enrichedUser = enrichUser(data.session.user, profile);

        // Check if user is admin
        if (enrichedUser.role !== 'admin') {
          await supabase.auth.signOut();
          const adminError = 'User does not have admin privileges';
          setError(adminError);
          setUser(null);
          setSession(null);
          return { success: false, error: adminError };
        }

        setUser(enrichedUser);
        setSession(data.session);
        return { success: true, user: enrichedUser };
      }

      return { success: false, error: 'Admin login failed' };
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during admin login';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * User Registration
   */
  const register = useCallback(async (email, password, name = '') => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: 'user',
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return { success: false, error: signUpError.message };
      }

      if (data?.user) {
        // Create profile in database
        const enrichedUser = enrichUser(data.user, { full_name: name, role: 'user' });
        await upsertUserProfile(data.user.id, enrichedUser);

        // If email confirmation is not required, auto-login
        if (data?.session) {
          setSession(data.session);
          setUser(enrichedUser);
          return { success: true, user: enrichedUser };
        }

        // Email confirmation required
        return {
          success: true,
          user: enrichedUser,
          needsEmailConfirmation: true,
        };
      }

      return { success: false, error: 'Registration failed' };
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during registration';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * OAuth Login (Google, etc.)
   */
  const loginWithOAuth = useCallback(async (provider) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        return { success: false, error: oauthError.message };
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || `An error occurred during ${provider} login`;
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

      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
        setError(logoutError.message);
        return { success: false, error: logoutError.message };
      }

      setUser(null);
      setSession(null);
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
   * Password Reset Request
   */
  const resetPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return { success: false, error: resetError.message };
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during password reset';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update Password (after reset or for logged-in user)
   */
  const updatePassword = useCallback(async (newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'An error occurred updating password';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update User Profile
   */
  const updateUserProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: updates.name,
          phone: updates.phone,
          avatar_url: updates.avatar,
          country: updates.country,
          city: updates.city,
          bio: updates.bio,
        },
      });

      if (authError) {
        setError(authError.message);
        return { success: false, error: authError.message };
      }

      // Update profile in database
      const success = await upsertUserProfile(user.id, updates);

      if (success) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      }

      return { success: false, error: 'Failed to update profile' };
    } catch (err) {
      const errorMsg = err.message || 'An error occurred updating profile';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Helper functions
   */
  const isAuthenticated = useCallback(() => {
    return user !== null && session !== null;
  }, [user, session]);

  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const shareWithChildren = {
    // State
    user,
    loading,
    error,
    session,

    // Auth methods
    login,
    adminLogin,
    register,
    loginWithOAuth,
    logout,
    resetPassword,
    updatePassword,
    updateUserProfile,

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
    throw new Error('useAuth must be used within AuthContext provider');
  }
  return context;
};

