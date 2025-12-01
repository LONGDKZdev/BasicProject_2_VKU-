# 🔄 Tóm Tắt Các Thay Đổi - Schema & Code Integration

## 📝 Tổng Quan

Dự án hiện tại đã được chuẩn bị để kết nối với Supabase. Dưới đây là danh sách chi tiết những thay đổi:

---

## 🗄️ Thay Đổi Database Schema

### File: `Query/01_create_schema_tables.txt` (Cập Nhật)

#### Bảng Mới / Cấu Trúc Mới:

| Bảng | Thay Đổi | Lý Do |
|------|---------|--------|
| `room_types` | Thêm `facilities[]`, bỏ `images jsonb` | Phù hợp frontend data |
| `rooms` | Thêm `size`, `name`, `type`, `category`, `price` (cached) | Map với roomData từ src/db/data.js |
| `room_images` | **Bảng mới** | Lưu ảnh room riêng, linh hoạt hơn |
| `bookings` | Thêm `num_adults`, `num_children` (rõ ràng) | Frontend compatibility |
| `room_reviews` | Giữ nguyên, comments rõ hơn | Map với reviews từ roomData |
| `booking_pricing_breakdown` | Thêm comment `rate_type` | Rõ: weekday/weekend/holiday |
| `booking_events` | Thêm comment event types | Rõ: cancel/modify/confirm/check_in/check_out |
| `holiday_calendar` | **Bảng mới** | Quản lý ngày lễ + multiplier price |

#### Schema Highlights:
```
Rooms (Physical)
  ├─→ room_type_id → room_types (Category)
  ├─→ name: "Standard Room", type: "Standard", category: "standard"
  ├─→ price, size, floor
  └─→ status: available/occupied/maintenance/cleaning

Room Types (Category)
  ├─→ code: standard/deluxe/suite/penthouse/combo
  ├─→ base_price, max_person
  ├─→ facilities[]: ["Wifi", "Coffee", ...]
  └─→ relationships: room_type_amenities, room_images, price_rules

Bookings
  ├─→ user_id (auth.users)
  ├─→ room_id (rooms)
  ├─→ check_in/check_out dates
  ├─→ pricing_breakdown: JSON [{date, label, rate}, ...]
  ├─→ history: JSON [{type, at, ...}, ...]
  └─→ status: pending/pending_payment/confirmed/completed/cancelled

Room Reviews
  ├─→ room_type_id (not room_id, vì review cho loại phòng)
  ├─→ booking_id (link tới booking nếu có)
  ├─→ user_id (auth.users)
  └─→ rating, comment, stay_date
```

---

## 💻 Thay Đổi Frontend Code

### Files Modified:

#### 1. **`src/utils/supabaseClient.js`** (Mới)
- Supabase client initialization
- Helper functions:
  - `fetchRooms()` — Get rooms từ DB
  - `checkRoomAvailability()` — Check conflict
  - `createBooking()` — Save booking
  - `createReview()` — Save review
  - `updateBookingStatus()` — Update status
  - `fetchUserBookings()` — Get user's bookings
  - `hasUserBookedRoomType()` — Verify user booked room type

#### 2. **`src/context/RoomContext.jsx`** (Cập nhật lớn)
**Thêm:**
- Import Supabase functions
- State: `dbConnected` (track DB connection status)
- Function: `transformDbRoomToFrontend()` (map DB room → frontend room)
- `useEffect` fetch rooms từ Supabase (async + fallback localStorage)

**Sửa:**
- `bookRoom()`: Save vào DB async + optimistic local update
- `addReview()`: Save vào DB + local update
- `isRoomAvailable()`: Check local bookings, `checkAvailabilityAsync()` check DB

**Giữ lại:**
- Toàn bộ logic cũ (filter, sort, pricing)
- localStorage fallback

#### 3. **`src/pages/RoomDetails.jsx`** (Sửa nhỏ)
```javascript
// Before: room = allRooms.find(roomItem => roomItem.id === Number(id));
// After: support both numeric IDs (legacy) and UUIDs (new)
room = allRooms.find(roomItem => roomItem.id === id || roomItem.id === Number(id));
```

#### 4. **`package.json`** (Thêm dependency)
```json
"@supabase/supabase-js": "^2.38.0"
```

#### 5. **`.env.example`** (Mới)
Template biến môi trường (xem 3.2)

---

## 📊 Data Flow

### Trước (Chỉ localStorage):
```
User
  ↓
Frontend (RoomContext, React components)
  ↓
localStorage ← Lưu booking, reviews, rooms
```

### Sau (Supabase + localStorage fallback):
```
User
  ↓
Frontend (RoomContext)
  ├─→ Try: Supabase (supabaseClient.js)
  │   ├─→ Success? → Use DB + set dbConnected=true
  │   └─→ Fail? → Fallback localStorage
  ├─→ localStorage (fallback, optimize UI)
  └─→ Optimistic update (save local immediately, sync DB async)
```

