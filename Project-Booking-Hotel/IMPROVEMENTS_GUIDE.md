# 🛠️ Hướng Dẫn Cải Thiện Code

## 1️⃣ Migrate sang Supabase Auth (CRITICAL)

### Bước 1: Cập nhật supabaseClient.js

```javascript
// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials in .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ... rest of the functions
```

### Bước 2: Cập nhật AuthContext.jsx

```javascript
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthInfo = createContext();

export const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || 'User',
          role: session.user.user_metadata?.role || 'user',
        });
      }
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || 'User',
            role: session.user.user_metadata?.role || 'user',
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || 'User',
        role: data.user.user_metadata?.role || 'user',
      });
      
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'user',
          },
        },
      });
      
      if (error) throw error;
      
      return { 
        success: true, 
        message: 'Check your email to confirm registration',
        user: data.user 
      };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    // Same as login, but check if user has admin role
    const result = await login(email, password);
    if (result.success && result.user.user_metadata?.role !== 'admin') {
      await logout();
      return { success: false, error: 'Admin access required' };
    }
    return result;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAuthenticated = () => user !== null;
  const isAdmin = () => user?.role === 'admin';

  const value = {
    user,
    loading,
    login,
    register,
    adminLogin,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthInfo.Provider value={value}>
      {children}
    </AuthInfo.Provider>
  );
};

export const useAuth = () => useContext(AuthInfo);
```

---

## 2️⃣ Setup EmailJS (CRITICAL)

### Bước 1: Đăng ký EmailJS

1. Vào https://www.emailjs.com/
2. Đăng ký tài khoản (miễn phí)
3. Tạo Email Service (chọn Gmail)
4. Tạo 2 Email Templates:
   - Template 1: Password Reset
   - Template 2: Booking Confirmation

### Bước 2: Cập nhật .env

```bash
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_RESET_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_BOOKING_TEMPLATE_ID=your_booking_template_id_here
```

### Bước 3: Cập nhật emailService.js

```javascript
// src/utils/emailService.js
import emailjs from '@emailjs/browser';

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const RESET_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID;
const BOOKING_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_BOOKING_TEMPLATE_ID;

if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY);
}

export const isEmailConfigured = () => {
  return !!(PUBLIC_KEY && SERVICE_ID && RESET_TEMPLATE_ID);
};

export const isBookingEmailConfigured = () => {
  return !!(PUBLIC_KEY && SERVICE_ID && BOOKING_TEMPLATE_ID);
};

export const sendResetCodeEmail = async (toEmail, resetCode, userName = 'User') => {
  if (!isEmailConfigured()) {
    console.warn('EmailJS not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await emailjs.send(SERVICE_ID, RESET_TEMPLATE_ID, {
      to_email: toEmail,
      to_name: userName,
      reset_code: resetCode,
      from_name: 'Hotel Booking',
    });
    return { success: true, message: 'Reset code sent successfully!' };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return { success: false, error: error.text || 'Failed to send email' };
  }
};

export const sendBookingConfirmationEmail = async ({ toEmail, toName = 'Guest', booking }) => {
  if (!isBookingEmailConfigured()) {
    console.warn('EmailJS not configured for bookings');
    return { success: true, message: 'Email service not configured (demo mode)' };
  }

  try {
    const response = await emailjs.send(SERVICE_ID, BOOKING_TEMPLATE_ID, {
      to_email: toEmail,
      to_name: toName,
      confirmation_code: booking?.confirmationCode,
      booking_details: JSON.stringify(booking, null, 2),
      total_amount: booking?.totalPrice || booking?.price || 0,
    });
    return { success: true, message: 'Booking confirmation sent!' };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return { success: false, error: error.text || 'Failed to send email' };
  }
};
```

---

## 3️⃣ Tạo .env.example

```bash
# .env.example
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# EmailJS
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_RESET_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_BOOKING_TEMPLATE_ID=your_booking_template_id_here
```

---

## 4️⃣ Thêm Input Validation

### Tạo file validation utility

```javascript
// src/utils/validation.js

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  // Minimum 8 characters, 1 uppercase, 1 number
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return false;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return start < end;
};

export const validatePhoneNumber = (phone) => {
  const regex = /^[0-9\s\-\+\(\)]{10,}$/;
  return regex.test(phone);
};
```

### Sử dụng trong Login component

```javascript
// src/pages/Login.jsx
import { validateEmail, validatePassword } from '../utils/validation';

const handleLogin = async (e) => {
  e.preventDefault();
  
  // Validate
  if (!validateEmail(email)) {
    setError('Invalid email format');
    return;
  }
  
  if (!password) {
    setError('Password is required');
    return;
  }
  
  // Proceed with login
  const result = await login(email, password);
  // ...
};
```

---

## 5️⃣ Thêm Loading States & Skeleton Loaders

### Tạo Skeleton component

```javascript
// src/components/SkeletonLoader.jsx
export const RoomSkeleton = () => (
  <div className="bg-gray-200 animate-pulse rounded-lg p-4">
    <div className="h-48 bg-gray-300 rounded mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
);

export const BookingSkeleton = () => (
  <div className="bg-gray-200 animate-pulse rounded-lg p-4">
    <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
  </div>
);
```

### Sử dụng trong Rooms component

```javascript
// src/components/Rooms.jsx
import { RoomSkeleton } from './SkeletonLoader';

export const Rooms = () => {
  const { rooms, loading } = useRoomContext();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <RoomSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map(room => <Room key={room.id} room={room} />)}
    </div>
  );
};
```

---

## 6️⃣ Thêm Unit Tests

### Setup Jest & React Testing Library

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### Tạo test file

```javascript
// src/utils/__tests__/validation.test.js
import { validateEmail, validatePassword } from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      expect(validatePassword('StrongPass123')).toBe(true);
    });

    it('should reject weak password', () => {
      expect(validatePassword('weak')).toBe(false);
    });
  });
});
```

---

## 7️⃣ Performance Optimization

### Memoize expensive calculations

```javascript
// src/context/RoomContext.jsx
import { useMemo } from 'react';

const filterRooms = useMemo(() => {
  return (options = {}) => {
    // ... filtering logic
  };
}, [allRooms, searchTerm, priceRange]);
```

### Lazy load images

```javascript
// src/components/Room.jsx
<img 
  src={room.image} 
  alt={room.name}
  loading="lazy"
  className="w-full h-48 object-cover"
/>
```

---

## 📋 Checklist Hoàn Thành

- [ ] Migrate sang Supabase Auth
- [ ] Setup EmailJS
- [ ] Tạo .env.example
- [ ] Thêm input validation
- [ ] Thêm skeleton loaders
- [ ] Thêm unit tests
- [ ] Optimize performance
- [ ] Test tất cả flows
- [ ] Deploy to production

---

## 🧪 Testing Commands

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run dev server
npm run dev

# Build for production
npm run build
```

---

## 📚 Tài Liệu Tham Khảo

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [EmailJS Docs](https://www.emailjs.com/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest](https://vitest.dev/)

---

*Last updated: Nov 23, 2025*
