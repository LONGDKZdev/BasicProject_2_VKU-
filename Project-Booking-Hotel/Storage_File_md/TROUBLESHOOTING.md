# 🔧 Troubleshooting Guide

## 🚨 Vấn đề Phổ Biến & Giải Pháp

---

## 1. Supabase Connection Issues

### ❌ Lỗi: "Cannot connect to Supabase"

**Nguyên nhân:**
- Credentials sai
- Network không kết nối
- Supabase server down

**Giải pháp:**
```javascript
// 1. Kiểm tra console logs
// Mở DevTools (F12) → Console tab
// Tìm dòng: "🔐 Supabase URL: https://..."

// 2. Kiểm tra .env file
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);

// 3. Kiểm tra Supabase dashboard
// Vào https://app.supabase.com
// Kiểm tra project status

// 4. Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Connection OK:', data);
  } catch (err) {
    console.error('❌ Connection Failed:', err);
  }
};
```

### ❌ Lỗi: "Rooms not loading"

**Nguyên nhân:**
- Supabase offline → fallback to local data
- Database tables không tồn tại
- RLS policy chặn access

**Giải pháp:**
```javascript
// Kiểm tra console
// Nếu thấy: "Supabase unavailable, using local seed data"
// → Đó là fallback mode (bình thường)

// Kiểm tra Supabase RLS policies
// 1. Vào Supabase Dashboard
// 2. Chọn Authentication → Policies
// 3. Kiểm tra room_types, rooms, room_images tables
// 4. Đảm bảo có policy cho SELECT (public read)
```

---

## 2. Authentication Issues

### ❌ Lỗi: "Cannot login"

**Nguyên nhân:**
- Credentials sai
- User chưa đăng ký
- localStorage bị xóa

**Giải pháp:**
```javascript
// 1. Kiểm tra localStorage
localStorage.getItem('hotel_user'); // Nên có user object

// 2. Kiểm tra admin credentials
// Email: admin@hotel.com
// Password: admin123

// 3. Clear localStorage & thử lại
localStorage.clear();
// Reload page

// 4. Kiểm tra console errors
// F12 → Console → Tìm error messages
```

### ❌ Lỗi: "Admin access denied"

**Nguyên nhân:**
- User không phải admin
- Role không được set đúng

**Giải pháp:**
```javascript
// Kiểm tra user role
const user = JSON.parse(localStorage.getItem('hotel_user'));
console.log('User role:', user?.role); // Nên là 'admin'

// Nếu không phải admin:
// 1. Logout
// 2. Login lại với admin@hotel.com / admin123
```

---

## 3. Email Issues

### ❌ Lỗi: "Email not sending"

**Nguyên nhân:**
- EmailJS chưa config
- Credentials sai
- Template ID sai

**Giải pháp:**
```javascript
// 1. Kiểm tra .env
console.log(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
// Nếu undefined → chưa config

// 2. Kiểm tra EmailJS config
// Vào src/utils/emailService.js
// Kiểm tra PUBLIC_KEY, SERVICE_ID, TEMPLATE_IDs

// 3. Test EmailJS
import emailjs from '@emailjs/browser';

const testEmail = async () => {
  try {
    const response = await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      {
        to_email: 'test@example.com',
        to_name: 'Test User',
        message: 'Test message'
      }
    );
    console.log('✅ Email sent:', response);
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
};

// 4. Kiểm tra EmailJS dashboard
// Vào https://dashboard.emailjs.com
// Kiểm tra Email Logs
```

### ❌ Lỗi: "Reset code not received"

**Nguyên nhân:**
- EmailJS chưa config
- Email template sai
- Email address sai

**Giải pháp:**
```javascript
// 1. Kiểm tra email address
// Đảm bảo format đúng: user@example.com

// 2. Kiểm tra spam folder
// Reset code có thể vào spam

// 3. Kiểm tra EmailJS logs
// Dashboard → Email Logs

// 4. Nếu chưa config
// Đăng ký EmailJS tại https://www.emailjs.com/
```

