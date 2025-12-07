# 🏨 Hotel Booking System

Hệ thống đặt phòng khách sạn toàn diện với React frontend, C# ASP.NET Core backend API, và Supabase database. Hỗ trợ đặt phòng, nhà hàng, spa với quản lý admin đầy đủ.

---

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Tech Stack](#-tech-stack)
- [Tính Năng](#-tính-năng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Cài Đặt & Setup](#-cài-đặt--setup)
- [Cấu Hình](#-cấu-hình)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Authentication & Authorization](#-authentication--authorization)
- [OAuth Integration](#-oauth-integration)
- [Email Services](#-email-services)
- [Scripts & Commands](#-scripts--commands)
- [Development](#-development)

---

## 🎯 Tổng Quan

Dự án **Hotel Booking System** là một hệ thống quản lý đặt phòng khách sạn hiện đại với các tính năng:

- ✅ **Đặt phòng khách sạn** với pricing rules động (weekend, holiday, seasonal)
- ✅ **Đặt nhà hàng** và **Spa appointments**
- ✅ **Guest booking** (không cần đăng nhập)
- ✅ **OAuth login** (Google, Facebook) với dual fallback (C# API + Supabase)
- ✅ **Email verification** và password reset
- ✅ **Admin panel** đầy đủ với reports & analytics
- ✅ **Multi-language** support (English, Vietnamese, French)
- ✅ **Real-time notifications**
- ✅ **QR Code payment**
- ✅ **Chat assistant** tích hợp

---

## 🛠️ Tech Stack

### **Frontend:**
- **React 18** + **Vite** - Framework và build tool
- **React Router DOM 6** - Routing
- **TailwindCSS 3** - Styling
- **Supabase JS Client 2** - Database & Storage
- **React DatePicker** - Date selection
- **Chart.js** + **React Chart.js 2** - Data visualization
- **QRCode React** - QR code generation
- **jsPDF** + **html2canvas** - PDF generation
- **EmailJS** - Email service
- **React Icons** - Icon library
- **Swiper** - Carousel/Slider

### **Backend:**
- **.NET 8** - Runtime
- **ASP.NET Core Web API** - RESTful API
- **Swagger/OpenAPI** - API documentation
- **SMTP** - Email service (Gmail)

### **Database:**
- **Supabase (PostgreSQL)** - Primary database
- **Row Level Security (RLS)** - Security policies
- **Storage** - File storage (images, documents)

### **Dev Tools:**
- **Vite** - Fast build tool
- **PostCSS** + **Autoprefixer** - CSS processing
- **ESLint** (implicit) - Code linting

---

## ✨ Tính Năng

### **1. User Features**

#### **Authentication:**
- ✅ Email/Password registration & login
- ✅ OAuth login (Google, Facebook) với dual fallback
- ✅ Password reset với email verification code
- ✅ Set password sau OAuth login
- ✅ Admin login (riêng biệt)
- ✅ Session management (localStorage)

#### **Booking:**
- ✅ **Room Booking:**
  - Tìm kiếm phòng theo ngày, số người
  - Xem chi tiết phòng với amenities
  - Pricing động (weekend, holiday, seasonal surcharges)
  - Guest booking (không cần đăng nhập)
  - Modify booking dates
  - Cancel booking
  - Check-in/Check-out
- ✅ **Restaurant Booking:**
  - Đặt bàn nhà hàng
  - Chọn số lượng khách
  - Xác nhận booking
- ✅ **Spa Booking:**
  - Đặt lịch spa services
  - Chọn service và thời gian
  - Xác nhận appointment

#### **User Dashboard:**
- ✅ Xem tất cả bookings (rooms, restaurant, spa)
- ✅ Filter bookings (upcoming, past, cancelled)
- ✅ Manage bookings (modify, cancel)
- ✅ Profile management
- ✅ Password reset với email verification code
- ✅ Loyalty program tracking

### **2. Admin Features**

#### **Dashboard:**
- ✅ Overview statistics
- ✅ Revenue charts
- ✅ Occupancy charts
- ✅ Reports & Analytics

#### **Management:**
- ✅ **Rooms Management:**
  - CRUD operations
  - Room status management
  - Room images upload
- ✅ **Room Types Management:**
  - CRUD operations
  - Pricing configuration
  - Amenities assignment
- ✅ **Bookings Management:**
  - View all bookings
  - Filter & search
  - Approve/Reject bookings
  - Modify booking details
- ✅ **Users Management:**
  - View all users
  - Admin privileges management
  - User details
- ✅ **Price Rules Management:**
  - Weekend surcharges
  - Holiday pricing
  - Seasonal pricing
- ✅ **Promotions Management:**
  - Create/edit promotions
  - Discount codes
  - Validity periods
- ✅ **Audit Logs:**
  - Track all system changes
  - User actions logging

### **3. System Features**

- ✅ **Multi-language:** English, Vietnamese, French
- ✅ **Responsive Design:** Mobile, Tablet, Desktop
- ✅ **Real-time Notifications:** Toast notifications
- ✅ **QR Code Payment:** Generate QR codes for payments
- ✅ **PDF Invoice:** Generate invoices as PDF
- ✅ **Chat Assistant:** AI-powered chat support
- ✅ **Email Notifications:** Booking confirmations, password reset
- ✅ **Image Storage:** Supabase Storage for room images

---

## 📁 Cấu Trúc Dự Án

```
Project-Booking-Hotel/
├── src/                          # React Frontend Source
│   ├── assets/                   # Static assets (images, logos)
│   ├── components/               # React Components
│   │   ├── admin/                # Admin components
│   │   │   ├── AuditLogsManagement.jsx
│   │   │   ├── BookingsManagement.jsx
│   │   │   ├── PriceRulesManagement.jsx
│   │   │   ├── PromotionsManagement.jsx
│   │   │   ├── ReportsManagement.jsx
│   │   │   ├── RoomsManagement.jsx
│   │   │   ├── RoomTypesManagement.jsx
│   │   │   └── UsersManagement.jsx
│   │   ├── charts/               # Chart components
│   │   │   ├── OccupancyChart.jsx
│   │   │   └── RevenueChart.jsx
│   │   ├── chatBox/              # Chat assistant
│   │   │   └── ChatBox.jsx
│   │   ├── AdminSidebar.jsx
│   │   ├── BookForm.jsx
│   │   ├── CheckIn.jsx
│   │   ├── CheckOut.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── HeroSlider.jsx
│   │   ├── Invoice.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── QRPayment.jsx
│   │   ├── Room.jsx
│   │   ├── Rooms.jsx
│   │   └── Toast.jsx
│   ├── constants/                # Constants & translations
│   │   ├── data.js
│   │   └── translations.js
│   ├── context/                   # React Contexts
│   │   ├── BookingContext.jsx     # Restaurant & Spa bookings
│   │   ├── LanguageContext.jsx    # Multi-language
│   │   ├── RoomContext.jsx        # Room bookings
│   │   └── SimpleAuthContext.jsx  # Authentication
│   ├── db/                        # Database layer
│   │   ├── mutations/             # Database mutations
│   │   │   ├── bookings.js
│   │   │   ├── restaurants.js
│   │   │   ├── reviews.js
│   │   │   └── spas.js
│   │   ├── queries/               # Database queries
│   │   │   ├── bookings.js
│   │   │   ├── restaurants.js
│   │   │   ├── reviews.js
│   │   │   └── rooms.js
│   │   └── constants/             # DB constants
│   ├── features/                  # Feature modules
│   │   └── admin/                 # Admin features
│   ├── hooks/                     # Custom React hooks
│   │   ├── useCRUD.js
│   │   └── useModalForm.js
│   ├── pages/                     # Page components
│   │   ├── Admin.jsx              # Admin dashboard
│   │   ├── AuthCallback.jsx       # OAuth callback handler
│   │   ├── Contact.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── RoomDetails.jsx
│   │   ├── RoomsPage.jsx
│   │   ├── RestaurantPage.jsx
│   │   ├── SetPassword.jsx       # Set password after OAuth
│   │   ├── SpaPage.jsx
│   │   ├── UserDashboard.jsx
│   │   └── NotFound404.jsx
│   ├── services/                  # API services
│   │   ├── adminService.js        # Admin operations
│   │   ├── authService.js         # Supabase auth
│   │   ├── bookingService.js     # Booking operations
│   │   ├── csharpApiService.js    # C# API client
│   │   ├── roomService.js         # Room operations
│   │   └── simpleAuthService.js   # Custom auth service
│   ├── style/                     # Stylesheets
│   │   ├── index.css
│   │   ├── chatbox.css
│   │   └── datepicker.css
│   ├── utils/                     # Utility functions
│   │   ├── supabaseClient.js      # Supabase client
│   │   ├── notifications.js
│   │   └── aiAssistant.js
│   ├── App.jsx                    # Main app component
│   └── main.jsx                   # Entry point
│
├── Backend/                       # C# Backend API
│   └── HotelBooking.API/
│       ├── Controllers/
│       │   └── AuthController.cs  # Auth endpoints
│       ├── Models/
│       │   └── AuthModels.cs      # Request/Response models
│       ├── Services/
│       │   ├── AuthService.cs     # OAuth & Email logic
│       │   ├── EmailService.cs    # SMTP email service
│       │   ├── IAuthService.cs
│       │   └── IEmailService.cs
│       ├── Program.cs             # Application entry
│       ├── appsettings.json       # Configuration (not in git)
│       ├── appsettings.json.template
│       └── HotelBooking.API.csproj
│
├── Query_V2/                      # Database SQL Scripts
│   ├── 01_Clean_Data.sql          # Clean existing data
│   ├── 02_Int_schema.sql          # Create schema & tables
│   ├── 03_Setup_RLS.sql           # Row Level Security
│   └── 04_Full_seed_data.sql      # Seed data
│
├── public/                        # Static public files
├── .env                           # Environment variables (not in git)
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.cjs
├── postcss.config.cjs
├── RunProject.bat                 # Quick start script
├── SETUP_AFTER_CLONE.md           # Setup guide
└── README.md                      # This file
```

---

## 🚀 Cài Đặt & Setup

### **Yêu Cầu Hệ Thống:**
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **.NET 8 SDK** ([Download](https://dotnet.microsoft.com/download/dotnet/8.0))
- **Git**
- **Supabase Account** (hoặc PostgreSQL database)

### **Bước 1: Clone Repository**
```bash
git clone <repository-url>
cd Project-Booking-Hotel
```

### **Bước 2: Cài Đặt Dependencies**

#### **Frontend:**
```bash
npm install
```

#### **Backend:**
```bash
cd Backend/HotelBooking.API
dotnet restore
```

### **Bước 3: Cấu Hình Environment**

#### **Frontend (.env):**
Tạo file `.env` ở thư mục gốc:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:5000
```

#### **Backend (appsettings.json):**
Copy `Backend/HotelBooking.API/appsettings.json.template` → `appsettings.json` và điền:

```json
{
  "Supabase": {
    "Url": "your-supabase-url",
    "Key": "your-supabase-service-key"
  },
  "ApiBaseUrl": "http://localhost:5000",
  "OAuth": {
    "Google": {
      "ClientId": "your-google-client-id",
      "ClientSecret": "your-google-client-secret"
    },
    "Facebook": {
      "AppId": "your-facebook-app-id",
      "AppSecret": "your-facebook-app-secret"
    },
    "RedirectUri": "http://localhost:5173"
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUser": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "Hotel Booking"
  }
}
```

### **Bước 4: Setup Database**

1. Tạo project trên [Supabase Dashboard](https://supabase.com/dashboard)
2. Vào **SQL Editor**
3. Chạy các scripts theo thứ tự:
   - `Query_V2/01_Clean_Data.sql`
   - `Query_V2/02_Int_schema.sql`
   - `Query_V2/03_Setup_RLS.sql`
   - `Query_V2/04_Full_seed_data.sql`

### **Bước 5: Chạy Dự Án**

#### **Cách 1: Sử dụng Script (Windows)**
```bash
# Click đúp vào file
RunProject.bat
```

#### **Cách 2: Manual**

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend (Optional):**
```bash
cd Backend/HotelBooking.API
dotnet run
```

**Truy cập:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger

---

## ⚙️ Cấu Hình

### **OAuth Configuration**

#### **Google Cloud Console:**
1. Vào [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Tạo OAuth 2.0 Client ID
3. Thêm **Authorized redirect URIs:**
   - `http://localhost:5000/api/auth/google/callback` (C# API)
   - `https://your-supabase-project.supabase.co/auth/v1/callback` (Supabase)

#### **Facebook Developer Console:**
1. Vào [Facebook Developers](https://developers.facebook.com/apps/)
2. Tạo App mới
3. Thêm **Valid OAuth Redirect URIs:**
   - `http://localhost:5000/api/auth/facebook/callback` (C# API)
   - `https://your-supabase-project.supabase.co/auth/v1/callback` (Supabase)
4. Thêm `localhost` vào **App Domains**

### **Gmail App Password (cho Email Service):**
1. Vào [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (bật nếu chưa)
3. App passwords → Generate
4. Copy password vào `appsettings.json`

---

## 🗄️ Database Schema

### **Core Tables:**

#### **users**
- `id` (uuid, PK)
- `email` (text, unique)
- `password_hash` (text)
- `full_name`, `phone`, `avatar_url`
- `country`, `city`, `bio`
- `preferences` (jsonb)
- `language` (text, default: 'en')
- `newsletter` (boolean)
- `is_admin` (boolean)
- `is_email_verified` (boolean)
- `email_verification_token` (text)
- `created_at`, `updated_at`, `last_login`

#### **room_types**
- `id` (uuid, PK)
- `code` (text, unique)
- `name`, `description`
- `base_capacity`, `max_person`
- `base_price` (numeric)
- `is_active` (boolean)
- `facilities` (text[])
- `hotel_rules` (text[])
- `cancellation_policy` (text)

#### **rooms**
- `id` (uuid, PK)
- `room_type_id` (uuid, FK)
- `room_number` (text, unique)
- `status` (enum: available, occupied, maintenance, cleaning)
- `floor` (int)
- `created_at`, `updated_at`

#### **bookings**
- `id` (uuid, PK)
- `user_id` (uuid, FK, nullable - guest booking)
- `room_id` (uuid, FK)
- `check_in`, `check_out` (date)
- `num_adults`, `num_children` (int)
- `status` (enum: pending, pending_payment, approved, rejected, confirmed, checked_in, checked_out, modified, completed, cancelled)
- `total_price` (numeric)
- `confirmation_code` (text, unique)
- `guest_name`, `guest_email`, `guest_phone` (text, nullable)
- `special_requests` (text)
- `created_at`, `updated_at`

#### **price_rules**
- `id` (uuid, PK)
- `room_type_id` (uuid, FK)
- `rule_type` (enum: weekend, holiday, seasonal, season)
- `start_date`, `end_date` (date)
- `surcharge_percent` (numeric)
- `is_active` (boolean)

#### **promotions**
- `id` (uuid, PK)
- `code` (text, unique)
- `name`, `description`
- `discount_type` (enum: percent, fixed)
- `discount_value` (numeric)
- `start_date`, `end_date` (date)
- `is_active` (boolean)

#### **restaurant_bookings**
- `id` (uuid, PK)
- `user_id` (uuid, FK, nullable)
- `booking_date` (timestamptz)
- `num_guests` (int)
- `guest_name`, `guest_email`, `guest_phone` (text, nullable)
- `special_requests` (text)
- `status` (text)
- `created_at`, `updated_at`

#### **spa_bookings**
- `id` (uuid, PK)
- `user_id` (uuid, FK, nullable)
- `service_name` (text)
- `booking_date` (timestamptz)
- `duration_minutes` (int)
- `guest_name`, `guest_email`, `guest_phone` (text, nullable)
- `special_requests` (text)
- `status` (text)
- `created_at`, `updated_at`

#### **audit_logs**
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `action` (text)
- `table_name` (text)
- `record_id` (uuid)
- `old_values` (jsonb)
- `new_values` (jsonb)
- `created_at` (timestamptz)

### **Relationships:**
- `rooms` → `room_types` (many-to-one)
- `bookings` → `rooms` (many-to-one)
- `bookings` → `users` (many-to-one, nullable)
- `price_rules` → `room_types` (many-to-one)
- `restaurant_bookings` → `users` (many-to-one, nullable)
- `spa_bookings` → `users` (many-to-one, nullable)

---

## 🔌 API Endpoints

### **Backend C# API (http://localhost:5000)**

#### **Authentication:**
- `GET /api/auth/oauth/urls` - Get OAuth URLs
- `GET /api/auth/google/callback?code={code}` - Google OAuth callback
- `GET /api/auth/facebook/callback?code={code}` - Facebook OAuth callback
- `POST /api/auth/google/login` - Google login with ID token
- `POST /api/auth/facebook/login` - Facebook login with access token
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/send-verification-code` - Send email verification code
- `POST /api/auth/verify-code-reset-password` - Verify code and reset password

### **Frontend Services:**

#### **Supabase (Direct):**
- Room queries/mutations
- Booking queries/mutations
- Restaurant/Spa bookings
- User management
- Admin operations

#### **C# API Integration:**
- OAuth URLs
- Email verification
- Password reset
- Booking price calculation (optional)
- Booking validation (optional)

---

## 🔐 Authentication & Authorization

### **Authentication Methods:**

#### **1. Email/Password:**
- Registration với password validation (8+ chars, uppercase, lowercase, number, special char)
- Login với email/password
- Password reset với email verification code
- Change password (logged-in users)

#### **2. OAuth (Google, Facebook):**
- **Dual Fallback System:**
  - **Primary:** C# Backend API (5s timeout)
  - **Fallback:** Supabase Auth Client
- Auto-create user nếu chưa tồn tại
- Set password sau OAuth login (nếu chưa có)

#### **3. Guest Booking:**
- Không cần đăng nhập
- Nhập thông tin guest (name, email, phone)
- Booking được lưu với `user_id = null`

### **Authorization:**

#### **User Roles:**
- **Regular User:** Đặt phòng, xem bookings của mình
- **Admin:** Full access to admin panel

#### **Protected Routes:**
- `/account` - User dashboard (requires login, disallow admin)
- `/admin` - Admin panel (requires admin login)

#### **Session Management:**
- localStorage-based sessions
- 7-day expiration
- Auto-logout on expiration

---

## 🔄 OAuth Integration

### **Flow:**

#### **C# API Flow (Primary):**
```
1. User clicks "Login with Google"
   ↓
2. Frontend calls C# API: GET /api/auth/oauth/urls
   ↓
3. Redirect to Google OAuth
   ↓
4. Google redirects to: http://localhost:5000/api/auth/google/callback?code={code}
   ↓
5. C# API exchanges code for token
   ↓
6. C# API redirects to: http://localhost:5173/auth/callback?email={email}&name={name}
   ↓
7. Frontend creates/updates user in Supabase
   ↓
8. Set password if needed → Login success
```

#### **Supabase Flow (Fallback):**
```
1. User clicks "Login with Google"
   ↓
2. C# API timeout/fail → Fallback to Supabase
   ↓
3. Supabase OAuth redirect
   ↓
4. Redirect to: http://localhost:5173/auth/callback
   ↓
5. Frontend gets Supabase session
   ↓
6. Create/update user in Supabase
   ↓
7. Set password if needed → Login success
```

### **Configuration:**
- **Google Console:** Cần có cả 2 redirect URIs (C# API + Supabase)
- **Facebook Console:** Cần có cả 2 redirect URIs (C# API + Supabase)

---

## 📧 Email Services

### **Email Service (C# Backend):**

#### **Features:**
- SMTP email sending (Gmail)
- HTML email templates
- Password reset emails
- Verification code emails

#### **Configuration:**
```json
{
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUser": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "Hotel Booking"
  }
}
```

### **Email Templates:**

#### **Password Reset:**
- Subject: "Password Reset Request - Hotel Booking"
- Contains: 6-digit verification code
- Expiration: 15 minutes

#### **Verification Code:**
- Subject: "Password Reset Verification Code - Hotel Booking"
- Contains: 6-digit code với styling
- Expiration: 15 minutes

---

## 📜 Scripts & Commands

### **Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run seed:users   # Seed users (if script exists)
```

### **Backend:**
```bash
cd Backend/HotelBooking.API
dotnet run           # Run API server
dotnet build         # Build project
dotnet restore       # Restore packages
```

### **Quick Start (Windows):**
```bash
# Click đúp vào
RunProject.bat
```

---

## 💻 Development

### **Project Structure Best Practices:**

#### **Components:**
- Reusable components trong `src/components/`
- Admin-specific components trong `src/components/admin/`
- Page components trong `src/pages/`

#### **Services:**
- API calls trong `src/services/`
- Database operations trong `src/db/`
- Utility functions trong `src/utils/`

#### **State Management:**
- React Context cho global state
- Local state cho component-specific data

### **Code Style:**
- **JavaScript/JSX:** ES6+, functional components, hooks
- **C#:** .NET 8 conventions, async/await patterns
- **SQL:** PostgreSQL syntax, RLS policies

### **Testing:**
- Manual testing recommended
- Swagger UI cho API testing: http://localhost:5000/swagger

---

## 📚 Documentation Files

- `SETUP_AFTER_CLONE.md` - Chi tiết setup sau khi clone
- `Query_V2/` - SQL scripts và database documentation
- `Backend/HotelBooking.API/appsettings.json.template` - Configuration template

---

## 🐛 Troubleshooting

### **Common Issues:**

#### **1. OAuth không hoạt động:**
- ✅ Check redirect URIs trong Google/Facebook Console
- ✅ Check `appsettings.json` có đúng ClientId/Secret
- ✅ Check C# API có đang chạy không

#### **2. Email không gửi được:**
- ✅ Check Gmail App Password
- ✅ Check SMTP settings trong `appsettings.json`
- ✅ Check firewall/network

#### **3. Database errors:**
- ✅ Check Supabase connection
- ✅ Check RLS policies
- ✅ Check SQL scripts đã chạy đầy đủ

#### **4. C# API không chạy:**
- ✅ Check .NET 8 SDK đã cài
- ✅ Check `appsettings.json` có tồn tại
- ✅ Check port 5000 có bị chiếm không

---

## 📝 License

Private project - All rights reserved

---

## 👥 Contributors

- Development Team

---

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Check `SETUP_AFTER_CLONE.md`
2. Check console logs (browser & terminal)
3. Check Swagger UI: http://localhost:5000/swagger

---

**Last Updated:** 2025-01-27  
**Version:** 1.0.0
