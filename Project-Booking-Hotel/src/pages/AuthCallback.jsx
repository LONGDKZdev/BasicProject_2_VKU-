import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/SimpleAuthContext';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, loginManual } = useAuth();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing login...');
  const hasProcessed = useRef(false); // Tránh chạy 2 lần trong React StrictMode
  
  useEffect(() => {
    // Tránh chạy 2 lần trong React StrictMode
    if (hasProcessed.current) {
      console.log('⏭️ AuthCallback already processed, skipping...');
      return;
    }
    hasProcessed.current = true;
    
    const handleCallback = async () => {
      // Declare variables outside try block để có thể dùng trong catch
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Parse cả query params và hash fragment (Supabase OAuth dùng hash, C# API dùng query)
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1)); // Bỏ '#' đầu tiên
      
      // Ưu tiên query params (C# API), fallback sang hash params (Supabase OAuth)
      let code = urlParams.get('code') || hashParams.get('code') || searchParams.get('code');
      let provider = urlParams.get('provider') || hashParams.get('provider') || searchParams.get('provider') || 
                      (window.location.href.includes('google') ? 'google' : 
                       window.location.href.includes('facebook') ? 'facebook' : 'google');
      let emailFromQuery = urlParams.get('email') || hashParams.get('email') || searchParams.get('email');
      let nameFromQuery = urlParams.get('name') || hashParams.get('name') || searchParams.get('name');
      let errorFromQuery = urlParams.get('error') || hashParams.get('error') || searchParams.get('error');
      
      console.log('🔍 AuthCallback - Initial parsed params:', {
        code: code ? 'present' : 'null',
        provider,
        emailFromQuery: emailFromQuery ? 'present' : 'null',
        nameFromQuery: nameFromQuery ? 'present' : 'null',
        errorFromQuery: errorFromQuery ? 'present' : 'null',
        url: window.location.href.substring(0, 150),
        hasHash: window.location.hash.length > 0,
        hasQuery: window.location.search.length > 0
      });
      
      // Đợi một chút để C# API kịp xử lý (nếu có code nhưng chưa có email)
      if (code && !emailFromQuery && !errorFromQuery) {
        console.log('⏳ Waiting for C# API to process OAuth callback (code present but no email yet)...');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Đợi 1.5 giây để C# API xử lý
        
        // Re-parse sau khi đợi (C# API có thể đã redirect với email trong URL)
        const urlParamsAfterWait = new URLSearchParams(window.location.search);
        emailFromQuery = emailFromQuery || urlParamsAfterWait.get('email');
        nameFromQuery = nameFromQuery || urlParamsAfterWait.get('name');
        
        if (emailFromQuery) {
          console.log('✅ Email received after wait:', emailFromQuery);
        }
      }
      
      // Final values sau khi đợi
      const finalEmail = emailFromQuery;
      const finalName = nameFromQuery;
      
      try {

        if (errorFromQuery) {
          setStatus('error');
          setMessage(errorFromQuery);
          // Tắt auto-redirect - user sẽ click button để quay lại
          return;
        }
        
        if (!finalEmail || finalEmail === '' || (finalEmail && finalEmail.trim() === '')) {
          console.warn('⚠️ C# API returned empty email, redirecting to Supabase OAuth');
          console.log('OAuth callback received empty email:', { finalEmail, finalName, provider, code });
          
          // C# API có vấn đề, redirect về Supabase OAuth để user login lại
          try {
            // Thử check Supabase session trước (có thể đã có từ lần trước)
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (!sessionError && session?.user) {
              // Có session từ Supabase, xử lý như bình thường
              const supabaseUser = session.user;
              
              const { data: existingUser, error: dbError } = await supabase
                .from('users')
                .select('*')
                .eq('email', supabaseUser.email)
                .single();

              if (dbError && dbError.code !== 'PGRST116') {
                console.error('Database error:', dbError);
              }

              if (!existingUser) {
                // Tạo user mới
                const { data: newUser, error: createError } = await supabase
                  .from('users')
                  .insert([{
                    email: supabaseUser.email,
                    full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
                    is_admin: false,
                    is_email_verified: true,
                    password_hash: 'oauth_user'
                  }])
                  .select()
                  .single();

                if (createError) {
                  // Nếu user đã tồn tại (duplicate key), fetch lại user đó
                  if (createError.code === '23505' || createError.message?.includes('duplicate key')) {
                    console.log('User already exists, fetching existing user...');
                    const { data: existingUserData, error: fetchError } = await supabase
                      .from('users')
                      .select('*')
                      .eq('email', supabaseUser.email)
                      .single();

                    if (fetchError || !existingUserData) {
                      console.error('Error fetching existing user:', fetchError);
                      throw new Error(`Unable to create or fetch account: ${createError.message}`);
                    }

                    // User đã tồn tại, login với user đó
                    const { error: updateError } = await supabase
                      .from('users')
                      .update({ last_login: new Date().toISOString() })
                      .eq('id', existingUserData.id);

                    if (updateError) {
                      console.warn('Error updating last_login:', updateError);
                    }

                    loginManual(existingUserData);

                    const passwordHash = String(existingUserData.password_hash || '').trim();
                    if (passwordHash === 'oauth_user' || passwordHash === '' || !passwordHash) {
                      setStatus('success');
                      setMessage('Login successful! Please set password.');
                      setTimeout(() => {
                        navigate(`/set-password?email=${encodeURIComponent(supabaseUser.email)}`);
                      }, 2000);
                      return;
                    }

                    setStatus('success');
                    setMessage('Login successful!');
                    setTimeout(() => navigate('/'), 2000);
                    return;
                  } else {
                    // Lỗi khác, throw error
                    console.error('Error creating user:', createError);
                    throw new Error(`Unable to create account: ${createError.message}`);
                  }
                }

                if (!newUser) {
                  throw new Error('Account creation failed - no data received');
                }

                setUser(newUser);
                setStatus('success');
                setMessage('Login successful! Please set password.');
                setTimeout(() => {
                  navigate(`/set-password?email=${encodeURIComponent(supabaseUser.email)}`);
                }, 2000);
                return;
              } else {
                // Update last_login
                const { error: updateError } = await supabase
                  .from('users')
                  .update({ last_login: new Date().toISOString() })
                  .eq('id', existingUser.id);

                if (updateError) {
                  console.warn('Error updating last_login:', updateError);
                }

                loginManual(existingUser);

                const passwordHash = String(existingUser.password_hash || '').trim();
                if (passwordHash === 'oauth_user' || passwordHash === '' || !passwordHash) {
                  setStatus('success');
                  setMessage('Login successful! Please set password.');
                  setTimeout(() => {
                    navigate(`/set-password?email=${encodeURIComponent(supabaseUser.email)}`);
                  }, 2000);
                  return;
                }

                setStatus('success');
                setMessage('Login successful!');
                setTimeout(() => navigate('/'), 2000);
                return;
              }
            } else {
              // Không có Supabase session, redirect về Supabase OAuth
              console.log('No Supabase session, redirecting to Supabase OAuth...');
              setStatus('processing');
              setMessage('C# API is not available. Redirecting to Google login via Supabase...');
              
              // Clear Supabase session một lần nữa để chắc chắn
              try {
                await supabase.auth.signOut();
                
                // Clear localStorage
                const allKeys = Object.keys(localStorage);
                allKeys.forEach(key => {
                  if (key.startsWith('sb-') || key.includes('supabase') || key.includes('google') || key.includes('oauth')) {
                    localStorage.removeItem(key);
                  }
                });
                sessionStorage.clear();
                
                console.log('🧹 Cleared all Supabase cache before OAuth redirect');
              } catch (clearError) {
                console.warn('Error clearing cache before redirect:', clearError);
              }
              
              // Redirect về Supabase OAuth
              try {
                const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                  provider: provider || 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                      prompt: 'select_account',  // Force select account
                      access_type: 'offline'     // Get refresh token
                    }
                  }
                });

                if (oauthError) {
                  console.error('Supabase OAuth redirect error:', oauthError);
                  setStatus('error');
                  setMessage('OAuth authentication failed. Please try again or use email/password login.');
                  return;
                }

                // Đang redirect, không cần làm gì thêm
                // Supabase sẽ redirect về /auth/callback với session
                return;
              } catch (redirectError) {
                console.error('Error redirecting to Supabase OAuth:', redirectError);
                setStatus('error');
                setMessage('OAuth authentication failed. Please check if C# API is running or try again.');
                return;
              }
            }
          } catch (fallbackError) {
            console.error('Supabase OAuth fallback also failed:', fallbackError);
            setStatus('error');
            setMessage('OAuth authentication failed: Email not received. Please try again or use email/password login.');
            return;
          }
        }

        // Kiểm tra email có hợp lệ không (không rỗng và có @)
        if (finalEmail && finalEmail.trim() !== '' && finalEmail.includes('@')) {
          // User info đã được C# API xử lý và redirect về đây
          try {
            const { data: existingUser, error: dbError } = await supabase
              .from('users')
              .select('*')
              .eq('email', finalEmail)
              .single();

            // Nếu có lỗi và không phải "not found", throw error
            if (dbError) {
              if (dbError.code === 'PGRST116') {
                // User không tồn tại, sẽ tạo mới
              } else {
                console.error('Database error when finding user:', dbError);
                throw new Error(`Database error: ${dbError.message}`);
              }
            }

            if (!existingUser) {
              // Tạo user mới với password_hash = 'oauth_user' (cần set password sau)
              const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{
                  email: finalEmail,
                  full_name: finalName || finalEmail,
                  is_admin: false,
                  is_email_verified: true,
                  password_hash: 'oauth_user' // Đánh dấu cần set password
                }])
                .select()
                .single();

              if (createError) {
                console.error('Error creating user:', createError);
                throw new Error(`Unable to create account: ${createError.message}`);
              }

              if (!newUser) {
                throw new Error('Account creation failed - no data received');
              }

              // Set user vào context
              try {
                setUser(newUser);
              } catch (setUserError) {
                console.error('Error setting user in context:', setUserError);
                // Vẫn tiếp tục vì user đã được tạo
              }

              // Redirect đến SetPassword để đặt mật khẩu
              setStatus('success');
              setMessage('Login successful! Please set password.');
              setTimeout(() => {
                navigate(`/set-password?email=${encodeURIComponent(finalEmail)}`);
              }, 3000);
              return;
            } else {
              // User đã tồn tại
              // Update last_login
              const { error: updateError } = await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', existingUser.id);

              if (updateError) {
                console.warn('Error updating last_login:', updateError);
                // Không throw, chỉ log warning
              }

              // Set user vào context
              try {
                setUser(existingUser);
              } catch (setUserError) {
                console.error('Error setting user in context:', setUserError);
                throw new Error('Error When Login');
              }

              // Check xem user có cần set password không (trim để tránh whitespace)
              const passwordHash = String(existingUser.password_hash || '').trim();
              if (passwordHash === 'oauth_user' || passwordHash === '' || !passwordHash) {
                setStatus('success');
                setMessage('Login successful! Please set password.');
                setTimeout(() => {
                  navigate(`/set-password?email=${encodeURIComponent(finalEmail)}`);
                }, 3000);
                return;
              }

              // User đã có password, login thành công
              setStatus('success');
              setMessage('Login successful!');
              setTimeout(() => navigate('/'), 5000);
              return;
            }
          } catch (userError) {
            console.error('Error processing user:', userError);
            throw userError; // Re-throw để catch ở ngoài
          }
        }

        // Ưu tiên: Thử xử lý qua C# API trước (nếu có code)
        if (code) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 giây timeout
            
            const response = await fetch(`${API_URL}/api/auth/${provider}/callback?code=${code}`, {
              method: 'GET',
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            // C# API sẽ redirect, không cần xử lý response ở đây
            if (response.redirected) {
              // Đã được redirect, sẽ xử lý ở lần load tiếp theo
              return;
            }

            if (response.ok) {
              const result = await response.json();
              if (result.success && result.user) {
                // Lưu user vào database nếu chưa có
                const { data: existingUser, error: dbError } = await supabase
                  .from('users')
                  .select('*')
                  .eq('email', result.user.email)
                  .single();

                if (dbError && dbError.code !== 'PGRST116') {
                  console.error('Database error:', dbError);
                }

                if (!existingUser) {
                  // Tạo user mới với password_hash = 'oauth_user' (cần set password sau)
                  const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([{
                      email: result.user.email,
                      full_name: result.user.name || result.user.email,
                      is_admin: false,
                      is_email_verified: true,
                      password_hash: 'oauth_user' // Đánh dấu cần set password
                    }])
                    .select()
                    .single();

                  if (createError) {
                    // Nếu user đã tồn tại (duplicate key), fetch lại user đó
                    if (createError.code === '23505' || createError.message?.includes('duplicate key')) {
                      console.log('User already exists, fetching existing user...');
                      const { data: existingUserData, error: fetchError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', result.user.email)
                        .single();

                      if (fetchError || !existingUserData) {
                        console.error('Error fetching existing user:', fetchError);
                        throw new Error(`Unable to create or fetch account: ${createError.message}`);
                      }

                      // User đã tồn tại, login với user đó
                      const { error: updateError } = await supabase
                        .from('users')
                        .update({ last_login: new Date().toISOString() })
                        .eq('id', existingUserData.id);

                      if (updateError) {
                        console.warn('Error updating last_login:', updateError);
                      }

                      try {
                        setUser(existingUserData);
                      } catch (setUserError) {
                        console.error('Error setting user in context:', setUserError);
                      }

                      const passwordHash = String(existingUserData.password_hash || '').trim();
                      if (passwordHash === 'oauth_user' || passwordHash === '' || !passwordHash) {
                        setStatus('success');
                        setMessage('Login successful! Please set password.');
                        setTimeout(() => {
                          navigate(`/set-password?email=${encodeURIComponent(result.user.email)}`);
                        }, 2000);
                        return;
                      }

                      setStatus('success');
                      setMessage('Login successful!');
                      setTimeout(() => navigate('/'), 2000);
                      return;
                    } else {
                      // Lỗi khác, throw error
                      console.error('Error creating user:', createError);
                      throw new Error(`Unable to create account: ${createError.message}`);
                    }
                  }

                  if (!newUser) {
                    throw new Error('Account creation failed - no data received');
                  }

                  // Set user vào context
                  try {
                    setUser(newUser);
                  } catch (setUserError) {
                    console.error('Error setting user in context:', setUserError);
                  }

                  // Redirect đến SetPassword để đặt mật khẩu
                  setStatus('success');
                  setMessage('Login successful! Please set password.');
                  setTimeout(() => {
                    navigate(`/set-password?email=${encodeURIComponent(result.user.email)}`);
                  }, 3000);
                  return;
                } else {
                  // Update last_login
                  const { error: updateError } = await supabase
                    .from('users')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', existingUser.id);

                  if (updateError) {
                    console.warn('Error updating last_login:', updateError);
                  }

                  // Set user vào context
                  try {
                    setUser(existingUser);
                  } catch (setUserError) {
                    console.error('Error setting user in context:', setUserError);
                    throw new Error('Error when logging in');
                  }

                  // Check xem user có cần set password không (trim để tránh whitespace)
                  const passwordHash = String(existingUser.password_hash || '').trim();
                  if (passwordHash === 'oauth_user' || passwordHash === '' || !passwordHash) {
                    setStatus('success');
                    setMessage('Login successful! Please set password.');
                    setTimeout(() => {
                      navigate(`/set-password?email=${encodeURIComponent(result.user.email)}`);
                    }, 3000);
                    return;
                  }

                  // User đã có password, login thành công
                  setStatus('success');
                  setMessage('Login successful!');
                  setTimeout(() => navigate('/'), 5000);
                  return;
                }
              }
            }
          } catch (apiError) {
            // C# API không khả dụng hoặc timeout, fallback sang Supabase
            if (apiError.name === 'AbortError') {
              console.warn('C# API timeout, falling back to Supabase OAuth');
            } else {
              console.warn('C# API callback failed, trying Supabase fallback:', apiError);
            }
            // Tiếp tục với Supabase fallback
          }
        }

        // Fallback: Xử lý qua Supabase Auth (chỉ khi không có code hoặc C# API fail)
        // QUAN TRỌNG: Supabase Auth chỉ dùng để OAuth, sau đó sync vào public.users
        // Clear session cũ trước khi check (để tránh dùng account cũ)
        try {
          // Đảm bảo không có session cũ
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) {
            console.warn('Error signing out old session:', signOutError);
          }
        } catch (e) {
          console.warn('Error clearing old session:', e);
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase session error:', error);
          throw error;
        }

        if (session?.user) {
          const supabaseUser = session.user;
          
          console.log('✅ Supabase OAuth session found:', {
            email: supabaseUser.email,
            id: supabaseUser.id,
            metadata: supabaseUser.user_metadata
          });
          
          // QUAN TRỌNG: Sync từ auth.users (Supabase) vào public.users (database riêng)
          // Check xem user đã tồn tại trong public.users chưa
          const { data: existingUser, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('email', supabaseUser.email)
            .single();

          if (dbError && dbError.code !== 'PGRST116') {
            console.error('Database error:', dbError);
          }

          if (!existingUser) {
            // Tạo user mới với password_hash = 'oauth_user' (cần set password sau)
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{
                email: supabaseUser.email,
                full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
                is_admin: false,
                is_email_verified: true,
                password_hash: 'oauth_user' // Đánh dấu cần set password
              }])
              .select()
              .single();

            if (createError) {
              // Nếu user đã tồn tại (duplicate key), fetch lại user đó
              if (createError.code === '23505' || createError.message?.includes('duplicate key')) {
                console.log('User already exists, fetching existing user...');
                const { data: existingUserData, error: fetchError } = await supabase
                  .from('users')
                  .select('*')
                  .eq('email', supabaseUser.email)
                  .single();

                if (fetchError || !existingUserData) {
                  console.error('Error fetching existing user:', fetchError);
                  throw new Error(`Unable to create or fetch account: ${createError.message}`);
                }

                // User đã tồn tại, login với user đó
                const { error: updateError } = await supabase
                  .from('users')
                  .update({ last_login: new Date().toISOString() })
                  .eq('id', existingUserData.id);

                if (updateError) {
                  console.warn('Error updating last_login:', updateError);
                }

                try {
                  loginManual(existingUserData);
                } catch (setUserError) {
                  console.error('Error setting user in context:', setUserError);
                }

                const passwordHash = String(existingUserData.password_hash || '').trim();
                if (passwordHash === 'oauth_user' || passwordHash === '' || !passwordHash) {
                  setStatus('success');
                  setMessage('Login successful! Please set password.');
                  setTimeout(() => {
                    navigate(`/set-password?email=${encodeURIComponent(supabaseUser.email)}`);
                  }, 2000);
                  return;
                }

                setStatus('success');
                setMessage('Login successful!');
                setTimeout(() => navigate('/'), 2000);
                return;
              } else {
                // Lỗi khác, throw error
                console.error('Error creating user:', createError);
                throw new Error(`Unable to create account: ${createError.message}`);
              }
            }

            if (!newUser) {
              throw new Error('Account creation failed - no data received');
            }

            // Set user vào context
            try {
              setUser(newUser);
            } catch (setUserError) {
              console.error('Error setting user in context:', setUserError);
            }

            // Redirect đến SetPassword để đặt mật khẩu
            setStatus('success');
            setMessage('Login successful! Please set password.');
            setTimeout(() => {
              navigate(`/set-password?email=${encodeURIComponent(supabaseUser.email)}`);
            }, 3000);
            return;
          } else {
            // Update last_login
            const { error: updateError } = await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', existingUser.id);

            if (updateError) {
              console.warn('Error updating last_login:', updateError);
            }

            // Set user vào context
            try {
              loginManual(existingUser);
            } catch (setUserError) {
              console.error('Error setting user in context:', setUserError);
              throw new Error('Error when logging in');
            }

            // Check xem user có cần set password không (trim để tránh whitespace)
            const passwordHash = String(existingUser.password_hash || '').trim();
            if (passwordHash === 'oauth_user' || passwordHash === '' || !passwordHash) {
              setStatus('success');
              setMessage('Login successful! Please set password.');
              setTimeout(() => {
                navigate(`/set-password?email=${encodeURIComponent(supabaseUser.email)}`);
              }, 3000);
              return;
            }

            // User đã có password, login thành công
            setStatus('success');
            setMessage('Login successful!');
            setTimeout(() => navigate('/'), 5000);
            return;
          }
        }

        // Nếu đến đây mà không có email hợp lệ và không có session, hiển thị error
        setStatus('error');
        setMessage('OAuth authentication failed: Email not received. Please try again or use email/password login.');
        console.error('OAuth callback failed: No valid email and no Supabase session', { 
          emailFromQuery, 
          nameFromQuery, 
          provider, 
          code 
        });
        // Tắt auto-redirect - user sẽ click button để quay lại
      } catch (err) {
        console.error('Callback error:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        setStatus('error');
        setMessage(err.message || 'An error occurred. Please try again.');
        console.error('AuthCallback error details:', {
          finalEmail,
          finalName,
          provider,
          code,
          error: err.message,
          stack: err.stack
        });
        // Tắt auto-redirect - user sẽ click button để quay lại
      }
    };

    handleCallback();
  }, [navigate, searchParams, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-accent/20 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <FaSpinner className="animate-spin text-4xl text-accent mx-auto mb-4" />
            <p className="text-lg text-primary">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
            <p className="text-lg text-primary font-semibold">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <p className="text-lg text-primary">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 btn btn-primary"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;

