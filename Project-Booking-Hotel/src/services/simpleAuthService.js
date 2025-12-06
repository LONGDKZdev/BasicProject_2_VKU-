/**
 * Simple Authentication Service
 * Không dùng Supabase Auth, chỉ dùng Supabase như database
 * Hash password bằng Web Crypto API (SHA-256)
 */

import { supabase } from '../utils/supabaseClient';

/**
 * Hash password đơn giản bằng SHA-256
 * Lưu ý: Trong production nên dùng bcrypt, nhưng để đơn giản dùng SHA-256 + salt
 */
export const hashPassword = async (password) => {
  // Tạo salt ngẫu nhiên
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Hash password + salt
  const encoder = new TextEncoder();
  const data = encoder.encode(password + saltHex);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Trả về hash + salt (để verify sau)
  return `${saltHex}:${hashHex}`;
};

/**
 * Verify password
 */
export const verifyPassword = async (password, passwordHash) => {
  try {
    // Kiểm tra passwordHash hợp lệ và trim
    if (!passwordHash) {
      console.error('Password hash is null or undefined');
      return false;
    }
    
    // Convert to string and trim
    const hashStr = String(passwordHash).trim();
    
    if (!hashStr || hashStr.length === 0) {
      console.error('Password hash is empty after trim');
      return false;
    }

    // Split salt và hash
    const parts = hashStr.split(':');
    if (parts.length !== 2) {
      console.error('Password hash format incorrect. Expected "salt:hash"');
      console.error('Got:', hashStr.substring(0, 100));
      console.error('Parts count:', parts.length);
      return false;
    }

    const [saltHex, storedHash] = parts.map(p => p.trim());
    
    if (!saltHex || !storedHash) {
      console.error('Salt or hash is missing after split');
      console.error('Salt:', saltHex ? saltHex.substring(0, 20) + '...' : 'null');
      console.error('Hash:', storedHash ? storedHash.substring(0, 20) + '...' : 'null');
      return false;
    }

    // Hash password với salt (đảm bảo format giống khi hash)
    const encoder = new TextEncoder();
    const data = encoder.encode(password + saltHex);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // So sánh hash (case-sensitive)
    const isValid = hashHex === storedHash;
    
    if (!isValid) {
      console.warn('Password verification failed');
      console.warn('Password:', password);
      console.warn('Salt:', saltHex);
      console.warn('Expected hash length:', storedHash.length);
      console.warn('Computed hash length:', hashHex.length);
      console.warn('Expected hash (first 20):', storedHash.substring(0, 20));
      console.warn('Computed hash (first 20):', hashHex.substring(0, 20));
      console.warn('Hashes match:', hashHex === storedHash);
    } else {
      console.log('✅ Password verified successfully');
    }
    
    return isValid;
  } catch (err) {
    console.error('Error verifying password:', err);
    return false;
  }
};

/**
 * Register user mới
 */
