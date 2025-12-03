import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

/**
 * Transform user data from Supabase
 */
const enrichUser = (supabaseUser, profileData = {}) => {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: profileData?.full_name || supabaseUser.user_metadata?.full_name || '',
    phone: profileData?.phone || supabaseUser.user_metadata?.phone || '',
    avatar: profileData?.avatar_url || supabaseUser.user_metadata?.avatar_url || '',
    role: profileData?.role || supabaseUser.user_metadata?.role || 'user',
    status: profileData?.status || 'active',
    country: profileData?.country || '',
    city: profileData?.city || '',
    bio: profileData?.bio || '',
    preferences: profileData?.preferences || [],
    language: profileData?.language || 'en',
    newsletter: profileData?.newsletter !== false,
    emailVerified: supabaseUser.email_confirmed_at !== null,
    createdAt: supabaseUser.created_at,
  };
};

/**
 * Auth Context Provider
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch user profile from database
   */
  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile not found:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (sessionData?.session) {
          setSession(sessionData.session);

          // Fetch user profile
          const profile = await fetchUserProfile(sessionData.session.user.id);
          const enrichedUser = enrichUser(sessionData.session.user, profile);

          // Check if user is active
          if (profile?.status !== 'active') {
            console.warn('User account is not active');
            setUser(null);
            setSession(null);
            await supabase.auth.signOut();
          } else {
            setUser(enrichedUser);
          }
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUserProfile]);

  /**
   * Listen to auth state changes
   */
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);

        try {
          if (newSession?.user) {
            setSession(newSession);

            // Fetch updated profile
            const profile = await fetchUserProfile(newSession.user.id);

            // Check if user is active
            if (profile?.status !== 'active') {
              console.warn('User account is not active');
              setUser(null);
              await supabase.auth.signOut();
            } else {
              const enrichedUser = enrichUser(newSession.user, profile);
              setUser(enrichedUser);
            }
          } else {
            setSession(null);
            setUser(null);
          }
        } catch (err) {
          console.error('Error handling auth state change:', err);
          setError(err.message);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      setError(null);
      setLoading(true);

      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name || '',
            phone: userData.phone || '',
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      const userId = authData.user.id;

      // Create profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email,
            full_name: userData.name || '',
            phone: userData.phone || '',
            avatar_url: userData.avatar || null,
            country: userData.country || '',
            city: userData.city || '',
            bio: userData.bio || '',
            preferences: userData.preferences || [],
            language: userData.language || 'en',
            newsletter: userData.newsletter !== false,
            role: 'user',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        // Rollback: delete auth user
        await supabase.auth.admin?.deleteUser(userId).catch(() => {});
        throw profileError;
      }

      console.log('✅ Sign up successful');
      return { success: true };
    } catch (err) {
      console.error('❌ Sign up error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!data.user) throw new Error('Login failed');

      // Fetch profile
      const profile = await fetchUserProfile(data.user.id);

      // Check if user is active
      if (profile?.status !== 'active') {
        await supabase.auth.signOut();
        throw new Error('User account is inactive');
      }

      const enrichedUser = enrichUser(data.user, profile);
      setUser(enrichedUser);
      setSession(data.session);

      console.log('✅ Sign in successful');
      return { success: true };
    } catch (err) {
      console.error('❌ Sign in error:', err);
      setError(err.message);
      setUser(null);
      setSession(null);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      setUser(null);
      setSession(null);

      console.log('✅ Sign out successful');
      return { success: true };
    } catch (err) {
      console.error('❌ Sign out error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      if (!user) throw new Error('No user logged in');

      setError(null);
      setLoading(true);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const enrichedUser = enrichUser(session.user, data);
      setUser(enrichedUser);

      console.log('✅ Profile updated');
      return { success: true };
    } catch (err) {
      console.error('❌ Update profile error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  /**
   * Change password
   */
  const changePassword = useCallback(async (newPassword) => {
    try {
      setError(null);
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      console.log('✅ Password changed');
      return { success: true };
    } catch (err) {
      console.error('❌ Change password error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return !!user && !!session && user.status === 'active';
  }, [user, session]);

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback(() => {
    return isAuthenticated() && user?.role === 'admin';
  }, [user, isAuthenticated]);

  /**
   * Check if user is active
   */
  const isActive = useCallback(() => {
    return user?.status === 'active';
  }, [user]);

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    isAuthenticated,
    isAdmin,
    isActive,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};