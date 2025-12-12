/**
 * C# Auth API Service
 * Service để gọi C# backend API cho OAuth và Email
 * 
 * LƯU Ý: Code React hiện tại KHÔNG BỊ THAY ĐỔI
 * Chỉ thêm service mới này để có thể gọi C# API nếu cần
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Google Login via C# API
 * @param {string} idToken - Google ID token từ frontend
 */
export const googleLoginViaAPI = async (idToken) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/google/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('C# API not available for Google login:', error);
    return null;
  }
};

/**
 * Facebook Login via C# API
 * @param {string} accessToken - Facebook access token từ frontend
 */
export const facebookLoginViaAPI = async (accessToken) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/facebook/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('C# API not available for Facebook login:', error);
    return null;
  }
};

/**
 * Send password reset email via C# API
 * @param {string} email - User email
 */
export const sendPasswordResetEmailViaAPI = async (email) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('C# API not available for password reset:', error);
    return null;
  }
};

/**
 * Get OAuth URLs from C# API
 */
export const getOAuthUrls = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/oauth/urls`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('C# API not available for OAuth URLs:', error);
    return null;
  }
};