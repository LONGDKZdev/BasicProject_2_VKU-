# 🚀 HƯỚNG DẪN SETUP SAU KHI CLONE TỪ GITHUB

## 📋 YÊU CẦU HỆ THỐNG

### **Bắt buộc:**
- ✅ **Node.js** >= 18.x (cho Frontend React)
- ✅ **.NET 8 SDK** (cho Backend C# API)
- ✅ **Git** (đã có nếu clone được)

### **Tùy chọn:**
- VSCode với C# extension (để debug backend)
- PostgreSQL client (để chạy SQL scripts)

---

## 🔧 BƯỚC 1: CÀI ĐẶT DEPENDENCIES

### **1.1. Frontend (React)**

```bash
# Đã có node_modules? Copy vào thư mục project
# Nếu chưa có, chạy:
npm install
# hoặc
yarn install
```

### **1.2. Backend (C#)**

```bash
cd Backend/HotelBooking.API
dotnet restore
```

**Lưu ý:** Không cần copy gì, `dotnet restore` sẽ tự động tải packages.

---

## 🔐 BƯỚC 2: CẤU HÌNH ENVIRONMENT VARIABLES

### **2.1. Frontend (.env)**

Tạo file `.env` trong thư mục root:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# C# Backend API (optional, nếu dùng OAuth)
VITE_API_URL=http://localhost:5000
```

### **2.2. Backend (appsettings.json)**

**QUAN TRỌNG:** File `appsettings.json` đã bị gitignore, bạn cần tạo mới!

1. Copy template:
```bash
cd Backend/HotelBooking.API
copy appsettings.json.template appsettings.json
```

2. Điền thông tin vào `appsettings.json`:

```json
{
  "Supabase": {
    "Url": "YOUR_SUPABASE_URL",
    "Key": "YOUR_SUPABASE_ANON_KEY"
  },
  "OAuth": {
    "Google": {
      "ClientId": "YOUR_GOOGLE_CLIENT_ID",
      "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
    },
    "Facebook": {
      "AppId": "YOUR_FACEBOOK_APP_ID",
      "AppSecret": "YOUR_FACEBOOK_APP_SECRET"
    }
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUser": "YOUR_EMAIL@gmail.com",
    "SmtpPassword": "YOUR_APP_PASSWORD",
    "FromEmail": "YOUR_EMAIL@gmail.com",
    "FromName": "Hotel Booking"
  }
}
```

**Lấy thông tin ở đâu:**
- **Supabase:** https://app.supabase.com → Project Settings → API
- **Google OAuth:** https://console.cloud.google.com → APIs & Services → Credentials
- **Facebook OAuth:** https://developers.facebook.com → My Apps
- **Email:** Gmail App Password (xem hướng dẫn trong `Backend/SETUP_INSTRUCTIONS.md`)

---

## 🗄️ BƯỚC 3: SETUP DATABASE

### **3.1. Chạy SQL Scripts**

Chạy các file SQL theo thứ tự trong Supabase SQL Editor:

1. `Query_V2/01_Clean_Data.sql` - Xóa tất cả (nếu cần)
2. `Query_V2/02_Int_schema.sql` - Tạo schema
3. `Query_V2/03_Setup_RLS.sql` - Setup permissions
4. `Query_V2/04_Full_seed_data.sql` - Seed data

**Lưu ý:** 
- Chạy từng file một
- Đợi mỗi file chạy xong trước khi chạy file tiếp theo
- File 01 chỉ chạy khi cần reset database

---

## 🚀 BƯỚC 4: CHẠY ỨNG DỤNG

### **4.1. Chạy Frontend**

```bash
# Terminal 1
npm run dev
# hoặc
yarn dev
```

Frontend chạy tại: `http://localhost:5173`

### **4.2. Chạy Backend (Optional - chỉ cần nếu dùng OAuth)**

```bash
# Terminal 2
cd Backend/HotelBooking.API
dotnet run
```

Backend chạy tại:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger: `https://localhost:5001/swagger`

**Lưu ý:** Backend chỉ cần thiết nếu bạn muốn dùng:
- Google OAuth login
- Facebook OAuth login
- Email password reset

Nếu không dùng OAuth, có thể bỏ qua backend!

---

## ✅ CHECKLIST SAU KHI CLONE

- [ ] Đã cài Node.js và npm/yarn
- [ ] Đã cài .NET 8 SDK (nếu dùng backend)
- [ ] Đã chạy `npm install` hoặc copy `node_modules`
- [ ] Đã chạy `dotnet restore` (nếu dùng backend)
- [ ] Đã tạo file `.env` với Supabase credentials
- [ ] Đã tạo file `appsettings.json` từ template (nếu dùng backend)
- [ ] Đã chạy SQL scripts trong Supabase
- [ ] Đã test frontend chạy được
- [ ] Đã test backend chạy được (nếu dùng)

---

## 🐛 TROUBLESHOOTING

### **Lỗi: "Cannot find module"**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

### **Lỗi: "Supabase connection failed"**
- Kiểm tra `.env` có đúng Supabase URL và Key không
- Kiểm tra Supabase project có đang active không

### **Lỗi: "Backend build failed"**
```bash
cd Backend/HotelBooking.API
dotnet clean
dotnet restore
dotnet build
```

### **Lỗi: "Port already in use"**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

---

## 📝 GHI CHÚ

- **node_modules:** Có thể copy từ máy khác, nhưng khuyến nghị chạy `npm install` để đảm bảo đúng version
- **Backend:** Chỉ cần thiết nếu dùng OAuth, không bắt buộc
- **Database:** Phải chạy SQL scripts trước khi dùng app
- **Credentials:** Không commit vào git, chỉ lưu local

---

**Xem thêm:**
- `Backend/SETUP_INSTRUCTIONS.md` - Hướng dẫn setup backend chi tiết
- `Backend/OAUTH_INTEGRATION_GUIDE.md` - Hướng dẫn OAuth
- `Query_V2/README.md` (nếu có) - Hướng dẫn database

