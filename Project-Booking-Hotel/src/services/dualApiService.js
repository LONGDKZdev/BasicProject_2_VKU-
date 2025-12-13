/**
 * Dual API Service
 * Quản lý việc gọi song song C# API và Supabase API với fallback mechanism
 * 
 * Strategy:
 * 1. Ưu tiên gọi C# API trước (với timeout)
 * 2. Nếu C# API fail/timeout → tự động fallback sang Supabase
 * 3. Log rõ ràng method nào được dùng
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEFAULT_TIMEOUT = 5000; // 5 giây

/**
 * Gọi API với timeout và fallback
 * @param {Function} csharpCall - Function gọi C# API
 * @param {Function} supabaseCall - Function gọi Supabase API (fallback)
 * @param {number} timeout - Timeout cho C# API (ms)
 * @returns {Promise} Kết quả từ C# API hoặc Supabase API
 */
export const callWithFallback = async (csharpCall, supabaseCall, timeout = DEFAULT_TIMEOUT) => {
  // Bước 1: Thử gọi C# API trước
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const result = await csharpCall(controller.signal);
    
    clearTimeout(timeoutId);
    
    if (result && result.success !== false) {
      console.log('✅ [Dual API] Success via C# API');
      return { ...result, method: 'csharp' };
    }
    
    // Nếu result.success === false, fallback
    console.warn('⚠️ [Dual API] C# API returned failure, falling back to Supabase');
  } catch (apiError) {
    // C# API không khả dụng hoặc timeout
    if (apiError.name === 'AbortError') {
      console.warn(`⏱️ [Dual API] C# API timeout (${timeout}ms), falling back to Supabase`);
    } else if (apiError.message?.includes('Failed to fetch') || apiError.message?.includes('NetworkError')) {
      console.warn('🌐 [Dual API] C# API network error, falling back to Supabase:', apiError.message);
    } else {
      console.warn('❌ [Dual API] C# API error, falling back to Supabase:', apiError.message);
    }
  }
  
  // Bước 2: Fallback sang Supabase
  try {
    console.log('🔄 [Dual API] Attempting Supabase fallback...');
    const result = await supabaseCall();
    
    if (result && result.success !== false) {
      console.log('✅ [Dual API] Success via Supabase fallback');
      return { ...result, method: 'supabase' };
    }
    
    console.error('❌ [Dual API] Both C# API and Supabase failed');
    return { success: false, error: result?.error || 'Both APIs failed', method: 'none' };
  } catch (fallbackError) {
    console.error('❌ [Dual API] Supabase fallback also failed:', fallbackError);
    return { 
      success: false, 
      error: fallbackError.message || 'Both C# API and Supabase failed', 
      method: 'none' 
    };
  }
};

/**
 * Gọi C# API với error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @param {AbortSignal} signal - Abort signal cho timeout
 * @returns {Promise} API response
 */
export const callCSharpAPI = async (endpoint, options = {}, signal = null) => {
  const url = `${API_URL}${endpoint}`;
  const fetchOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal,
  };
  
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || `HTTP ${response.status}` };
    }
    throw new Error(errorData.message || errorData.error || `API error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Check if C# API is available
 * @returns {Promise<boolean>} True nếu C# API khả dụng
 */
export const checkCSharpAPIAvailability = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 giây để check
    
    const response = await fetch(`${API_URL}/api/auth/oauth/urls`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Health check cho cả 2 APIs
 * @returns {Promise<object>} Status của cả 2 APIs
 */
export const healthCheck = async () => {
  const results = {
    csharp: { available: false, responseTime: null, error: null },
    supabase: { available: false, responseTime: null, error: null },
  };
  
  // Check C# API
  try {
    const startTime = Date.now();
    const available = await checkCSharpAPIAvailability();
    const responseTime = Date.now() - startTime;
    results.csharp = { available, responseTime, error: null };
  } catch (error) {
    results.csharp = { available: false, responseTime: null, error: error.message };
  }
  
  // Check Supabase
  try {
    const { supabase } = await import('../utils/supabaseClient');
    const startTime = Date.now();
    const { error } = await supabase.from('users').select('id').limit(1);
    const responseTime = Date.now() - startTime;
    results.supabase = { 
      available: !error, 
      responseTime, 
      error: error?.message || null 
    };
  } catch (error) {
    results.supabase = { available: false, responseTime: null, error: error.message };
  }
  
  return results;
};

