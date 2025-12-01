# Hướng dẫn Migration: Từ LocalStorage sang Supabase

## 📋 Tóm tắt những gì đã thay đổi

### 1. Files mới tạo
- `src/utils/supabaseClient.js` — Client Supabase với các helper functions
- `Query/02_seed_rooms_from_migration.sql` — SQL seed để import room data vào DB
- `.env.example` — Template biến môi trường

### 2. Files đã chỉnh sửa
- `src/context/RoomContext.jsx` — Tích hợp Supabase, hỗ trợ fallback localStorage
- `src/pages/RoomDetails.jsx` — Hỗ trợ UUID strings thay vì numeric IDs
- `src/components/RoomTypeSelector.jsx` — Nhận xét về mapping category codes

## 🔧 Bước 1: Cấu hình Supabase

### 1.1 Tạo Supabase project
1. Truy cập https://supabase.com
2. Đăng nhập / Đăng ký
3. Tạo project mới
4. Chờ initialization (vài phút)

### 1.2 Chạy SQL schema
1. Mở **SQL Editor** trong Supabase dashboard
2. Tạo một query mới
3. Copy & paste nội dung `Query/01_create_schema_tables.txt`
4. Chạy (Ctrl+Enter hoặc nút Run)
5. Kiểm tra: không có lỗi

### 1.3 Seed dữ liệu rooms
1. Mở SQL Editor lại
2. Tạo query mới
3. Copy & paste nội dung `Query/02_seed_rooms_from_migration.sql`
4. Chạy

### 1.4 Lấy API keys
1. Vào Settings > API (hoặc API > Configuration)
2. Copy:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public** key → `REACT_APP_SUPABASE_ANON_KEY`

## 🔑 Bước 2: Cấu hình Frontend

### 2.1 Tạo file `.env` (nếu chưa có)
```bash
# Copy từ .env.example
cp .env.example .env
```

Sửa file `.env`:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.2 Cài đặt @supabase/supabase-js
```bash
npm install @supabase/supabase-js
```

### 2.3 Restart development server
```bash
npm run dev
```

## ✅ Bước 3: Kiểm tra & Test

### 3.1 Kiểm tra console browser
1. Mở F12 (DevTools)
2. Tab **Console**
3. Tìm dòng: `✓ Loaded X rooms from Supabase`
   - Nếu thấy → ✅ Kết nối thành công
   - Nếu không → ⚠️ Fallback localStorage

### 3.2 Test các tính năng cơ bản

**Xem phòng:**
- Vào trang Rooms
- Phải thấy các phòng được hiển thị
- Filter/search phải hoạt động

**Đặt phòng:**
1. Chọn phòng bất kỳ → Click "Book now"
2. Điền thông tin:
   - Check-in: 2025-01-15
   - Check-out: 2025-01-17
   - Adults: 2
3. Click "Confirm reservation"
4. Hoàn tất thanh toán QR (hoặc test)

**Kiểm tra trong Supabase:**
1. Vào **Table Editor**
2. Chọn table `bookings`
3. Phải thấy booking mới được tạo

### 3.3 Test Review
1. Đăng nhập (hoặc tạo tài khoản)
2. Vào chi tiết phòng
3. Scroll xuống "Share your stay experience"
4. Thêm review
5. Kiểm tra trong Supabase table `room_reviews`

## 🔄 Bước 4: Migration dữ liệu (nếu có production bookings)

Nếu bạn có bookings/reviews hiện tại trong localStorage, cần migrate:

```sql
-- Trong Supabase SQL Editor, chạy script migrate dari localStorage JSON
-- Ví dụ (bạn sẽ cần adjust theo dữ liệu thực tế):

INSERT INTO public.bookings (
  user_id, confirmation_code, room_id, room_name,
  user_name, user_email, check_in, check_out,
  num_adults, num_children, total_nights, total_amount,
  status, created_at
) VALUES
  -- Paste data từ localStorage.hotel_bookings ở đây
  (/* ... */);
```

## 📝 Bước 5: Triển khai Production

### 5.1 Enable Row-Level Security (RLS)
Để bảo mật Supabase:
1. Vào **Authentication > Policies** trong Supabase
2. Enable RLS cho các tables quan trọng:
   - `profiles` — chỉ user có thể xem/sửa dữ liệu của họ
   - `bookings` — chỉ user có thể xem/sửa booking của họ
   - `room_reviews` — public read, chỉ user authen mới create

### 5.2 Tạo API Policies (nếu cần)
Xem Supabase documentation: https://supabase.com/docs/guides/auth/row-level-security

### 5.3 Deploy to production
Đảm bảo:
- `.env` có Supabase keys đúng
- `@supabase/supabase-js` đã cài
- Không commit `.env` vào git (thêm vào `.gitignore`)

## 🚨 Troubleshooting

### "Supabase unavailable, using local seed data"
- Kiểm tra `.env` có đúng `REACT_APP_SUPABASE_URL` và `REACT_APP_SUPABASE_ANON_KEY`
- Kiểm tra network (F12 > Network tab) xem có request tới Supabase không
- Kiểm tra console xem có error gì

### Rooms không hiển thị
1. Verify schema: Supabase > Table Editor > `room_types`, `rooms` có dữ liệu không?
2. Check browser console lỗi gì
3. Kiểm tra Supabase SQL query (sử dụng `supabase-js` hoặc SQL editor)

### Booking không lưu vào DB
- Nếu `dbConnected = false`, booking sẽ lưu vào localStorage
- Check Supabase credentials đúng không
- Kiểm tra Network tab xem có POST request tới Supabase không

### Performance chậm
- Nếu dữ liệu nhiều, cần thêm pagination hoặc lazy-load
- Optimize queries: thêm `.select()` specific columns thay vì `*`

## 📚 Tài liệu liên quan
- Supabase Docs: https://supabase.com/docs
- JavaScript Client: https://supabase.com/docs/reference/javascript
- RLS: https://supabase.com/docs/guides/auth/row-level-security

## 🎯 Bước tiếp theo (tùy chọn)

1. **Price Rules Management** — Tạo admin UI để quản lý price_rules (hiện đang hardcode)
2. **Availability Calendar** — Hiển thị lịch availability trực quan
3. **Real-time subscriptions** — Dùng Supabase Realtime để cập nhật live
4. **Analytics** — Tạo dashboard để xem số liệu booking/revenue

---

**Mất bao lâu?** ~15-30 phút để setup + test cơ bản.

Nếu gặp vấn đề, kiểm tra console browser (F12) và Supabase dashboard.