---

## 4. Booking Issues

### ❌ Lỗi: "Cannot create booking"

**Nguyên nhân:**
- Room không available
- Dates không valid
- User chưa login

**Giải pháp:**
```javascript
// 1. Kiểm tra user login
const user = JSON.parse(localStorage.getItem('hotel_user'));
if (!user) {
  console.error('User not logged in');
  // Redirect to login
}

// 2. Kiểm tra dates
const checkIn = new Date('2025-01-15');
const checkOut = new Date('2025-01-20');
if (checkIn >= checkOut) {
  console.error('Invalid date range');
}

// 3. Kiểm tra room availability
// RoomContext → isRoomAvailable(roomId, checkIn, checkOut)

// 4. Kiểm tra console logs
// F12 → Console → Tìm booking error
```

### ❌ Lỗi: "Booking not saved"

**Nguyên nhân:**
- Supabase offline
- localStorage full
- Network error

**Giải pháp:**
```javascript
// 1. Kiểm tra localStorage
const bookings = JSON.parse(localStorage.getItem('hotel_bookings'));
console.log('Bookings:', bookings);

// 2. Clear old bookings
localStorage.removeItem('hotel_bookings');

// 3. Kiểm tra Supabase
// Nếu offline → fallback to localStorage (bình thường)

// 4. Reload page
location.reload();
```

---

## 5. Payment Issues

### ❌ Lỗi: "QR Code not generating"

**Nguyên nhân:**
- qrcode.react library issue
- Invalid booking data
- Canvas error

**Giải pháp:**
```javascript
// 1. Kiểm tra booking data
const booking = {
  confirmationCode: 'AD-XXXXX',
  totalPrice: 500,
  // ... other fields
};

// 2. Kiểm tra QR code value
const qrValue = `${booking.confirmationCode}|${booking.totalPrice}`;
console.log('QR Value:', qrValue);

// 3. Kiểm tra qrcode.react installation
npm list qrcode.react

// 4. Reinstall nếu cần
npm install qrcode.react
```

### ❌ Lỗi: "Cannot download invoice"

**Nguyên nhân:**
- html2canvas issue
- jsPDF issue
- Browser security

**Giải pháp:**
```javascript
// 1. Kiểm tra libraries
npm list html2canvas jspdf

// 2. Kiểm tra invoice element
const invoiceElement = document.getElementById('invoice');
if (!invoiceElement) {
  console.error('Invoice element not found');
}

// 3. Test download
const testDownload = async () => {
  try {
    const canvas = await html2canvas(invoiceElement);
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL(), 'PNG', 0, 0);
    pdf.save('invoice.pdf');
    console.log('✅ Download successful');
  } catch (error) {
    console.error('❌ Download failed:', error);
  }
};
```

---

## 6. Performance Issues

### ❌ Lỗi: "Page loading slow"

**Nguyên nhân:**
- Quá nhiều rooms render
- Images không optimize
- Network slow

**Giải pháp:**
```javascript
// 1. Kiểm tra Network tab
// F12 → Network → Reload
// Kiểm tra file sizes

// 2. Enable pagination
// Rooms page nên show 12 rooms/page

// 3. Lazy load images
<img src={room.image} loading="lazy" />

// 4. Memoize components
import { memo } from 'react';
const Room = memo(({ room }) => (...));

// 5. Kiểm tra console performance
console.time('loadRooms');
// ... code
console.timeEnd('loadRooms');
```

### ❌ Lỗi: "Memory leak warning"

**Nguyên nhân:**
- Async operations không cleanup
- Event listeners không remove
- Subscriptions không unsubscribe

**Giải pháp:**
```javascript
// 1. Cleanup in useEffect
useEffect(() => {
  const subscription = supabase
    .from('bookings')
    .on('*', payload => {
      // handle change
    })
    .subscribe();

  return () => {
    subscription.unsubscribe(); // ← Cleanup!
  };
}, []);

// 2. Cleanup async operations
useEffect(() => {
  let isMounted = true;

  const loadData = async () => {
    const data = await fetchData();
    if (isMounted) {
      setData(data);
    }
  };

  loadData();

  return () => {
    isMounted = false; // ← Cleanup!
  };
}, []);
```

