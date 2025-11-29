# 🔄 Supabase Integration - Tóm tắt Thay đổi

## 📊 Tổng quan

Hệ thống đã được cập nhật để **tích hợp Supabase** thay vì chỉ dùng localStorage. Tất cả dữ liệu quan trọng (rooms, bookings, reviews) giờ đây được lưu trên cloud database với fallback về local cache khi offline.

---

## 📁 Files Mới & Chỉnh Sửa

### ✨ Files Mới

| File | Mục đích |
|------|---------|
| `src/utils/supabaseClient.js` | Supabase client + API helpers (fetchRooms, createBooking, v.v.) |
| `Query/02_seed_rooms_from_migration.sql` | SQL seed script: import 40 rooms + price rules |
| `.env.example` | Template biến môi trường (copy → `.env`) |
| `MIGRATION_GUIDE.md` | Hướng dẫn chi tiết để setup Supabase |
| `SUPABASE_INTEGRATION_SUMMARY.md` | File này |

### 🔧 Files Chỉnh Sửa

| File | Thay đổi |
|------|----------|
| `src/context/RoomContext.jsx` | **Lớn nhất**: Thêm Supabase fetch, async booking/review, state `dbConnected` |
| `package.json` | Thêm `@supabase/supabase-js` dependency |
| `src/pages/RoomDetails.jsx` | Hỗ trợ UUID thay numeric IDs |
| `src/components/RoomTypeSelector.jsx` | Nhận xét code mapping |

---

## 🏗️ Kiến trúc mới

### Dữ liệu flow

```
┌─────────────────┐
│  Browser/UI     │
└────────┬────────┘
         │
    ┌────▼─────┐
    │RoomContext│ ← State manager + Business logic
    └────┬──────┘
    ┌────▼──────────────┐
    │supabaseClient.js  │ ← API client + helpers
    └────┬──────────────┘
    ┌────▼────────────────────┐
    │  Supabase PostgreSQL    │
    │ (rooms, bookings, etc)  │
    └─────────────────────────┘
    
    └──Fallback──┘
    localStorage (offline mode)
```

### State priorities (RoomContext)

1. **Supabase (if connected)** → `dbConnected = true`
   - Fetch rooms, bookings từ DB
   - Save booking/review trực tiếp vào DB (async)
   
2. **localStorage (offline fallback)** → `dbConnected = false`
   - Sử dụng local seed data (`src/db/data.js`)
   - Persistence vào localStorage (như cũ)

---

## 🔌 API Helpers (supabaseClient.js)

```javascript
// Dùng trong RoomContext hay components

fetchRooms()                  // Lấy all rooms + room_types
fetchRoomTypes()              // Lấy loại phòng
checkRoomAvailability(...)    // Kiểm tra conflict booking
fetchPriceRules(...)          // Lấy quy tắc giá
createBooking(...)            // Tạo booking
fetchUserBookings(...)        // Lấy bookings của user
updateBookingStatus(...)      // Cập nhật status
createReview(...)             // Tạo review
fetchRoomReviews(...)         // Lấy reviews
```

---

## 🔑 Dữ liệu Schema Mapping

### Frontend → DB Shape

**Rooms:**
```javascript
// Frontend
{ id, name, type, category, price, maxPerson, facilities, reviews }

// DB
{ id (uuid), room_no, room_type_id, status, room_types: { code, name, base_price, facilities, ... } }

// Transform func
transformDbRoomToFrontend(dbRoom, reviews)
```

**Bookings:**
```javascript
// Frontend
{ id, confirmationCode, roomId, userId, checkIn, checkOut, status, ... }

// DB
{ id, confirmation_code, room_id, user_id, check_in, check_out, status, ... }
```

---

## ⚙️ Cấu hình (Environment)

Tạo file `.env` (copy từ `.env.example`):

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Lấy từ Supabase Dashboard:
1. Settings → API
2. Project URL + anon key

---

## 🚀 Quick Start

