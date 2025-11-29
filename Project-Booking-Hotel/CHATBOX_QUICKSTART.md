# 🚀 ChatBox AI - Quick Start

## ⚡ 5 Phút Setup

### 1. Kiểm Tra Dependencies

```bash
# Đã có trong package.json:
npm list react-icons  # Phải có > 4.7.1
```

### 2. Nhập CSS (Đã Làm)

```jsx
// src/App.jsx
import "./style/chatbox.css";
```

✅ **Xong! ChatBox sẽ tự động hiển thị**

## 🧪 Test ChatBox

1. **Chạy ứng dụng**

   ```bash
   npm run dev
   ```

2. **Tìm nút "Chat AI"** ở góc phải dưới

   - Phải có animate bounce
   - Click vào để mở

3. **Thử các tính năng:**

   - Click "🔍 Tìm phòng"
   - Chọn ngày & khách
   - Click "Tìm phòng"

4. **Thử đặt phòng:**

   - Click "📋 Đặt ngay"
   - Nhập "Deluxe"
   - Điền form
   - Click "Xác nhận"

5. **Thử nhắn tin:**
   - Nhập "Có phòng sea view không?"
   - AI sẽ trả lời

## 🎨 Tùy Chỉnh Nhanh

### Đổi Màu Nút

**File:** `src/components/chatBox/ChatBox.jsx` - Line 369

```jsx
// From
className = "... bg-gradient-to-r from-blue-600 to-blue-700 ...";

// To
className = "... bg-gradient-to-r from-purple-600 to-purple-700 ...";
```

### Đổi Text Greeting

**File:** `src/components/chatBox/ChatBox.jsx` - Line 8-16

```jsx
const AI_RESPONSES = {
  greetings: [
    'Xin chào! 👋 Tùy chỉnh message này',
    'Chào mừng! 🏨 Hoặc message này'
  ],
  ...
}
```

### Đổi Kích Thước

**File:** `src/components/chatBox/ChatBox.jsx` - Line 384

```jsx
// From
className = "w-[360px] sm:w-[400px] h-[600px]";

// To
className = "w-[320px] sm:w-[350px] h-[500px]";
```

## 🔗 Integrasi dengan RoomContext

**Cần check:** RoomContext có những method này?

```jsx
const {
  setCheckInDate, // ✅ Required
  setCheckOutDate, // ✅ Required
  setAdults, // ✅ Required
  setKids, // ✅ Required
  handleCheck, // ✅ Required
  allRooms, // ✅ Required
  bookRoom, // ✅ Required
} = useRoomContext();
```

### Nếu thiếu, thêm vào RoomContext:

```jsx
// src/context/RoomContext.jsx
const [checkInDate, setCheckInDate] = useState("");
const [checkOutDate, setCheckOutDate] = useState("");
// ... etc

const bookRoom = (bookingData) => {
  // Create booking logic
  return {
    success: true,
    booking: {
      id: Math.random(),
      confirmationCode: `BOOKING${Date.now()}`,
    },
  };
};
```

## 📝 Nhập Booking vào Database

**Hiện tại:** Booking được lưu qua `bookRoom()` function

**Để lưu vào database:**

```jsx
// src/utils/emailService.js hoặc file mới
export const saveBokingToServer = async (booking) => {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  return response.json();
};

// Rồi gọi trong ChatBox.jsx
const res = await saveBookingToServer({
  ...bookingData,
  createdAt: new Date(),
});
```

## 🌐 Multi-Language (Tương lai)

**Cách setup:**

1. Tạo file `src/constants/chatbox-translations.js`
2. Thêm languages:

   ```javascript
   export const CHATBOX_TEXTS = {
     vi: {
       /* Vietnamese */
     },
     en: {
       /* English */
     },
     fr: {
       /* French */
     },
   };
   ```

3. Import trong ChatBox:
   ```jsx
   const { language } = useLanguageContext();
   const texts = CHATBOX_TEXTS[language];
   ```

## 🐛 Troubleshooting

### ChatBox không hiển thị

```
✅ Kiểm tra: React render ở mobile?
✅ Kiểm tra: CSS import trong App.jsx?
✅ Kiểm tra: Console có error?
```

