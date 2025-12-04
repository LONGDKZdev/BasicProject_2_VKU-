# 📋 KẾ HOẠCH HOÀN THIỆN DỰ ÁN - HOTEL BOOKING SYSTEM

**Ngày tạo:** 2025-12-04  
**Mục tiêu:** Đơn giản hóa database schema và fix bug đăng nhập/đăng ký

---

## 🎯 MỤC TIÊU

1. ✅ **Đơn giản hóa database schema** - Giảm độ phức tạp cho đồ án nhỏ
2. ✅ **Fix bug đăng nhập/đăng ký** - Liên quan đến Supabase data
3. ✅ **Không thay đổi giao diện** - Chỉ tập trung vào chức năng
4. ✅ **Code kết hợp fix bug** - Vừa refactor vừa fix

---

## 🔍 PHÂN TÍCH VẤN ĐỀ HIỆN TẠI

### 1. Database Schema - Quá phức tạp

**Vấn đề:**
- Có 2 bảng quản lý user: `profiles` + `admin_accounts` (dư thừa)
- Trigger `handle_new_user()` có thể không hoạt động đúng
- Code check admin dùng `admin_accounts` nhưng có chỗ check `role` trong profiles

**Giải pháp:**
- Gộp admin vào `profiles` (thêm cột `role` hoặc `is_admin`)
- Bỏ bảng `admin_accounts` 
- Đơn giản hóa trigger

### 2. Bug Đăng Nhập/Đăng Ký

**Vấn đề phát hiện:**
1. **AuthContext.jsx:190** - Có `debugger;` statement (cần xóa)
2. **Trigger không tạo profile** - Có thể do lỗi trigger hoặc permission
3. **Admin check sai** - Code check `enrichedUser.role !== 'admin'` nhưng schema không có `role` trong profiles
4. **Seed data sai** - `04_Full_seed_data.sql` query từ `admin_accounts` nhưng user thường không có trong đó

**Giải pháp:**
- Fix trigger để đảm bảo profile được tạo
- Thống nhất cách check admin (dùng `is_admin` boolean trong profiles)
- Fix seed data

---

## 📝 KẾ HOẠCH CHI TIẾT

### PHASE 1: Đơn giản hóa Database Schema ⏱️ 30 phút

#### Bước 1.1: Tạo Schema mới đơn giản
**File:** `Query_V2/02_SIMPLE_schema.sql` (tạo mới)

**Thay đổi:**
- ✅ Gộp `admin_accounts` vào `profiles` (thêm cột `is_admin boolean`)
- ✅ Bỏ bảng `admin_accounts`
- ✅ Đơn giản hóa trigger `handle_new_user()`
- ✅ Giữ nguyên các bảng khác (rooms, bookings, etc.)

**Cấu trúc mới:**
```sql
-- profiles table (đơn giản hóa)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  is_admin boolean not null default false,  -- THÊM CỘT NÀY
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- BỎ bảng admin_accounts
```

#### Bước 1.2: Cập nhật RLS
**File:** `Query_V2/03_Setup_RLS.sql`

**Thay đổi:**
- ✅ Bỏ `admin_accounts` khỏi RLS (vì không còn bảng này)
- ✅ Giữ RLS disabled cho tất cả bảng

#### Bước 1.3: Cập nhật Seed Data
**File:** `Query_V2/04_Full_seed_data.sql`

**Thay đổi:**
- ✅ Bỏ phần seed `admin_accounts`
- ✅ Seed admin user vào `profiles` với `is_admin = true`
- ✅ Fix query bookings (không query từ `admin_accounts` nữa)

#### Bước 1.4: Cập nhật Clean Data
**File:** `Query_V2/01_Clean_Data.sql`

**Thay đổi:**
- ✅ Bỏ `drop table admin_accounts`
- ✅ Giữ nguyên các bảng khác

---

### PHASE 2: Fix Code - AuthContext & Services ⏱️ 45 phút

#### Bước 2.1: Fix AuthContext.jsx
**File:** `src/context/AuthContext.jsx`

**Thay đổi:**
1. ✅ **Xóa `debugger;`** ở dòng 190
2. ✅ **Fix `fetchAdminAccount()`** - Query từ `profiles` thay vì `admin_accounts`:
   ```js
   const fetchAdminAccount = async (userId) => {
     const { data } = await supabase
       .from('profiles')
       .select('is_admin')
       .eq('id', userId)
       .single();
     return data?.is_admin === true;
   };
   ```
3. ✅ **Fix `enrichUser()`** - Thêm `isAdmin` từ profile
4. ✅ **Fix `adminLogin()`** - Check `isAdmin` thay vì `role`

#### Bước 2.2: Fix authService.js
**File:** `src/services/authService.js`

**Thay đổi:**
- ✅ Cập nhật `upsertUserProfile()` - Không cần `role` nữa, dùng `is_admin`

#### Bước 2.3: Fix seed-users.js
**File:** `seed-users.js`