---

## 7. Browser Issues

### ❌ Lỗi: "Not working on Safari"

**Nguyên nhân:**
- Crypto API không available
- Date format issue
- CSS compatibility

**Giải pháp:**
```javascript
// 1. Polyfill crypto.randomUUID
const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for Safari
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 2. Test on Safari
// Borrow a Mac or use BrowserStack
```

### ❌ Lỗi: "Not working on mobile"

**Nguyên nhân:**
- Viewport issue
- Touch events
- Screen size

**Giải pháp:**
```javascript
// 1. Kiểm tra viewport meta tag
// index.html nên có:
<meta name="viewport" content="width=device-width, initial-scale=1.0">

// 2. Test on mobile
// Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)

// 3. Kiểm tra responsive design
// Tailwind classes: sm:, md:, lg:, xl:

// 4. Test touch events
// Swiper library hỗ trợ touch
```

---

## 8. Database Issues

### ❌ Lỗi: "Room images not showing"

**Nguyên nhân:**
- Images URL sai
- Storage bucket không public
- RLS policy chặn access

**Giải pháp:**
```javascript
// 1. Kiểm tra image URLs
const { data } = await supabase
  .from('room_images')
  .select('*')
  .limit(1);
console.log('Image URLs:', data);

// 2. Kiểm tra Supabase Storage
// Dashboard → Storage → room-images bucket
// Đảm bảo bucket public

// 3. Kiểm tra RLS policies
// Dashboard → Authentication → Policies
// room_images table nên có SELECT policy

// 4. Test image URL
// Copy URL từ database
// Paste vào browser
// Nếu 403 → RLS issue
```

### ❌ Lỗi: "Bookings not syncing"

**Nguyên nhân:**
- Supabase offline
- RLS policy issue
- Async timing issue

**Giải pháp:**
```javascript
// 1. Kiểm tra Supabase status
// Vào https://status.supabase.com

// 2. Kiểm tra RLS policies
// bookings table nên có:
// - SELECT: user_id = auth.uid()
// - INSERT: user_id = auth.uid()
// - UPDATE: user_id = auth.uid()

// 3. Kiểm tra localStorage backup
const bookings = JSON.parse(localStorage.getItem('hotel_bookings'));
console.log('Local bookings:', bookings);

// 4. Force sync
// Logout → Login → Reload
```

---

## 🆘 Emergency Fixes

### Clear All Data
```javascript
// Nếu data bị corrupt:
localStorage.clear();
location.reload();
```

### Reset to Seed Data
```javascript
// Xóa custom data, quay lại seed data:
localStorage.removeItem('hotel_bookings');
localStorage.removeItem('hotel_room_reviews');
localStorage.removeItem('hotel_users');
location.reload();
```

### Check All Logs
```javascript
// Mở DevTools (F12)
// Console tab → Tìm tất cả logs
// Filter: ✓, ❌, ⚠️, 🔐, 🖼️

// Network tab → Kiểm tra requests
// Tìm failed requests (red)
```

---

## 📞 Support Checklist

Trước khi báo cáo bug:
- [ ] Kiểm tra console logs
- [ ] Kiểm tra Network tab
- [ ] Kiểm tra Supabase dashboard
- [ ] Kiểm tra EmailJS dashboard
- [ ] Clear localStorage & reload
- [ ] Test trên incognito mode
- [ ] Test trên browser khác
- [ ] Kiểm tra .env file

---

## 🔗 Useful Links

- [Supabase Status](https://status.supabase.com)
- [Supabase Dashboard](https://app.supabase.com)
- [EmailJS Dashboard](https://dashboard.emailjs.com)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

*Last updated: Nov 23, 2025*
