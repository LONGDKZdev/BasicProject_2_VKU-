import { supabase } from '../utils/supabaseClient';

/**
 * Authentication service layer for Supabase Auth operations
 */

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Sign in error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.name || '',
          role: userData.role || 'user',
          ...userData,
        },
      },
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Sign up error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Sign in with OAuth provider
 */
export const signInWithProvider = async (provider, redirectUrl = null) => {
  try {
    const redirectTo = redirectUrl || `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('OAuth sign in error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Sign out error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get current session
 */
export const getSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, session };
  } catch (err) {
    console.error('Get session error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user };
  } catch (err) {
    console.error('Get user error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Request password reset
 */
export const resetPasswordRequest = async (email, redirectUrl = null) => {
  try {
    const redirectTo = redirectUrl || `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Password reset request error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Update password with new password
 */
export const updateUserPassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Update password error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Update user metadata
 */
export const updateUserMetadata = async (metadata) => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: metadata,
    });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Update metadata error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Verify email OTP
 */
export const verifyEmail = async (token) => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token,
      type: 'email',
    });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Email verification error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Resend verification error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Fetch user profile from database
 */
export const fetchUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Profile fetch error:', error);
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
export const upsertUserProfile = async (userId, userData) => {
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

/**
 * Listen for auth state changes
 */
export const onAuthStateChange = (callback) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  // Return unsubscribe function
  return () => {
    subscription?.unsubscribe();
  };
};

export default {
  signInWithEmail,
  signUpWithEmail,
  signInWithProvider,
  signOut,
  getSession,
  getCurrentUser,
  resetPasswordRequest,
  updateUserPassword,
  updateUserMetadata,
  verifyEmail,
  resendVerificationEmail,
  fetchUserProfile,
  upsertUserProfile,
  onAuthStateChange,
};