### Icons bị hỏng

```
✅ npm install react-icons
✅ Khởi động lại dev server
✅ Clear node_modules & reinstall
```

### RoomContext undefined

```
✅ App wrapped bởi RoomContextProvider?
✅ Check context file có export RoomContext?
✅ ChatBox.jsx import RoomContext đúng?
```

### Email validation fail

```
✅ Format: user@example.com
✅ Check regex trong chatboxValidation.js
✅ Test email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### LocalStorage không hoạt động

```
✅ Browser developer tools → Application → LocalStorage
✅ Private mode disable localStorage
✅ Check browser settings
```

## 📊 Xem Analytics

```javascript
// Browser Console
JSON.parse(localStorage.getItem("hotel_chat_analytics"));
```

Output sẽ show:

```javascript
[
  { event: "booking_created", timestamp: "2024-11-21T10:30:00Z" },
  { event: "chat_opened", timestamp: "2024-11-21T10:25:00Z" },
  // ... more events
];
```

## 🎯 Next Actions

### Bước 1: Test Locally

- [ ] Chạy `npm run dev`
- [ ] Click ChatBox button
- [ ] Thử tất cả features

### Bước 2: Tùy Chỉnh

- [ ] Đổi màu & text
- [ ] Thêm brand logo
- [ ] Adjust sizes

### Bước 3: Integrate Database

- [ ] Connect bookRoom() to API
- [ ] Setup email notifications
- [ ] Add SMS alerts

### Bước 4: Deploy

- [ ] Test on production
- [ ] Monitor analytics
- [ ] Get user feedback

## 📚 Tài Liệu Đầy Đủ

- **User Guide:** `CHATBOX_GUIDE.md`
- **Developer:** `CHATBOX_DEVELOPER_GUIDE.md`
- **Implementation:** `CHATBOX_IMPLEMENTATION.md`
- **Code Comments:** Xem inline trong `ChatBox.jsx`

## 🎓 Learning Resources

### React

- Hooks: useState, useRef, useMemo, useEffect
- Context API
- Custom components

### Validation

- Email regex
- Date comparison
- Input sanitization

### UI/UX

- Tailwind CSS
- Animations
- Responsive design

## 💬 Quick Features Recap

| Feature       | How to Use                  |
| ------------- | --------------------------- |
| 🔍 Find Rooms | Click "Tìm phòng" button    |
| 📋 Book Room  | Click "Đặt ngay" button     |
| ✨ Amenities  | Ask "Có tiện nghi gì?"      |
| 💰 Price      | Ask "Giá bao nhiêu?"        |
| 📞 Contact    | Click "Liên hệ" button      |
| 💬 Free Chat  | Type anything & AI responds |

## ✨ Pro Tips

1. **Set default dates smart**

   ```jsx
   const today = new Date();
   const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
   ```

2. **Cache room lists**

   ```jsx
   const memoRooms = useMemo(() => allRooms, [allRooms]);
   ```

3. **Debounce user input**

   ```jsx
   const [searchTerm, setSearchTerm] = useState("");
   const debouncedSearch = useMemo(() => debounce(setSearchTerm, 300), []);
   ```

4. **Track user behavior**
   ```jsx
   useEffect(() => {
     logChatInteraction("chat_opened", { userId: user?.id });
   }, [open]);
   ```

## 🎉 Success Checklist

- [ ] ChatBox appears on page
- [ ] Can open/close
- [ ] Can send messages
- [ ] Can filter rooms
- [ ] Can make booking
- [ ] Can see timestamps
- [ ] Mobile responsive
- [ ] No console errors
- [ ] LocalStorage working
- [ ] Analytics logging

## 📞 Support

Có vấn đề?

1. **Check documentation**

   - CHATBOX_DEVELOPER_GUIDE.md

2. **Check console**

   - Browser DevTools → Console

3. **Check network**

   - DevTools → Network tab

4. **Check state**
   - Add console.logs
   - Check localStorage
   - Review RoomContext

---

**You're all set! 🚀 ChatBox is ready to help your hotel guests!**

Happy Coding! 💻✨
