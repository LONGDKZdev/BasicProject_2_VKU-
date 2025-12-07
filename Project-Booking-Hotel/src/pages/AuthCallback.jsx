import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const code = searchParams.get('code');
        const provider = searchParams.get('provider') || 
                        (window.location.href.includes('google') ? 'google' : 
                         window.location.href.includes('facebook') ? 'facebook' : 'google');

        // Nếu có email và name từ query params (từ C# API redirect)
        const emailFromQuery = searchParams.get('email');
        const nameFromQuery = searchParams.get('name');
        const errorFromQuery = searchParams.get('error');

        if (errorFromQuery) {
          setStatus('error');
          setMessage(errorFromQuery);
          setTimeout(() => navigate('/login'), 5000);
          return;
        }

        if (emailFromQuery) {
          // User info đã được C# API xử lý và redirect về đây
          try {
            const { data: existingUser, error: dbError } = await supabase
              .from('users')
              .select('*')
              .eq('email', emailFromQuery)
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
                  email: emailFromQuery,
                  full_name: nameFromQuery || emailFromQuery,
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
                navigate(`/set-password?email=${encodeURIComponent(emailFromQuery)}`);
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
                  navigate(`/set-password?email=${encodeURIComponent(emailFromQuery)}`);
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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase session error:', error);
          throw error;
        }

        if (session?.user) {
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

        setStatus('error');
        setMessage('Login failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        console.error('Callback error:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        setStatus('error');
        setMessage(err.message || 'An error occurred. Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
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