**Thay đổi:**
- ✅ Bỏ phần tạo `admin_accounts`
- ✅ Tạo admin user trong `profiles` với `is_admin = true`

---

### PHASE 3: Fix Code - Admin Services ⏱️ 30 phút

#### Bước 3.1: Fix adminService.js
**File:** `src/services/adminService.js`

**Thay đổi:**
- ✅ Bỏ query từ `admin_accounts`
- ✅ Query từ `profiles` với `is_admin = true`

#### Bước 3.2: Fix adminService_REFACTORED.js
**File:** `src/services/adminService_REFACTORED.js`

**Thay đổi:**
- ✅ Tương tự như adminService.js

---

### PHASE 4: Testing & Verification ⏱️ 30 phút

#### Bước 4.1: Test Database
1. ✅ Chạy `01_Clean_Data.sql` để xóa dữ liệu cũ
2. ✅ Chạy `02_SIMPLE_schema.sql` để tạo schema mới
3. ✅ Chạy `03_Setup_RLS.sql` để setup RLS
4. ✅ Chạy `04_Full_seed_data.sql` để seed data
5. ✅ Chạy `node seed-users.js` để tạo test users

#### Bước 4.2: Test Đăng Ký
1. ✅ Đăng ký user mới
2. ✅ Kiểm tra profile được tạo trong `profiles`
3. ✅ Kiểm tra `is_admin = false` mặc định

#### Bước 4.3: Test Đăng Nhập
1. ✅ Đăng nhập user thường
2. ✅ Đăng nhập admin (admin@hotel.com)
3. ✅ Kiểm tra `isAdmin()` trả về đúng

#### Bước 4.4: Test Admin Panel
1. ✅ Truy cập `/admin` với admin account
2. ✅ Kiểm tra các chức năng admin hoạt động

---

## 📊 SO SÁNH TRƯỚC/SAU

### Database Schema

| Trước | Sau |
|-------|-----|
| `profiles` + `admin_accounts` (2 bảng) | `profiles` (1 bảng, có `is_admin`) |
| Trigger phức tạp | Trigger đơn giản |
| Check admin từ `admin_accounts` | Check admin từ `profiles.is_admin` |

### Code Changes

| File | Thay đổi |
|------|----------|
| `AuthContext.jsx` | Fix admin check, xóa debugger |
| `authService.js` | Update profile upsert |
| `adminService.js` | Query từ profiles thay vì admin_accounts |
| `seed-users.js` | Tạo admin trong profiles |

---

## ✅ CHECKLIST HOÀN THIỆN

### Database
- [ ] Tạo `02_SIMPLE_schema.sql` (schema đơn giản)
- [ ] Cập nhật `01_Clean_Data.sql` (bỏ admin_accounts)
- [ ] Cập nhật `03_Setup_RLS.sql` (bỏ admin_accounts)
- [ ] Cập nhật `04_Full_seed_data.sql` (fix seed data)
- [ ] Test chạy SQL scripts thành công

### Code - Auth
- [ ] Fix `AuthContext.jsx` (xóa debugger, fix admin check)
- [ ] Fix `authService.js` (update profile upsert)
- [ ] Fix `seed-users.js` (tạo admin trong profiles)

### Code - Admin
- [ ] Fix `adminService.js` (query từ profiles)
- [ ] Fix `adminService_REFACTORED.js` (query từ profiles)

### Testing
- [ ] Test đăng ký user mới
- [ ] Test đăng nhập user thường
- [ ] Test đăng nhập admin
- [ ] Test admin panel hoạt động
- [ ] Test tất cả chức năng booking

---

## 🚀 THỨ TỰ THỰC HIỆN

### Bước 1: Backup (QUAN TRỌNG!)
```bash
# Backup database hiện tại (nếu có dữ liệu quan trọng)
# Hoặc chạy trên database test trước
```

### Bước 2: Tạo Schema Mới
1. Tạo `02_SIMPLE_schema.sql`
2. Test chạy trên Supabase SQL Editor

### Bước 3: Update Code
1. Fix `AuthContext.jsx`
2. Fix `authService.js`
3. Fix `seed-users.js`
4. Fix `adminService.js`

### Bước 4: Test
1. Chạy SQL scripts
2. Chạy `node seed-users.js`
3. Test đăng ký/đăng nhập
4. Test admin panel

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Backup trước khi thay đổi** - Nếu có dữ liệu quan trọng
2. **Test trên database test trước** - Không test trực tiếp trên production
3. **Không thay đổi giao diện** - Chỉ fix chức năng
4. **Giữ nguyên các bảng khác** - Chỉ đơn giản hóa user/admin management

---

## 📝 GHI CHÚ

- Schema mới đơn giản hơn, dễ maintain hơn
- Code sẽ nhất quán hơn (không còn 2 cách check admin)
- Bug đăng nhập/đăng ký sẽ được fix
- Không ảnh hưởng đến giao diện

---

**Tạo bởi:** AI Assistant  
**Ngày:** 2025-12-04  
**Version:** 1.0