### Room Data Mapping:
```
DB (room_types + rooms)           →  Frontend (roomData shape)
├─ room_types.code                →  rooms[].category
├─ room_types.name                →  rooms[].type
├─ room_types.base_price          →  rooms[].price
├─ room_types.max_person          →  rooms[].maxPerson
├─ rooms.size                     →  rooms[].size
├─ rooms.name                     →  rooms[].name
├─ rooms.description              →  rooms[].description
├─ room_types.facilities[]        →  rooms[].facilities
├─ room_reviews (linked by type)  →  rooms[].reviews
└─ room_types.id                  →  rooms[].id (UUID)
```

---

## 🔑 Environment Variables

**File: `.env` (tạo mới ở root dự án)**
```bash
# Supabase - Bắt buộc
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email (tuỳ chọn)
REACT_APP_EMAILJS_SERVICE_ID=service_xxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxx
REACT_APP_EMAILJS_PUBLIC_KEY=public_key_xxx
```

**⚠️ QUAN TRỌNG:**
- Thêm `.env` vào `.gitignore` (đừng commit!)
- Chỉ chia sẻ URL công khai, anon key cần RLS

---

## 🎯 Bước Tiếp Theo (Để Kết Nối)

### Tóm tắt nhanh:

1. **Supabase Setup** (5 phút)
   - Tạo project: https://supabase.com
   - Chạy SQL: Copy-paste `Query/01_create_schema_tables.txt` vào SQL Editor
   - Lấy keys: Settings → API

2. **Frontend Setup** (5 phút)
   - Tạo `.env` file
   - Paste Supabase URL + anon key
   - Chạy `npm install @supabase/supabase-js`
   - Restart: `npm run dev`

3. **Verify Connection** (5 phút)
   - Mở browser DevTools (F12) → Console
   - Tìm: "✓ Loaded X rooms from Supabase"
   - Nếu không thấy → Check `.env` + network errors

4. **Test Features** (10 phút)
   - Test xem phòng → Phải từ DB
   - Test đặt phòng → Check Supabase `bookings` table
   - Test review → Check `room_reviews` table

5. **Seed Data** (3 phút)
   - Run SQL seed từ `Query/02_seed_rooms_from_migration.sql`
   - Hoặc insert room_types manually

---

## 📖 Documentation

### Hướng dẫn chi tiết:
- **`SETUP_SUPABASE_CONNECTION.md`** ← **👈 Đọc cái này trước!**
  - Step-by-step setup
  - Troubleshooting
  - RLS config
  - Deploy production

- **`MIGRATION_GUIDE.md`** (cũ, vẫn tham khảo được)
  - Architecture overview
  - Migration rollout plan

---

## 🔐 Security Notes

### Row-Level Security (RLS) - Nên Setup Sau
```
profiles    → User chỉ xem/edit của họ
bookings    → User chỉ xem/edit booking của họ
room_reviews → Public read, auth users create
rooms       → Public read
room_types  → Public read
```

### Anon Key vs Service Role Key
- **anon key** (PUBLIC): Dùng cho client, cần RLS
- **service_role** (SECRET): Dùng backend only, bypass RLS
- **API key (admin)**: Không dùng ở client!

---

## 📊 Migration Path

### Phase 1 (Now): Integration
- ✅ Supabase schema tạo
- ✅ Frontend code update
- ✅ Fallback localStorage

### Phase 2 (After): Data Migration
- Import bookings/reviews từ localStorage
- Verify data integrity
- Cleanup localStorage (optional)

### Phase 3 (Optional): Advanced
- Enable RLS + auth policies
- Setup real-time subscriptions (live updates)
- Analytics dashboard
- Admin panel (manage prices, rooms, bookings)

---

## 🆘 Quick Troubleshooting

| Vấn đề | Giải Pháp |
|--------|----------|
| "Supabase unavailable, using local seed data" | Check `.env`, verify Supabase URL + key |
| Rooms không hiển thị | SQL schema chạy ok? `SELECT * FROM room_types;` |
| Booking không lưu | Auth login? RLS policies enabled? Check network tab |
| Performance chậm | Dữ liệu quá lớn? Thêm pagination/lazy-load |
| Review không save | Verify `hasUserBookedRoom()` logic, check RLS |

---

## 📞 Cần Giúp?

1. Xem hướng dẫn: `SETUP_SUPABASE_CONNECTION.md`
2. Check console (F12) → Console tab
3. Xem Supabase logs: Dashboard → Logs
4. Debug network (F12) → Network tab, filter `supabase.co`

---

**Status**: ✅ Code & Schema Ready  
**Next**: Follow `SETUP_SUPABASE_CONNECTION.md` để kết nối!
