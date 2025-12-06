import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/SimpleAuthContext';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
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
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (emailFromQuery) {
          // User info đã được C# API xử lý và redirect về đây
          const { data: existingUser, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('email', emailFromQuery)
            .single();

          if (dbError && dbError.code !== 'PGRST116') {
            console.error('Database error:', dbError);
          }

          if (!existingUser) {
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{
                email: emailFromQuery,
                full_name: nameFromQuery || emailFromQuery,
                is_admin: false,
                is_email_verified: true,
                password_hash: 'oauth_user'
              }])
              .select()
              .single();

            if (createError) {
              console.error('Error creating user:', createError);
            } else if (newUser) {
              setUser(newUser);
              setStatus('success');
              setMessage('Login successful!');
              setTimeout(() => navigate('/'), 2000);
              return;
            }
          } else {
            await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', existingUser.id);
            
            setUser(existingUser);
            setStatus('success');
            setMessage('Login successful!');
            setTimeout(() => navigate('/'), 2000);
            return;
          }
        }

        // Thử xử lý qua C# API trước (nếu có code)
        if (code) {
          try {
            const response = await fetch(`${API_URL}/api/auth/${provider}/callback?code=${code}`, {
              method: 'GET'
            });

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
                  // Tạo user mới
                  const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([{
                      email: result.user.email,
                      full_name: result.user.name || result.user.email,
                      is_admin: false,
                      is_email_verified: true,
                      password_hash: 'oauth_user'
                    }])
                    .select()
                    .single();

                  if (createError) {
                    console.error('Error creating user:', createError);
                  } else if (newUser) {
                    setUser(newUser);
                    setStatus('success');
                    setMessage('Login successful!');
                    setTimeout(() => navigate('/'), 2000);
                    return;
                  }
                } else {
                  // Update last_login
                  await supabase
                    .from('users')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', existingUser.id);
                  
                  setUser(existingUser);
                  setStatus('success');
                  setMessage('Login successful!');
                  setTimeout(() => navigate('/'), 2000);
                  return;
                }
              }
            }
          } catch (apiError) {
            console.warn('C# API callback failed, trying Supabase fallback:', apiError);
          }
        }

        // Fallback: Xử lý qua Supabase Auth
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
              console.error('Error creating user:', createError);
            } else if (newUser) {
              setUser(newUser);
              setStatus('success');
              setMessage('Login successful!');
              setTimeout(() => navigate('/'), 2000);
              return;
            }
          } else {
            await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', existingUser.id);
            
            setUser(existingUser);
            setStatus('success');
            setMessage('Login successful!');
            setTimeout(() => navigate('/'), 2000);
            return;
          }
        }

        setStatus('error');
        setMessage('Login failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('error');
        setMessage('An error occurred. Redirecting to login...');
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

