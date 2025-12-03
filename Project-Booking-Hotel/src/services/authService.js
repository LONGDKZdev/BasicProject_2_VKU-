import { supabase } from '../utils/supabaseClient';

/**
 * Authentication service layer for Supabase Auth operations
 * Handles: sign up, sign in, sign out, password reset, profile sync
 */

/**
 * Sign up with email and password
 * Creates auth account + profile in database
 */
export const registerUser = async (email, password, userData = {}) => {
  try {
    // 1. Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.name || '',
          phone: userData.phone || '',
          role: 'user', // Default role
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const userId = authData.user.id;

    // 2. Create profile in database
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId).catch(err => {
        console.error('Error rolling back user creation:', err);
      });
      throw profileError;
    }

    console.log('✅ User registered successfully:', userId);
    return {
      success: true,
      data: {
        user: authData.user,
        session: authData.session,
      },
      message: 'Registration successful. Please check your email for confirmation.',
    };
  } catch (err) {
    console.error('❌ Registration error:', err);
    return {
      success: false,
      error: err.message || 'Registration failed',
    };
  }
};

/**
 * Sign in with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed: No user data');

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.warn('Profile not found, creating from auth data:', profileError);
    }

    console.log('✅ User logged in successfully:', data.user.email);
    return {
      success: true,
      data: {
        user: data.user,
        profile: profile,
        session: data.session,
      },
      message: 'Login successful',
    };
  } catch (err) {
    console.error('❌ Login error:', err);
    return {
      success: false,
      error: err.message || 'Login failed',
    };
  }
};

/**
 * Sign in with OAuth provider (Google, Facebook, etc.)
 */
export const signInWithOAuth = async (provider, redirectUrl = null) => {
  try {
    const baseUrl = window.location.origin;
    const redirectTo = redirectUrl || `${baseUrl}/`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) throw error;

    console.log('✅ OAuth sign in initiated for provider:', provider);
    return {
      success: true,
      data,
      message: `Redirecting to ${provider}...`,
    };
  } catch (err) {
    console.error('❌ OAuth sign in error:', err);
    return {
      success: false,
      error: err.message || 'OAuth sign in failed',
    };
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    console.log('✅ User logged out successfully');
    return {
      success: true,
      message: 'Logout successful',
    };
  } catch (err) {
    console.error('❌ Logout error:', err);
    return {
      success: false,
      error: err.message || 'Logout failed',
    };
  }
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    return {
      success: true,
      data: data.session,
    };
  } catch (err) {
    console.error('❌ Error getting session:', err);
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    return {
      success: true,
      data: data.user,
    };
  } catch (err) {
    console.error('❌ Error getting user:', err);
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
};

/**
 * Get user profile from database
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('❌ Error fetching user profile:', err);
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Profile updated successfully:', userId);
    return {
      success: true,
      data,
      message: 'Profile updated successfully',
    };
  } catch (err) {
    console.error('❌ Error updating profile:', err);
    return {
      success: false,
      error: err.message || 'Profile update failed',
    };
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    console.log('✅ Password updated successfully');
    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (err) {
    console.error('❌ Error updating password:', err);
    return {
      success: false,
      error: err.message || 'Password update failed',
    };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email) => {
  try {
    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw error;

    console.log('✅ Password reset email sent:', email);
    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    };
  } catch (err) {
    console.error('❌ Error sending password reset email:', err);
    return {
      success: false,
      error: err.message || 'Failed to send reset email',
    };
  }
};

/**
 * Check if user is admin
 */
export const isUserAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      isAdmin: data?.role === 'admin',
    };
  } catch (err) {
    console.error('❌ Error checking admin status:', err);
    return {
      success: false,
      isAdmin: false,
      error: err.message,
    };
  }
};

/**
 * Listen to auth state changes (for real-time updates)
 */
export const onAuthStateChange = (callback) => {
  try {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback({
          event,
          session,
          user: session?.user || null,
        });
      }
    );

    return subscription;
  } catch (err) {
    console.error('❌ Error setting up auth state listener:', err);
    return null;
  }
};

/**
 * Refresh session
 */
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;

    return {
      success: true,
      data: data.session,
    };
  } catch (err) {
    console.error('❌ Error refreshing session:', err);
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (email, token) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;

    console.log('✅ Email verified successfully');
    return {
      success: true,
      data,
      message: 'Email verified successfully',
    };
  } catch (err) {
    console.error('❌ Error verifying email:', err);
    return {
      success: false,
      error: err.message || 'Email verification failed',
    };
  }
};