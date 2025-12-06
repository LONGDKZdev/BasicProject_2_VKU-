# 🏨 Hotel Booking System

Hệ thống đặt phòng khách sạn với React frontend và C# backend API.

## 🚀 Quick Start

### **Sau khi clone về:**

1. **Cài dependencies:**
   ```bash
   npm install
   cd Backend/HotelBooking.API
   dotnet restore
   ```

2. **Cấu hình:**
   - Tạo `.env` file (xem `.env.example` nếu có)
   - Copy `Backend/HotelBooking.API/appsettings.json.template` → `appsettings.json` và điền thông tin

3. **Setup database:**
   - Chạy SQL scripts trong `Query_V2/` theo thứ tự trong Supabase

4. **Chạy:**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend (optional - chỉ cần nếu dùng OAuth)
   cd Backend/HotelBooking.API
   dotnet run
   ```

**Xem chi tiết:** `SETUP_AFTER_CLONE.md`

---

## 📁 Cấu trúc Project

```
Project-Booking-Hotel/
├── src/                    # React Frontend
├── Backend/                # C# Backend API (optional)
├── Query_V2/              # SQL Scripts cho Supabase
└── public/                # Static files
```

---

## 🛠️ Tech Stack

### Frontend:
- React 18 + Vite
- TailwindCSS
- Supabase (Database & Auth)
- React Router

### Backend (Optional):
- .NET 8
- ASP.NET Core Web API
- OAuth (Google, Facebook)
- SMTP Email

---

## 📚 Documentation

- `SETUP_AFTER_CLONE.md` - Hướng dẫn setup sau khi clone
- `Backend/SETUP_INSTRUCTIONS.md` - Setup backend
- `Backend/OAUTH_INTEGRATION_GUIDE.md` - OAuth integration
- `Query_V2/` - SQL scripts và documentation

---

## ⚙️ Environment Variables

### Frontend (.env):
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
```

### Backend (appsettings.json):
Xem `Backend/HotelBooking.API/appsettings.json.template`

---

## 🎯 Features

- ✅ Room booking với pricing rules
- ✅ Restaurant & Spa booking
- ✅ Guest booking (không cần đăng nhập)
- ✅ OAuth login (Google, Facebook)
- ✅ Email notifications
- ✅ Admin panel
- ✅ Reports & Analytics

---

## 📝 License

Private project

---

**Cần help?** Xem `SETUP_AFTER_CLONE.md` hoặc các file trong `Backend/`

