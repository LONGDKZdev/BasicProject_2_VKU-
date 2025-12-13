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
  -- Xóa tất cả triggers updated_at trên các bảng (nếu bảng tồn tại)
  -- Các trigger này sẽ được tạo lại trong 02_Int_schema.sql
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS set_users_updated_at ON public.users CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'room_types') THEN
    DROP TRIGGER IF EXISTS set_room_types_updated_at ON public.room_types CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rooms') THEN
    DROP TRIGGER IF EXISTS set_rooms_updated_at ON public.rooms CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'price_rules') THEN
    DROP TRIGGER IF EXISTS set_price_rules_updated_at ON public.price_rules CASCADE;
    DROP TRIGGER IF EXISTS audit_price_rules_trigger ON public.price_rules CASCADE;
    DROP TRIGGER IF EXISTS log_price_rules_changes ON public.price_rules CASCADE;
    DROP TRIGGER IF EXISTS price_rules_audit_trigger ON public.price_rules CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'promotions') THEN
    DROP TRIGGER IF EXISTS set_promotions_updated_at ON public.promotions CASCADE;
    DROP TRIGGER IF EXISTS audit_promotions_trigger ON public.promotions CASCADE;
    DROP TRIGGER IF EXISTS log_promotions_changes ON public.promotions CASCADE;
    DROP TRIGGER IF EXISTS promotions_audit_trigger ON public.promotions CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    DROP TRIGGER IF EXISTS audit_logs_trigger ON public.audit_logs CASCADE;
    DROP TRIGGER IF EXISTS log_audit_logs_changes ON public.audit_logs CASCADE;
    DROP TRIGGER IF EXISTS set_audit_logs_updated_at ON public.audit_logs CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'room_status_history') THEN
    DROP TRIGGER IF EXISTS set_room_status_history_updated_at ON public.room_status_history CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'housekeeping_tasks') THEN
    DROP TRIGGER IF EXISTS set_housekeeping_tasks_updated_at ON public.housekeeping_tasks CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'restaurant_menu_items') THEN
    DROP TRIGGER IF EXISTS set_restaurant_menu_items_updated_at ON public.restaurant_menu_items CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'restaurant_tables') THEN
    DROP TRIGGER IF EXISTS set_restaurant_tables_updated_at ON public.restaurant_tables CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'restaurant_slots') THEN
    DROP TRIGGER IF EXISTS set_restaurant_slots_updated_at ON public.restaurant_slots CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spa_services') THEN
    DROP TRIGGER IF EXISTS set_spa_services_updated_at ON public.spa_services CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spa_slots') THEN
    DROP TRIGGER IF EXISTS set_spa_slots_updated_at ON public.spa_slots CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_messages') THEN
    DROP TRIGGER IF EXISTS set_contact_messages_updated_at ON public.contact_messages CASCADE;
  END IF;
END $$;

-- 3. Xoá bảng (Drop con trước, cha sau - theo thứ tự phụ thuộc)
-- 3.1. Bảng con (có foreign key)
drop table if exists public.audit_logs cascade;
drop table if exists public.password_reset_requests cascade;
drop table if exists public.spa_bookings cascade;
drop table if exists public.restaurant_bookings cascade;
drop table if exists public.booking_events cascade;
drop table if exists public.booking_pricing_breakdown cascade;
drop table if exists public.room_reviews cascade;
drop table if exists public.booking_items cascade;
drop table if exists public.bookings cascade;
drop table if exists public.room_status_history cascade;
drop table if exists public.housekeeping_tasks cascade;
drop table if exists public.restaurant_slots cascade;
drop table if exists public.restaurant_tables cascade;
drop table if exists public.spa_slots cascade;
-- 3.2. Bảng trung gian
drop table if exists public.room_type_amenities cascade;
drop table if exists public.room_images cascade;
-- 3.3. Bảng cha (có thể có foreign key từ bảng khác)
drop table if exists public.rooms cascade;
drop table if exists public.room_types cascade;
drop table if exists public.spa_services cascade;
drop table if exists public.restaurant_menu_items cascade;
drop table if exists public.amenities cascade;
drop table if exists public.promotions cascade;
drop table if exists public.price_rules cascade;
drop table if exists public.holiday_calendar cascade;
drop table if exists public.users cascade;  -- Bảng users riêng (không dùng auth.users)
drop table if exists public.profiles cascade;
drop table if exists public.contact_messages cascade;
-- 3.4. View bổ sung
drop view if exists public.room_status_board cascade;

-- 4. Xóa các functions có thể gây vòng lặp
drop function if exists public.audit_price_rules() cascade;
drop function if exists public.audit_promotions() cascade;
drop function if exists public.log_changes() cascade;
drop function if exists public.auto_audit_log() cascade;
drop function if exists public.is_restaurant_slot_available(uuid, timestamptz, int) cascade;
drop function if exists public.is_spa_slot_available(uuid, text, timestamptz) cascade;

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

TRUNCATE TABLE auth.users CASCADE;