export const registerUser = async (email, password, fullName = '') => {
  try {
    // Kiểm tra email đã tồn tại chưa
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Tạo email verification token
    const verificationToken = crypto.getRandomValues(new Uint8Array(32));
    const tokenHex = Array.from(verificationToken).map(b => b.toString(16).padStart(2, '0')).join('');

    // Insert user
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        full_name: fullName,
        is_admin: false,
        is_email_verified: false, // Có thể bật email verification sau
        email_verification_token: tokenHex,
      })
      .select()
      .single();

    if (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }

    // Tự động verify email cho đơn giản (có thể bỏ nếu muốn verify qua email)
    await supabase
      .from('users')
      .update({ is_email_verified: true, email_verification_token: null })
      .eq('id', data.id);

    return {
      success: true,
      user: {
        id: data.id,
        email: data.email,
        name: data.full_name,
        isAdmin: data.is_admin,
      },
    };
  } catch (err) {
    console.error('Register error:', err);
    return { success: false, error: err.message || 'Registration failed' };
  }
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  try {
    // Tìm user theo email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      console.error('User not found:', error);
      return { success: false, error: 'Invalid email or password' };
    }

    // Kiểm tra password_hash có tồn tại không
    if (!user.password_hash) {
      console.error('User has no password hash');
      return { success: false, error: 'Invalid email or password' };
    }

    // Trim password_hash để tránh khoảng trắng
    const passwordHash = String(user.password_hash).trim();
    
    console.log('Attempting login for:', email);
    console.log('Password hash length:', passwordHash.length);
    console.log('Password hash format:', passwordHash.substring(0, 50) + '...');
    console.log('Password hash has colon:', passwordHash.includes(':'));

    // Verify password
    const isValid = await verifyPassword(password, passwordHash);
    if (!isValid) {
      console.error('Password verification failed for:', email);
      return { success: false, error: 'Invalid email or password' };
    }

    console.log('Login successful for:', email);

    // Update last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone,
        avatar: user.avatar_url,
        country: user.country,
        city: user.city,
        preferences: user.preferences || [],
        language: user.language || 'en',
        newsletter: user.newsletter,
        bio: user.bio,
        isAdmin: user.is_admin,
        emailVerified: user.is_email_verified,
        createdAt: user.created_at,
      },
    };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: err.message || 'Login failed' };
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email) => {
  try {
    // Tìm user
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (!user) {
      // Không báo lỗi để tránh email enumeration
      return { success: true };
    }

    // Tạo reset code
    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Hết hạn sau 1 giờ

    // Lưu vào password_reset_requests
    await supabase
      .from('password_reset_requests')
      .insert({
        email: email.toLowerCase().trim(),
        code: resetCode,
        expires_at: expiresAt.toISOString(),
      });

    // Gửi email với reset code
    try {
      const { sendResetCodeEmail, isEmailConfigured } = await import('../utils/emailService');
      
      if (isEmailConfigured()) {
        // Email service đã được config - gửi email thật
        const emailResult = await sendResetCodeEmail(email, resetCode);
        if (!emailResult.success) {
          console.warn('Failed to send reset email, but code was saved:', emailResult.error);
        }
      } else {
        // Email service chưa config - log ra console (cho development)
        console.log('Password reset code for', email, ':', resetCode);
        console.log('Note: Email service not configured. In production, configure EmailJS to send emails automatically.');
      }
    } catch (emailError) {
      console.warn('Email service error (code still saved):', emailError);
      // Vẫn trả về success vì code đã được lưu vào DB
    }

    return { success: true, resetCode }; // Trả về code để test (trong production không nên nếu email đã được gửi)
  } catch (err) {
    console.error('Password reset error:', err);
    return { success: false, error: err.message || 'Failed to request password reset' };
  }
};

/**
 * Reset password với code
 */
export const resetPassword = async (email, code, newPassword) => {
  try {
    // Tìm reset request hợp lệ
    const { data: resetRequest } = await supabase
      .from('password_reset_requests')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('code', code.toUpperCase())
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!resetRequest) {
      return { success: false, error: 'Invalid or expired reset code' };
    }

    // Hash password mới
    const passwordHash = await hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', email.toLowerCase().trim());

    if (updateError) {
      return { success: false, error: updateError.message || 'Failed to reset password' };
    }

    // Đánh dấu reset request đã dùng
    await supabase
      .from('password_reset_requests')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetRequest.id);

    return { success: true };
  } catch (err) {
    console.error('Reset password error:', err);
    return { success: false, error: err.message || 'Failed to reset password' };
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.full_name,
      phone: data.phone,
      avatar: data.avatar_url,
      country: data.country,
      city: data.city,
      preferences: data.preferences || [],
      language: data.language || 'en',
      newsletter: data.newsletter,
      bio: data.bio,
      isAdmin: data.is_admin,
      emailVerified: data.is_email_verified,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Get user error:', err);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const updateData = {};
    if (updates.name !== undefined) updateData.full_name = updates.name;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.avatar !== undefined) updateData.avatar_url = updates.avatar;
    if (updates.country !== undefined) updateData.country = updates.country;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.preferences !== undefined) updateData.preferences = updates.preferences;
    if (updates.language !== undefined) updateData.language = updates.language;
    if (updates.newsletter !== undefined) updateData.newsletter = updates.newsletter;
    if (updates.bio !== undefined) updateData.bio = updates.bio;

    // Optional: update email nếu được truyền vào và khác hiện tại
    if (updates.email !== undefined) {
      const newEmail = updates.email.toLowerCase().trim();
      if (!newEmail.includes('@')) {
        return { success: false, error: 'Invalid email address' };
      }

      // Kiểm tra trùng email với user khác
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', newEmail)
        .neq('id', userId)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'Email is already in use' };
      }

      updateData.email = newEmail;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: {
        id: data.id,
        email: data.email,
        name: data.full_name,
        phone: data.phone,
        avatar: data.avatar_url,
        country: data.country,
        city: data.city,
        preferences: data.preferences || [],
        language: data.language || 'en',
        newsletter: data.newsletter,
        bio: data.bio,
        isAdmin: data.is_admin,
        emailVerified: data.is_email_verified,
        createdAt: data.created_at,
      },
    };
  } catch (err) {
    console.error('Update profile error:', err);
    return { success: false, error: err.message || 'Failed to update profile' };
  }
};

/**
 * Change password
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Lấy user
    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message || 'Failed to change password' };
    }

    return { success: true };
  } catch (err) {
    console.error('Change password error:', err);
    return { success: false, error: err.message || 'Failed to change password' };
  }
};

