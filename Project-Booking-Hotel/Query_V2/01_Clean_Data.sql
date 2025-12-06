-- =====================================================
-- 01_CLEAN_DB.SQL
-- =====================================================
-- Xóa bảng theo đúng thứ tự phụ thuộc để không lỗi khóa ngoại

-- 1. Xoá trigger trên auth.users (KHÔNG DÙNG NỮA - dùng bảng users riêng)
-- drop trigger if exists on_auth_user_created on auth.users;

-- 2. XÓA TẤT CẢ TRIGGERS TRƯỚC (xóa trước khi drop tables để tránh lỗi)
-- Dùng DO block để check bảng tồn tại trước khi drop trigger
DO $$ 
BEGIN
  -- Xóa triggers trên price_rules (nếu bảng tồn tại)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'price_rules') THEN
    DROP TRIGGER IF EXISTS set_price_rules_updated_at ON public.price_rules CASCADE;
    DROP TRIGGER IF EXISTS audit_price_rules_trigger ON public.price_rules CASCADE;
    DROP TRIGGER IF EXISTS log_price_rules_changes ON public.price_rules CASCADE;
    DROP TRIGGER IF EXISTS price_rules_audit_trigger ON public.price_rules CASCADE;
  END IF;

  -- Xóa triggers trên promotions (nếu bảng tồn tại)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'promotions') THEN
    DROP TRIGGER IF EXISTS set_promotions_updated_at ON public.promotions CASCADE;
    DROP TRIGGER IF EXISTS audit_promotions_trigger ON public.promotions CASCADE;
    DROP TRIGGER IF EXISTS log_promotions_changes ON public.promotions CASCADE;
    DROP TRIGGER IF EXISTS promotions_audit_trigger ON public.promotions CASCADE;
  END IF;

  -- Xóa triggers trên audit_logs (nếu bảng tồn tại)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    DROP TRIGGER IF EXISTS audit_logs_trigger ON public.audit_logs CASCADE;
    DROP TRIGGER IF EXISTS log_audit_logs_changes ON public.audit_logs CASCADE;
    DROP TRIGGER IF EXISTS set_audit_logs_updated_at ON public.audit_logs CASCADE;
  END IF;
END $$;

-- 3. Xoá bảng (Drop con trước, cha sau)
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

-- 4. Xóa các functions có thể gây vòng lặp
drop function if exists public.audit_price_rules() cascade;
drop function if exists public.audit_promotions() cascade;
drop function if exists public.log_changes() cascade;
drop function if exists public.auto_audit_log() cascade;

-- 5. Xoá hàm và types (types phải xóa sau khi drop tables vì có thể đang được sử dụng)
drop function if exists public.get_available_rooms(date, date, int);
drop function if exists public.get_available_rooms(date, date);
drop function if exists public.is_room_available(uuid, date, date);
drop function if exists public.is_admin(uuid);
drop function if exists public.hash_password_sql(text, text);  -- Function tạm để hash password
-- drop function if exists public.handle_new_user();  -- Không dùng nữa
-- Drop trigger_set_timestamp() với CASCADE để xóa tất cả trigger phụ thuộc
-- (Các trigger sẽ được tạo lại trong 02_Int_schema.sql)
drop function if exists public.trigger_set_timestamp() cascade;

-- Xóa types (sau khi drop tables, types có thể vẫn còn nếu không dùng CASCADE)
-- Dùng CASCADE để xóa tất cả dependencies
drop type if exists public.booking_status cascade;
drop type if exists public.room_status cascade;
drop type if exists public.discount_type cascade;
drop type if exists public.price_rule_type cascade;