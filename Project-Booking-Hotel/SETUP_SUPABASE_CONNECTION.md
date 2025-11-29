# 📚 Hướng Dẫn Kết Nối Supabase Với Dự Án

## 🎯 Mục Tiêu
Kết nối frontend ReactJS của bạn với Supabase (backend) để lưu trữ persistent data (bookings, reviews, rooms) thay vì localStorage.

---

## 📋 Bước 1: Chuẩn Bị Supabase Project

### 1.1 Đăng Nhập / Tạo Project Supabase
1. Truy cập: https://supabase.com
2. Đăng nhập bằng GitHub/Google/Email
3. Tạo project mới:
   - **Project Name**: `hotel-booking-adina` (hoặc tên khác)
   - **Database Password**: Lưu lại password này
   - **Region**: Chọn gần nhất với location (e.g., Southeast Asia)
4. Chờ initialization (~2-5 phút)

### 1.2 Chạy SQL Schema
**Thay Bảng Hiện Tại Bằng Schema Mới:**

1. Mở Supabase Dashboard
2. Vào **SQL Editor** (sidebar trái)
3. Tạo **New Query**
4. Copy & Paste toàn bộ nội dung từ file:
   ```
   Query/01_create_schema_tables.txt
   ```
5. Click **Run** (hoặc Ctrl+Enter)
6. ✅ Kết quả: Tất cả tables được tạo thành công

> **Lưu Ý**: Nếu bạn đã có tables cũ:
> - Supabase sẽ không xóa vì dùng `CREATE TABLE IF NOT EXISTS`
> - Bạn có thể xóa tay trước hoặc modify schema

---

## 🔑 Bước 2: Lấy Supabase API Keys

### 2.1 Tìm API Keys
1. Vào **Settings** (gear icon) → **API**
2. Hoặc: **Project Settings** → **API**
3. Copy 2 giá trị quan trọng:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

### 2.2 Lưu Vào `.env` File
Tạo file `.env` ở thư mục root dự án:
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email Service (optional)
REACT_APP_EMAILJS_SERVICE_ID=service_xxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxx
REACT_APP_EMAILJS_PUBLIC_KEY=public_key_xxx
```

**⚠️ Important:**
- Thêm `.env` vào `.gitignore` (đừng commit secrets)
- Chỉ chia sẻ `REACT_APP_SUPABASE_URL` công khai
- `REACT_APP_SUPABASE_ANON_KEY` cũng public nhưng cần RLS (Row-Level Security) để bảo vệ

---

## 💻 Bước 3: Setup Frontend

### 3.1 Cài Đặt Dependencies
```bash
npm install @supabase/supabase-js
```

### 3.2 Restart Development Server
```bash
npm run dev
```

### 3.3 Kiểm Tra Console
1. Mở Browser DevTools: `F12`
2. Tab **Console**
3. Tìm dòng:
   ```
   ✓ Loaded X rooms from Supabase
   ```
   - ✅ Thấy → Kết nối thành công!
   - ⚠️ Không thấy → Fallback localhost, check lỗi

---

## 🧪 Bước 4: Test Các Tính Năng

### 4.1 Test Xem Phòng
1. Vào trang **Rooms**
2. Phải thấy danh sách phòng
3. Filters (category, price, etc.) phải hoạt động

### 4.2 Test Đặt Phòng
1. Chọn phòng bất kỳ
2. Click **"Book now"**
3. Điền:
   - Check-in: `2025-01-15`
   - Check-out: `2025-01-17`
   - Adults: `2`
4. Click **"Confirm reservation"**
5. Hoàn tất QR payment (hoặc skip nếu test)

### 4.3 Kiểm Tra Data Trong Supabase
1. Vào **Supabase Dashboard**
2. **Table Editor** → Chọn table `bookings`
3. Phải thấy booking mới được tạo ✅

### 4.4 Test Thêm Review
1. Đăng nhập hoặc tạo tài khoản
2. Vào chi tiết phòng
3. Scroll xuống **"Share your stay experience"**
4. Thêm rating + comment
5. Submit
6. Kiểm tra Supabase table `room_reviews`

---

## 🔧 Bước 5: Migration Dữ Liệu (Tuỳ Chọn)

Nếu bạn có booking/review trong localStorage cũ:

### 5.1 Export Data Từ Browser
1. Mở DevTools (F12) → Console
2. Chạy lệnh:
   ```javascript
   JSON.parse(localStorage.getItem('hotel_bookings'))
   JSON.parse(localStorage.getItem('hotel_room_reviews'))
   ```
3. Copy & lưu vào file

### 5.2 Import Vào Supabase
1. Vào SQL Editor
2. Viết INSERT query từ dữ liệu cũ (adjust schema mapping)
3. Run

Hoặc để tự động, bạn có thể viết script trong `src/utils/migrations.js`

---

## 🛡️ Bước 6: Enable Row-Level Security (RLS)

**Bảo vệ dữ liệu người dùng:**

1. Supabase Dashboard → **Authentication** → **Policies**
2. Enable RLS cho tables:
   - `profiles` — user chỉ xem/edit dữ liệu của họ
   - `bookings` — user chỉ xem/edit booking của họ
   - `room_reviews` — public read, chỉ auth users create
3. Viết policies (xem Supabase docs)

**Ví dụ Policy cho `bookings`:**
```sql
-- Cho phép user xem booking của họ
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Cho phép user insert booking
CREATE POLICY "Users can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 📊 Bước 7: Seed Data (Dữ Liệu Ban Đầu)

