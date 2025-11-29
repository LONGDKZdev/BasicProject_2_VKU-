import { createContext, useContext, useState, useEffect } from 'react';

const AuthInfo = createContext();

const enrichUser = (data) => ({
  avatar: '',
  phone: '',
  country: '',
  city: '',
  preferences: [],
  language: 'en',
  newsletter: true,
  bio: '',
  ...data,
});

const persistUserSession = (user) => {
  localStorage.setItem('hotel_user', JSON.stringify(user));
};

const updateStoredUsers = (updatedUser) => {
  const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    localStorage.setItem('hotel_users', JSON.stringify(users));
  }
};

export const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('hotel_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('hotel_user');
      }
    }
    setLoading(false);
  }, []);

  // Admin login (email/password only)
  const adminLogin = async (email, password) => {
    setLoading(true);
    
    // TODO: Replace with actual Supabase authentication
    // Mock admin credentials (remove in production)
    const mockAdmin = {
      email: 'admin@hotel.com',
      password: 'admin123'
    };

    if (email === mockAdmin.email && password === mockAdmin.password) {
      const userData = enrichUser({
        id: '1',
        email: email,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      
      persistUserSession(userData);
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } else {
      setLoading(false);
      return { success: false, error: 'Invalid email or password' };
    }
  };

  // User login (email/password)
  const login = async (email, password) => {
    setLoading(true);
    
    // TODO: Replace with actual Supabase authentication
    // For now, check if user exists in localStorage (mock)
    const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      const userData = enrichUser({
        ...foundUser,
        password: undefined // Don't store password in user object
      });
      
      persistUserSession(userData);
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } else {
      setLoading(false);
      return { success: false, error: 'Invalid email or password' };
    }
  };

  // User registration
  const register = async (name, email, password) => {
    setLoading(true);
    
    // TODO: Replace with actual Supabase authentication
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('hotel_users') || '[]');
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      setLoading(false);
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const newUser = enrichUser({
      id: Date.now().toString(),
      name,
      email,
      password, // In production, this should be hashed
      role: 'user',
      createdAt: new Date().toISOString()
    });

    users.push(newUser);
    localStorage.setItem('hotel_users', JSON.stringify(users));

    // Auto login after registration
    const userData = {
      ...newUser,
      password: undefined
    };
    
    persistUserSession(userData);
    setUser(userData);
    setLoading(false);
    return { success: true, user: userData };
  };

  // OAuth login (Google, Facebook, etc.)
  const loginWithOAuth = async (provider) => {
    setLoading(true);
    
    // TODO: Replace with actual Supabase OAuth
    // For now, simulate OAuth login
    // In production: await supabase.auth.signInWithOAuth({ provider })
    
    // Mock OAuth user
    const oauthUser = enrichUser({
      id: `oauth_${Date.now()}`,
      email: `${provider}@example.com`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      role: 'user',
      provider: provider,
      createdAt: new Date().toISOString()
    });

    persistUserSession(oauthUser);
    setUser(oauthUser);
    setLoading(false);
    
    return { success: true, user: oauthUser };
  };

  const updateUserProfile = (updates) => {
    setUser(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...updates };
      persistUserSession(updatedUser);
      updateStoredUsers(updatedUser);
      return updatedUser;
    });
  };

  const logout = () => {
    localStorage.removeItem('hotel_user');
    setUser(null);
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const shareWithChildren = {
    user,
    loading,
    login,
    adminLogin,
    register,
    loginWithOAuth,
    logout,
    isAuthenticated,
    isAdmin,
    updateUserProfile,
  };

  return (
    <AuthInfo.Provider value={shareWithChildren}>
      {children}
    </AuthInfo.Provider>
  );
};

export const useAuth = () => useContext(AuthInfo);

