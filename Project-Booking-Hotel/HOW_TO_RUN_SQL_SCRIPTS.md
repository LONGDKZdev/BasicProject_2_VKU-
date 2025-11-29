# 🗄️ Hướng Dẫn Chạy SQL Scripts trên Supabase

**Mục tiêu:** Setup database schema và seed dữ liệu từ các file SQL trong thư mục `Query/`

---

## 📋 Danh Sách SQL Scripts

| File | Mục Đích | Thứ Tự |
|------|---------|--------|
| `01_create_schema_tables.txt` | Tạo tables & functions | 1️⃣ |
| `02_control_functions_views.txt` | Tạo functions & views | 2️⃣ |
| `03_role_and_security.txt` | Bật RLS & policies | 3️⃣ |
| `04_update_data.txt` | Seed dữ liệu 40 phòng | 4️⃣ |
| `05_DeleteALL.txt` | Xóa tất cả dữ liệu (nếu cần) | ⚠️ |

---

## 🚀 Bước 1: Truy Cập Supabase SQL Editor

1. Vào https://app.supabase.com
2. Chọn project của bạn
3. Click **SQL Editor** (bên trái)
4. Click **New Query**

---

## 🔧 Bước 2: Chạy Script 1 - Tạo Tables

### Cách 1: Copy-Paste từ File

1. Mở file: `Query/01_create_schema_tables.txt`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor
4. Click **Run** (hoặc Ctrl+Enter)
5. Chờ hoàn thành ✅

### Cách 2: Upload File (Nếu Supabase hỗ trợ)

1. Click **Upload SQL file**
2. Chọn file `01_create_schema_tables.txt`
3. Click **Run**

### Expected Output
```
✅ Tables created successfully
- profiles
- room_types
- rooms
- room_images
- bookings
- restaurant_bookings
- spa_bookings
- room_reviews
- ... (và các tables khác)
```

---

## 🔧 Bước 3: Chạy Script 2 - Tạo Functions

1. Mở file: `Query/02_control_functions_views.txt`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor mới
4. Click **Run**

### Expected Output
```
✅ Functions created:
- is_room_available()
- get_available_rooms()
```

---

## 🔧 Bước 4: Chạy Script 3 - Bật RLS & Security

1. Mở file: `Query/03_role_and_security.txt`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor mới
4. Click **Run**

### Expected Output
```
✅ RLS enabled on all tables
✅ Policies created:
- profiles_owner_read
- room_types_select_all
- bookings_user_read
- ... (và các policies khác)
```

---

## 🔧 Bước 5: Chạy Script 4 - Seed Dữ Liệu

1. Mở file: `Query/04_update_data.txt`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor mới
4. Click **Run**

### Expected Output
```
✅ Amenities inserted: 8
✅ Room types inserted: 5
✅ Rooms inserted: 40
✅ Reviews inserted: 100+
✅ Price rules inserted
```

---

## ✅ Bước 6: Xác Minh Dữ Liệu

### Kiểm tra Tables

1. Click **Table Editor** (bên trái)
2. Xem danh sách tables:
   - `room_types` - Nên có 5 rows (STD, DLX, SUI, PEN, CMB)
   - `rooms` - Nên có 40 rows
   - `room_images` - Nên có images
   - `bookings` - Trống (chưa có bookings)
   - `room_reviews` - Nên có reviews

### Kiểm tra Dữ Liệu

```sql
-- Chạy các query này để verify:

-- 1. Kiểm tra room types
SELECT * FROM public.room_types;
-- Nên thấy: STD, DLX, SUI, PEN, CMB

-- 2. Kiểm tra rooms
SELECT COUNT(*) FROM public.rooms;
-- Nên thấy: 40

-- 3. Kiểm tra images
SELECT COUNT(*) FROM public.room_images;
-- Nên thấy: > 0

-- 4. Kiểm tra reviews
SELECT COUNT(*) FROM public.room_reviews;
-- Nên thấy: > 0
```

---

## 🔄 Bước 7: Kiểm Tra RLS Policies

1. Click **Authentication** (bên trái)
2. Click **Policies**
3. Xem danh sách policies:
   - `room_types` - Nên có `rt_select_all`
   - `rooms` - Nên có `r_select_all`
   - `bookings` - Nên có `b_owner_read`, `b_owner_insert`
   - ... (và các policies khác)

---

## ⚠️ Nếu Có Lỗi

### Lỗi: "Table already exists"
```
✅ Bình thường - Scripts dùng "create table if not exists"
✅ Có thể chạy lại mà không lo
```

### Lỗi: "Permission denied"
```
❌ Vấn đề: RLS policy chặn
✅ Giải pháp: 
  1. Chạy script 3 (03_role_and_security.txt)
  2. Hoặc disable RLS tạm thời
```

### Lỗi: "Foreign key constraint failed"
```
❌ Vấn đề: Tables phụ thuộc chưa được tạo
✅ Giải pháp:
  1. Chạy script 1 trước (01_create_schema_tables.txt)
  2. Sau đó chạy script 4 (04_update_data.txt)
```

### Lỗi: "Syntax error"
```
❌ Vấn đề: Copy-paste không đúng
✅ Giải pháp:
  1. Xóa query hiện tại
  2. Copy lại từ file
  3. Chạy lại
```

---

## 🗑️ Nếu Cần Xóa Dữ Liệu

### Xóa Tất Cả (Reset Database)

1. Mở file: `Query/05_DeleteALL.txt`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor
4. Click **Run**

⚠️ **Cảnh báo:** Điều này sẽ xóa TẤT CẢ dữ liệu!

### Xóa Riêng Lẻ

```sql
-- Xóa bookings
DELETE FROM public.bookings;

-- Xóa reviews
DELETE FROM public.room_reviews;

-- Xóa rooms
DELETE FROM public.rooms;

-- Xóa room types
DELETE FROM public.room_types;
```

---

## 📊 Kết Quả Cuối Cùng

Sau khi chạy tất cả scripts:

```
✅ Database Schema
  - 15+ tables
  - 10+ functions
  - 20+ RLS policies

✅ Dữ Liệu
  - 5 room types
  - 40 rooms
  - 8 amenities
  - 100+ reviews
  - Price rules
  - Holiday calendar

✅ Security
  - RLS enabled
  - Policies configured
  - User authentication ready
```

---

## 🔗 Liên Kết Hữu Ích

- [Supabase SQL Editor](https://app.supabase.com)
- [Supabase Docs - SQL](https://supabase.com/docs/guides/database)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 📝 Checklist

- [ ] Chạy script 1 (create tables)
- [ ] Chạy script 2 (functions)
- [ ] Chạy script 3 (RLS & security)
- [ ] Chạy script 4 (seed data)
- [ ] Kiểm tra tables trong Table Editor
- [ ] Kiểm tra RLS policies
- [ ] Verify dữ liệu với queries
- [ ] Test connection từ frontend

---

## 🚀 Bước Tiếp Theo

Sau khi setup database:

1. ✅ Database schema ready
2. ⏳ Cập nhật frontend code (SUPABASE_SYNC_GUIDE.md)
3. ⏳ Test bookings sync
4. ⏳ Test reviews sync
5. ⏳ Deploy lên production

---

*Hướng dẫn được tạo: Nov 23, 2025*