### 1️⃣ Setup Supabase
```bash
# Tạo project tại https://supabase.com
# Chạy SQL từ Query/01_create_schema_tables.txt
# Chạy SQL từ Query/02_seed_rooms_from_migration.sql
```

### 2️⃣ Config Frontend
```bash
# Copy .env
cp .env.example .env

# Edit .env với Supabase keys
nano .env

# Install dependency
npm install @supabase/supabase-js

# Start dev
npm run dev
```

### 3️⃣ Test
```
Browser console → "✓ Loaded X rooms from Supabase"
   ✅ Connected
   ⚠️ Fallback to local
```

Chi tiết xem `MIGRATION_GUIDE.md`

---

## 🔄 Luồng Booking (mới)

### Synchronous (local)
```
User fills form → bookRoom() → Check local availability
→ Create booking object → Save to localStorage → UI updates
```

### Asynchronous (Supabase)
```
User fills form → bookRoom() → Check local availability
→ Create booking object → Save to localStorage (optimistic)
→ [async] Create in Supabase → DB confirm
```

**⚠️ Lưu ý:** Booking được tạo optimistically (UI cập nhật ngay), DB save async.

---

## 🔐 Tính năng Bảo mật

### ✅ Implemented
- UUID cho all IDs (không expose sequential numbers)
- Booking liên kết `user_id` (chỉ owner có thể xem)
- Review liên kết `booking_id` (verify guest)

### ⏳ TODO (nên thêm)
- Row-Level Security (RLS) trên Supabase
- API authentication (chỉ user authen mới call API)
- Pricing validation server-side

---

## 📈 Performance Notes

### Optimizations hiện tại
- Rooms cached trong `allRooms` state (không refetch mỗi lần filter)
- Bookings lưu local + Supabase (fallback nếu offline)
- UUID indexing trong DB (`idx_bookings_user_id`, etc.)

### Có thể optimize thêm
- Pagination rooms (load 20 at a time)
- Supabase Realtime subscriptions (live booking updates)
- Image CDN (store room images riêng, không trong DB)

---

## 🐛 Debug Tips

### Console output
```javascript
// Supabase client logs
console.log(`✓ Loaded ${transformedRooms.length} rooms from Supabase`);
console.warn('Supabase unavailable, using local seed data:', error.message);
```

### Browser DevTools
- **Console** → Kiểm tra error
- **Network** → POST/GET tới `supabase.co`
- **Application > Storage** → Check localStorage

### Supabase Dashboard
- **Table Editor** → Xem dữ liệu tables
- **SQL Editor** → Test queries
- **Logs** → Xem request logs

---

## 📋 Checklist Deployment

- [ ] `.env` có Supabase URL + key
- [ ] `@supabase/supabase-js` cài
- [ ] Supabase schema chạy (01 + 02 SQL)
- [ ] Test fetch rooms (console: "✓ Loaded X rooms")
- [ ] Test booking → Kiểm tra DB
- [ ] Test review → Kiểm tra DB
- [ ] `.gitignore` có `.env` (không commit)
- [ ] Enable RLS trên Supabase (production)

---

## 🆘 Troubleshooting

| Vấn đề | Giải pháp |
|--------|----------|
| "using local seed data" | Kiểm tra `.env`, Supabase keys |
| Rooms không hiển thị | Verify `room_types`, `rooms` có data |
| Booking không lưu | Check network → Supabase; console → error |
| Slow performance | Disable RLS debug; optimize queries |

Xem `MIGRATION_GUIDE.md` phần Troubleshooting để chi tiết.

---

## 📚 Tài liệu
- Supabase: https://supabase.com/docs
- Migration Guide: `MIGRATION_GUIDE.md`
- Code: `src/utils/supabaseClient.js`, `src/context/RoomContext.jsx`

---

**Status: ✅ Integration Complete**  
Mọi thứ đã sẵn sàng để bạn setup Supabase và chạy.
