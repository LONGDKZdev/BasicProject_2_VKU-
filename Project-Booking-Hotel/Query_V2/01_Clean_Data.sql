-- =====================================================
-- 01_CLEAN_DB.SQL
-- =====================================================
-- Xóa bảng theo đúng thứ tự phụ thuộc để không lỗi khóa ngoại

-- 1. Xoá trigger trên auth.users (KHÔNG DÙNG NỮA - dùng bảng users riêng)
-- drop trigger if exists on_auth_user_created on auth.users;

-- 2. Xoá bảng (Drop con trước, cha sau)
drop table if exists public.audit_logs cascade;
drop table if exists public.password_reset_requests cascade;
drop table if exists public.spa_bookings cascade;
drop table if exists public.restaurant_bookings cascade;
drop table if exists public.booking_events cascade;
drop table if exists public.booking_pricing_breakdown cascade;
drop table if exists public.room_reviews cascade;
drop table if exists public.booking_items cascade;
drop table if exists public.bookings cascade;
drop table if exists public.promotions cascade;
drop table if exists public.price_rules cascade;
drop table if exists public.room_images cascade;
drop table if exists public.rooms cascade;
drop table if exists public.room_type_amenities cascade;
drop table if exists public.room_types cascade;
drop table if exists public.amenities cascade;
drop table if exists public.users cascade;  -- Bảng users riêng (không dùng auth.users)
drop table if exists public.profiles cascade;
drop table if exists public.holiday_calendar cascade;


-- 3. Xoá hàm và types
drop function if exists public.get_available_rooms(date, date, int);
drop function if exists public.get_available_rooms(date, date);
drop function if exists public.is_room_available(uuid, date, date);
drop function if exists public.is_admin(uuid);
-- drop function if exists public.handle_new_user();  -- Không dùng nữa
-- Drop trigger_set_timestamp() với CASCADE để xóa tất cả trigger phụ thuộc
-- (Các trigger sẽ được tạo lại trong 02_Int_schema.sql)
drop function if exists public.trigger_set_timestamp() cascade;

drop type if exists public.booking_status;
drop type if exists public.room_status;
drop type if exists public.discount_type;
drop type if exists public.price_rule_type;