### 7.1 Insert Room Types
Dùng SQL Editor chạy:
```sql
INSERT INTO public.room_types (code, name, description, base_capacity, max_person, base_price, facilities)
VALUES
  ('standard', 'Standard', 'Comfortable rooms with essential amenities', 1, 3, 195.00, 
   ARRAY['Wifi','Coffee','Bath','Parking Space','Swimming Pool','Breakfast','GYM','Drinks']),
  ('deluxe', 'Deluxe', 'Premium experience with elegant design', 2, 4, 295.00,
   ARRAY['Wifi','Coffee','Bath','Parking Space','Swimming Pool','Breakfast','GYM','Drinks']),
  ('suite', 'Suite', 'Spacious suites for ultimate comfort', 2, 6, 385.00,
   ARRAY['Wifi','Coffee','Bath','Parking Space','Swimming Pool','Breakfast','GYM','Drinks']),
  ('penthouse', 'Penthouse', 'Exclusive top-floor residences', 2, 6, 460.00,
   ARRAY['Wifi','Coffee','Bath','Parking Space','Swimming Pool','Breakfast','GYM','Drinks']),
  ('combo', 'Combo Package', 'Value-packed packages with extras', 1, 6, 315.00,
   ARRAY['Wifi','Coffee','Bath','Parking Space','Swimming Pool','Breakfast','GYM','Drinks']);
```

### 7.2 Insert Sample Rooms & Pricing Rules
Xem file: `Query/02_seed_rooms_from_migration.sql`

---

## 🚨 Troubleshooting

### "Supabase unavailable, using local seed data"
**Nguyên Nhân**: `.env` không đúng hoặc DB không khả dụng

**Giải Pháp**:
1. Verify `.env` có:
   - `REACT_APP_SUPABASE_URL` ✅
   - `REACT_APP_SUPABASE_ANON_KEY` ✅
2. Check network (F12 → Network):
   - Phải có request tới `https://xxx.supabase.co/`
3. Kiểm tra console lỗi gì

### Rooms không hiển thị
1. **Verify schema**: Supabase > Table Editor > `rooms` có dữ liệu không?
   - Nếu không, chạy seed SQL (7.1 & 7.2)
2. **Check query**: Supabase > SQL Editor:
   ```sql
   SELECT COUNT(*) FROM public.room_types;
   SELECT COUNT(*) FROM public.rooms;
   ```
3. **Network**: Check DevTools xem có error từ API không

### Booking không lưu vào DB
1. **Check dbConnected**: Browser Console xem có "✓ Loaded" không
2. **Auth**: Bạn đã login không? (bookings cần `user_id`)
3. **RLS Policies**: Nếu enable RLS, đúng policies chưa?

### Performance chậm
- Nếu dữ liệu lớn, thêm pagination hoặc lazy-load
- Optimize Supabase queries (chỉ select cần thiết)

---

## 📱 Bước 8: Deploy to Production

### 8.1 Environment Variables
Trên hosting (Vercel, Netlify, etc.), thêm:
```
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

### 8.2 Enable RLS + Auth
- Setup authentication (Email/OAuth)
- Enable RLS policies (5 bước)
- Test production

### 8.3 Backup & Monitoring
- Supabase tự động backup daily
- Monitor logs & performance di Supabase Dashboard

---

## 🎓 Tài Liệu Tham Khảo
- Supabase Docs: https://supabase.com/docs
- JS Client: https://supabase.com/docs/reference/javascript/
- Auth: https://supabase.com/docs/guides/auth
- RLS: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Checklist Setup
- [ ] Tạo Supabase project
- [ ] Chạy SQL schema (01_create_schema_tables.txt)
- [ ] Copy API keys vào `.env`
- [ ] Chạy `npm install @supabase/supabase-js`
- [ ] Restart dev server
- [ ] Kiểm tra console "✓ Loaded X rooms"
- [ ] Test xem phòng
- [ ] Test đặt phòng
- [ ] Test thêm review
- [ ] Seed data (room types, samples)
- [ ] Enable RLS policies (production)
- [ ] Test production deployment

---

**Mất bao lâu?** ~20-30 phút để cài và test cơ bản.

Nếu gặp vấn đề, check console browser (F12) và Supabase logs!
