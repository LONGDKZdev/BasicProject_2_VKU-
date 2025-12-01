# 📸 Supabase Storage Setup - Hướng Dẫn Chi Tiết

## Bước 1: Tạo Storage Bucket trong Supabase

1. Vào **Supabase Dashboard** → **Storage**
2. Click **"Create a new bucket"**
3. Đặt tên: `hotel-rooms` (hoặc tên khác)
4. Chọn **Public** (để lấy ảnh qua URL)
5. Click **Create bucket**

---

## Bước 2: Upload Ảnh lên Storage

### Cách 1: Upload Manual (đơn giản)
1. Mở bucket `hotel-rooms` vừa tạo
2. Click **"Upload file"**
3. Chọn từ `src/assets/img/rooms/`:
   - 1.png, 1-lg.png
   - 2.png, 2-lg.png
   - 3.png, 3-lg.png
   - ... (tất cả 16 file)
4. Upload hết

### Cách 2: Dùng Supabase CLI (nhanh hơn)
```bash
# Install CLI (nếu chưa có)
npm install -g @supabase/cli

# Login
supabase login

# Upload folder
supabase storage upload hotel-rooms src/assets/img/rooms/ --recursive
```

---

## Bước 3: Lấy URL Công Khai Của Ảnh

Sau khi upload, mỗi file sẽ có URL dạng:
```
https://{PROJECT_ID}.supabase.co/storage/v1/object/public/hotel-rooms/{filename}
```

**Ví dụ:**
```
https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/1.png
https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/1-lg.png
```

---

## Bước 4: Cập Nhật Database Với URL Ảnh

Chạy file `05_seed_room_images.sql` trong Supabase SQL Editor để cập nhật bảng `room_images` với URL ảnh.

**Hoặc chạy manual:**
```sql
-- Cập nhật ảnh cho mỗi room_type
insert into public.room_images (room_type_id, image_url, image_lg_url, display_order)
select
  rt.id,
  'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/1.png',
  'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/1-lg.png',
  1
from public.room_types rt
where rt.code = 'STD'
limit 1
on conflict do nothing;
```

---

## Bước 5: Cấu Hình RLS (Row Level Security)

Để public có thể read ảnh mà không cần auth:

1. Vào **Storage** → **Policies** (tab `hotel-rooms`)
2. Click **"New Policy"** → **"For queries with filters"**
3. Chọn **SELECT**
4. Role: `anon`
5. MIME type: (để trống)
6. Click **"Create"**

Hoặc chạy SQL:
```sql
create policy "Public Read Access" on storage.objects
  for select
  using (bucket_id = 'hotel-rooms');
```

---

## 📋 Thông Tin Cần Thiết

- **Project ID**: `sxteddkozzqniebfstag` (từ URL Supabase)
- **Bucket Name**: `hotel-rooms`
- **Storage Base URL**: 
  ```
  https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/
  ```

---

## 🔗 Mapping Ảnh → Room Types

| Room Type | Thumbnail | Large |
|-----------|-----------|-------|
| Standard (STD) | 1.png | 1-lg.png |
| Deluxe (DLX) | 2.png | 2-lg.png |
| Suite (SUI) | 3.png | 3-lg.png |
| Penthouse (PEN) | 4.png | 4-lg.png |
| Combo (CMB) | 5.png | 5-lg.png |
| (Extra) | 6-8.png | 6-8-lg.png |

---

## 📝 Sau Khi Upload

Khi tất cả ảnh đã upload và database cập nhật, app sẽ:
1. Fetch room_images từ database
2. Hiển thị ảnh từ Supabase Storage URL
3. Cache ảnh phía client

Done! ✅
