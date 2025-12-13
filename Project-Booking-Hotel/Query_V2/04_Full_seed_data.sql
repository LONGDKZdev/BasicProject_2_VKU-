-- =====================================================
-- 04_FULL_SEED_DATA.SQL
-- =====================================================

-- NOTE: File này seed tất cả dữ liệu bao gồm:
-- - Amenities, Room Types, Rooms, Images
-- - Reviews, Price Rules, Promotions
-- - Users (admin@hotel.com / admin123 và longvh@gmail.com / user123)
-- - Bookings test data
-- - Holiday calendar

-- 1. AMENITIES
insert into public.amenities (name, icon_name) values
  ('Wifi', 'FaWifi'), ('Coffee', 'FaCoffee'), ('Bath', 'FaBath'), ('Parking Space', 'FaParking'),
  ('Swimming Pool', 'FaSwimmingPool'), ('Breakfast', 'FaHotdog'), ('GYM', 'FaStopwatch'), ('Drinks', 'FaCocktail')
on conflict (name) do nothing;

-- 2. ROOM TYPES
insert into public.room_types (code, name, description, base_capacity, max_person, base_price, facilities, is_active) values
  ('STD', 'Standard', 'Comfortable rooms with essential amenities', 1, 3, 115, array['Wifi', 'Coffee', 'Bath', 'Parking Space', 'Swimming Pool', 'Breakfast', 'GYM', 'Drinks'], true),
  ('DLX', 'Deluxe', 'Premium experience with elegant design', 2, 4, 265, array['Wifi', 'Coffee', 'Bath', 'Parking Space', 'Swimming Pool', 'Breakfast', 'GYM', 'Drinks'], true),
  ('SUI', 'Suite', 'Spacious suites for ultimate comfort', 3, 6, 320, array['Wifi', 'Coffee', 'Bath', 'Parking Space', 'Swimming Pool', 'Breakfast', 'GYM', 'Drinks'], true),
  ('PEN', 'Penthouse', 'Exclusive top-floor residences', 4, 6, 344, array['Wifi', 'Coffee', 'Bath', 'Parking Space', 'Swimming Pool', 'Breakfast', 'GYM', 'Drinks'], true),
  ('CMB', 'Combo', 'Value-packed packages with extras', 2, 6, 290, array['Wifi', 'Coffee', 'Bath', 'Parking Space', 'Swimming Pool', 'Breakfast', 'GYM', 'Drinks'], true)
on conflict (code) do update set is_active = true;

-- 3. ROOMS (40 PHÒNG ĐẦY ĐỦ)
insert into public.rooms (id, room_no, name, room_type_id, floor, size, type, category, price, description, status) values
  -- Standard
  (gen_random_uuid(), 'STD-01', 'Standard Room', (select id from public.room_types where code='STD'), 1, 30, 'Standard', 'standard', 115, 'Comfortable room with essential amenities.', 'available'),
  (gen_random_uuid(), 'STD-02', 'Cozy Studio Standard', (select id from public.room_types where code='STD'), 1, 28, 'Standard', 'standard', 145, 'Intimate studio with integrated work space.', 'available'),
  (gen_random_uuid(), 'STD-03', 'Garden View Standard', (select id from public.room_types where code='STD'), 1, 35, 'Standard', 'standard', 195, 'Charming room with garden views.', 'available'),
  (gen_random_uuid(), 'STD-04', 'Courtyard Classic Standard', (select id from public.room_types where code='STD'), 1, 32, 'Standard', 'standard', 185, 'Peaceful room overlooking the courtyard.', 'available'),
  (gen_random_uuid(), 'STD-05', 'Urban Escape Standard', (select id from public.room_types where code='STD'), 2, 38, 'Standard', 'standard', 205, 'Modern room in city center.', 'available'),
  (gen_random_uuid(), 'STD-06', 'Zen Retreat Standard', (select id from public.room_types where code='STD'), 2, 42, 'Standard', 'standard', 225, 'Tranquil room designed for relaxation.', 'available'),
  (gen_random_uuid(), 'STD-07', 'Heritage Standard', (select id from public.room_types where code='STD'), 2, 55, 'Standard', 'standard', 275, 'Elegant room with cultural charm.', 'available'),
  (gen_random_uuid(), 'STD-08', 'Skyline View Standard', (select id from public.room_types where code='STD'), 2, 45, 'Standard', 'standard', 255, 'Room with panoramic city views.', 'available'),
  -- Deluxe
  (gen_random_uuid(), 'DLX-01', 'Deluxe Room', (select id from public.room_types where code='DLX'), 3, 50, 'Deluxe', 'deluxe', 265, 'Premium experience with elegant design.', 'available'),
  (gen_random_uuid(), 'DLX-02', 'Deluxe Comfort', (select id from public.room_types where code='DLX'), 3, 38, 'Deluxe', 'deluxe', 245, 'Comfortable deluxe room.', 'available'),
  (gen_random_uuid(), 'DLX-03', 'Deluxe Modern', (select id from public.room_types where code='DLX'), 3, 42, 'Deluxe', 'deluxe', 265, 'Modern deluxe room.', 'available'),
  (gen_random_uuid(), 'DLX-04', 'Deluxe Sophisticated', (select id from public.room_types where code='DLX'), 3, 46, 'Deluxe', 'deluxe', 295, 'Sophisticated deluxe suite.', 'available'),
  (gen_random_uuid(), 'DLX-05', 'Deluxe Exquisite', (select id from public.room_types where code='DLX'), 4, 50, 'Deluxe', 'deluxe', 315, 'Exquisite deluxe room.', 'available'),
  (gen_random_uuid(), 'DLX-06', 'Deluxe Paramount', (select id from public.room_types where code='DLX'), 4, 54, 'Deluxe', 'deluxe', 335, 'Paramount deluxe suite.', 'available'),
  (gen_random_uuid(), 'DLX-07', 'Deluxe Prestigious', (select id from public.room_types where code='DLX'), 4, 58, 'Deluxe', 'deluxe', 365, 'Prestigious deluxe suite.', 'available'),
  (gen_random_uuid(), 'DLX-08', 'Deluxe Elite', (select id from public.room_types where code='DLX'), 4, 52, 'Deluxe', 'deluxe', 285, 'Elite deluxe experience.', 'available'),
  -- Suite
  (gen_random_uuid(), 'SUI-01', 'Luxury Suite Room', (select id from public.room_types where code='SUI'), 5, 90, 'Suite', 'suite', 320, 'Spacious suite for ultimate comfort.', 'available'),
  (gen_random_uuid(), 'SUI-02', 'Suite Comfort', (select id from public.room_types where code='SUI'), 5, 50, 'Suite', 'suite', 315, 'Comfortable suite.', 'available'),
  (gen_random_uuid(), 'SUI-03', 'Suite Spacious', (select id from public.room_types where code='SUI'), 5, 55, 'Suite', 'suite', 335, 'Spacious suite.', 'available'),
  (gen_random_uuid(), 'SUI-04', 'Suite Elegance', (select id from public.room_types where code='SUI'), 5, 60, 'Suite', 'suite', 365, 'Elegant suite.', 'available'),
  (gen_random_uuid(), 'SUI-05', 'Suite Grand', (select id from public.room_types where code='SUI'), 6, 65, 'Suite', 'suite', 385, 'Grand suite.', 'available'),
  (gen_random_uuid(), 'SUI-06', 'Suite Magnificent', (select id from public.room_types where code='SUI'), 6, 70, 'Suite', 'suite', 415, 'Magnificent suite.', 'available'),
  (gen_random_uuid(), 'SUI-07', 'Suite Premium', (select id from public.room_types where code='SUI'), 6, 75, 'Suite', 'suite', 445, 'Premium suite.', 'available'),
  (gen_random_uuid(), 'SUI-08', 'Suite Royal', (select id from public.room_types where code='SUI'), 6, 80, 'Suite', 'suite', 475, 'Royal suite.', 'available'),
  -- Penthouse
  (gen_random_uuid(), 'PEN-01', 'Penthouse', (select id from public.room_types where code='PEN'), 7, 45, 'Penthouse', 'penthouse', 344, 'Exclusive top-floor residence.', 'available'),
  (gen_random_uuid(), 'PEN-02', 'Penthouse View', (select id from public.room_types where code='PEN'), 7, 50, 'Penthouse', 'penthouse', 375, 'Penthouse with stunning views.', 'available'),
  (gen_random_uuid(), 'PEN-03', 'Penthouse Skyline', (select id from public.room_types where code='PEN'), 7, 55, 'Penthouse', 'penthouse', 395, 'Penthouse overlooking the skyline.', 'available'),
  (gen_random_uuid(), 'PEN-04', 'Penthouse Crown', (select id from public.room_types where code='PEN'), 7, 60, 'Penthouse', 'penthouse', 425, 'Crown jewel penthouse.', 'available'),
  (gen_random_uuid(), 'PEN-05', 'Penthouse Royal', (select id from public.room_types where code='PEN'), 8, 65, 'Penthouse', 'penthouse', 455, 'Royal penthouse.', 'available'),
  (gen_random_uuid(), 'PEN-06', 'Penthouse Ultra', (select id from public.room_types where code='PEN'), 8, 70, 'Penthouse', 'penthouse', 485, 'Ultra-luxury penthouse.', 'available'),
  (gen_random_uuid(), 'PEN-07', 'Penthouse Imperial', (select id from public.room_types where code='PEN'), 8, 75, 'Penthouse', 'penthouse', 515, 'Imperial penthouse.', 'available'),
  (gen_random_uuid(), 'PEN-08', 'Penthouse Supreme', (select id from public.room_types where code='PEN'), 8, 80, 'Penthouse', 'penthouse', 545, 'Supreme penthouse.', 'available'),
  -- Combo
  (gen_random_uuid(), 'CMB-01', 'Combo Premium', (select id from public.room_types where code='CMB'), 1, 40, 'Combo', 'combo', 245, 'Value package with breakfast & spa.', 'available'),
  (gen_random_uuid(), 'CMB-02', 'Combo Family', (select id from public.room_types where code='CMB'), 2, 50, 'Combo', 'combo', 315, 'Family package with activities.', 'available'),
  (gen_random_uuid(), 'CMB-03', 'Combo Romance', (select id from public.room_types where code='CMB'), 2, 42, 'Combo', 'combo', 265, 'Romance package with dinner.', 'available'),
  (gen_random_uuid(), 'CMB-04', 'Combo Business', (select id from public.room_types where code='CMB'), 3, 36, 'Combo', 'combo', 255, 'Business package.', 'available'),
  (gen_random_uuid(), 'CMB-05', 'Combo Adventure', (select id from public.room_types where code='CMB'), 3, 44, 'Combo', 'combo', 275, 'Adventure package.', 'available'),
  (gen_random_uuid(), 'CMB-06', 'Combo Wellness', (select id from public.room_types where code='CMB'), 4, 48, 'Combo', 'combo', 285, 'Wellness package.', 'available'),
  (gen_random_uuid(), 'CMB-07', 'Combo Culinary', (select id from public.room_types where code='CMB'), 4, 45, 'Combo', 'combo', 295, 'Culinary package.', 'available'),
  (gen_random_uuid(), 'CMB-08', 'Combo Ultimate', (select id from public.room_types where code='CMB'), 5, 70, 'Combo', 'combo', 565, 'Ultimate combo package.', 'available')
on conflict (room_no) do nothing;

-- 4. ROOM IMAGES (ẢNH THẬT TỪ FILE BẠN ĐƯA)
insert into public.room_images (room_type_id, image_url, image_lg_url, display_order)
select id, 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms/1.png', 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms/1-lg.png', 1 from public.room_types where code = 'STD'
union all
select id, 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms/2.png', 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms/2-lg.png', 1 from public.room_types where code = 'DLX'
union all
select id, 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms/3.png', 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms/3-lg.png', 1 from public.room_types where code = 'SUI'
union all
select id, 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms/4.png', 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms/4-lg.png', 1 from public.room_types where code = 'PEN'
union all
select id, 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms/5.png', 'https://sxteddkozzqniebfstag.supabase.co/storage/v1/object/public/hotel-rooms/img/rooms/5-lg.png', 1 from public.room_types where code = 'CMB'
on conflict do nothing;

-- 5. REVIEWS MẪU
-- Reviews theo room_type_id (backward compatibility - hiển thị cho tất cả phòng cùng loại)
insert into public.room_reviews (room_type_id, user_name, user_email, rating, comment, stay_date, created_at) values
  ((select id from public.room_types where code='STD'), 'Sophia Nguyen', 'sophia@email.com', 5, 'Room was spotless, pool view stunning.', '2024-10-15', now()),
  ((select id from public.room_types where code='STD'), 'Daniel Park', 'daniel@email.com', 4, 'Bed was plush and breakfast tasty.', '2024-11-10', now()),
  ((select id from public.room_types where code='DLX'), 'Marco Rossi', 'marco@email.com', 5, 'Serene courtyard setting.', '2024-07-22', now()),
  ((select id from public.room_types where code='CMB'), 'Emma Wilson', 'emma@email.com', 5, 'Combo package was excellent value!', '2024-12-01', now()),
  ((select id from public.room_types where code='SUI'), 'James Brown', 'james@email.com', 5, 'Spacious suite with amazing amenities.', '2024-11-20', now());

-- Reviews theo room_id cụ thể (mỗi phòng có reviews riêng)
-- STD rooms
insert into public.room_reviews (room_id, room_type_id, user_name, user_email, rating, comment, stay_date, created_at)
select r.id, r.room_type_id, 'Alex Chen', 'alex@email.com', 5, 'Perfect stay in ' || r.name || '. Highly recommended!', '2024-12-05', now()
from public.rooms r where r.room_no = 'STD-01';

insert into public.room_reviews (room_id, room_type_id, user_name, user_email, rating, comment, stay_date, created_at)
select r.id, r.room_type_id, 'Sarah Lee', 'sarah@email.com', 4, 'Great room, clean and comfortable.', '2024-12-03', now()
from public.rooms r where r.room_no = 'STD-02';

-- DLX rooms
insert into public.room_reviews (room_id, room_type_id, user_name, user_email, rating, comment, stay_date, created_at)
select r.id, r.room_type_id, 'Michael Johnson', 'michael@email.com', 5, 'Deluxe room exceeded expectations!', '2024-12-01', now()
from public.rooms r where r.room_no = 'DLX-01';

insert into public.room_reviews (room_id, room_type_id, user_name, user_email, rating, comment, stay_date, created_at)
select r.id, r.room_type_id, 'Lisa Anderson', 'lisa@email.com', 4, 'Beautiful room with great amenities.', '2024-11-28', now()
from public.rooms r where r.room_no = 'DLX-02';

-- CMB rooms (Combo)
insert into public.room_reviews (room_id, room_type_id, user_name, user_email, rating, comment, stay_date, created_at)
select r.id, r.room_type_id, 'David Kim', 'david@email.com', 5, 'Combo Premium package was amazing!', '2024-12-02', now()
from public.rooms r where r.room_no = 'CMB-01';

insert into public.room_reviews (room_id, room_type_id, user_name, user_email, rating, comment, stay_date, created_at)
select r.id, r.room_type_id, 'Maria Garcia', 'maria@email.com', 4, 'Combo Family package perfect for our stay.', '2024-11-30', now()
from public.rooms r where r.room_no = 'CMB-02';

insert into public.room_reviews (room_id, room_type_id, user_name, user_email, rating, comment, stay_date, created_at)
select r.id, r.room_type_id, 'Robert Taylor', 'robert@email.com', 5, 'Combo Romance package was perfect for our anniversary!', '2024-12-04', now()
from public.rooms r where r.room_no = 'CMB-03';

-- 6. KHUYẾN MÃI & QUY TẮC GIÁ
insert into public.price_rules (rule_type, room_type_id, apply_fri, apply_sat, apply_sun, price, priority, description, is_active)
select 'weekend'::price_rule_type, rt.id, false, true, true, rt.base_price * 1.15, 5, 'Weekend rate', true from public.room_types rt on conflict do nothing;

insert into public.promotions (code, name, description, discount_kind, discount_value, start_date, end_date, is_active) values
  ('WELCOME25', 'Welcome 25% Off', 'Giảm 25% cho đặt phòng lần đầu', 'percent', 25, '2025-01-01', '2025-12-31', true),
  ('SUMMER50', 'Summer Special 50k', 'Giảm 50k cho đặt phòng mùa hè', 'fixed', 50, '2025-06-01', '2025-08-31', true),
  ('WEEKEND15', 'Weekend Bonus', 'Giảm 15% cuối tuần', 'percent', 15, '2025-01-01', '2025-12-31', true)
on conflict (code) do nothing;

-- 7. USERS TEST DATA (Admin và User mẫu)
-- Password hash format: "salt:hash" (SHA-256 với salt)
-- Hash được tạo bằng function SQL để đảm bảo format đúng

-- Function để hash password (tương tự JavaScript hashPassword)
-- Format: "salt:hash" với salt 32 ký tự hex (16 bytes) và hash 64 ký tự hex (32 bytes SHA-256)
CREATE OR REPLACE FUNCTION public.hash_password_sql(password text, salt_hex text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  hash_hex text;
BEGIN
  -- Hash password + salt bằng SHA-256 (giống JavaScript: password + saltHex)
  -- pgcrypto extension đã được tạo trong 02_Int_schema.sql
  SELECT encode(digest(password || salt_hex, 'sha256'), 'hex') INTO hash_hex;
  RETURN salt_hex || ':' || hash_hex;
END;
$$;

-- Insert users với password hash
-- admin@hotel.com / admin123 (is_admin = true)
-- longvh@gmail.com / user123 (is_admin = false)
-- Salt: 32 ký tự hex (16 bytes) - giống format trong JavaScript
INSERT INTO public.users (email, password_hash, full_name, is_admin, is_email_verified, newsletter, language) VALUES
  (
    'admin@hotel.com',
    public.hash_password_sql('admin123', 'a1b2c3d4e5f6789012345678901234ab'), -- Salt 32 hex chars
    'Admin User',
    true,
    true,
    true,
    'en'
  ),
  (
    'longvh@gmail.com',
    public.hash_password_sql('user123', 'b2c3d4e5f6789012345678901234abcd'), -- Salt 32 hex chars
    'Long Võ',
    false,
    true,
    true,
    'vi'
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  is_admin = EXCLUDED.is_admin,
  is_email_verified = EXCLUDED.is_email_verified,
  full_name = EXCLUDED.full_name,
  language = EXCLUDED.language;

-- Giữ lại function để có thể dùng sau này nếu cần
-- Nếu muốn xóa: DROP FUNCTION IF EXISTS public.hash_password_sql(text, text);

-- 8. BOOKINGS TEST DATA
-- Lưu ý: User IDs sẽ được lấy từ public.users
-- Tạo Booking Quá khứ cho user 1 (khach1@example.com)
INSERT INTO public.bookings (id, user_id, confirmation_code, status, check_in, check_out, room_id, room_name, total_amount)
SELECT gen_random_uuid(), u.id, 'BK-PAST-01', 'checked_out', CURRENT_DATE - 10, CURRENT_DATE - 8, (SELECT id FROM public.rooms WHERE room_no = 'STD-01'), 'Standard Room', 230
FROM public.users u WHERE u.email = 'khach1@example.com'
ON CONFLICT (confirmation_code) DO NOTHING;

-- Tạo Booking Tương lai cho user 2 (khachvip@example.com)
INSERT INTO public.bookings (id, user_id, confirmation_code, status, check_in, check_out, room_id, room_name, total_amount)
SELECT gen_random_uuid(), u.id, 'BK-FUTR-02', 'confirmed', CURRENT_DATE + 5, CURRENT_DATE + 7, (SELECT id FROM public.rooms WHERE room_no = 'DLX-01'), 'Deluxe Room', 530
FROM public.users u WHERE u.email = 'khachvip@example.com'
ON CONFLICT (confirmation_code) DO NOTHING;

-- Tạo Booking Items
INSERT INTO public.booking_items (booking_id, room_id, room_type_id, price_per_night, nights, amount)
SELECT b.id, b.room_id, r.room_type_id, r.price, (b.check_out - b.check_in), (r.price * (b.check_out - b.check_in))
FROM public.bookings b JOIN public.rooms r ON b.room_id = r.id;

-- 9. LIÊN KẾT TIỆN NGHI (AUTO LINK)
INSERT INTO public.room_type_amenities (room_type_id, amenity_id)
SELECT DISTINCT rt.id, a.id FROM public.room_types rt CROSS JOIN LATERAL unnest(rt.facilities) AS facility_name JOIN public.amenities a ON a.name = facility_name ON CONFLICT DO NOTHING;

-- 10. LỊCH LỄ
INSERT INTO public.holiday_calendar (holiday_date, name, multiplier) VALUES
    ('2025-01-01', 'New Year 2025', 1.5), ('2025-04-30', 'Reunification Day', 1.3), ('2025-12-25', 'Christmas Day', 1.5)
ON CONFLICT (holiday_date) DO NOTHING;

-- 11. ROOM STATUS HISTORY (seed optional)
insert into public.room_status_history (room_id, status, started_at, note)
select id, status, now(), 'Initial status seed'
from public.rooms
on conflict do nothing;

-- 12. RESTAURANT SEED (menu, tables, slots)
-- Note: image_url uses Supabase Storage URLs (img/rooms/1-lg.png through 8-lg.png)
-- Frontend will cycle through images 1-8 based on item id if image_url is null
insert into public.restaurant_menu_items (code, name, description, category, price, image_url, display_order) values
  ('APP-TRUFFLE', 'Truffle Arancini', 'Crispy risotto with truffle', 'appetizers', 28, null, 1),
  ('MAIN-RIBEYE', 'Wagyu Ribeye Steak', '300g ribeye with veggies', 'mains', 95, null, 2),
  ('DESS-SOUFFLE', 'Chocolate Soufflé', 'Warm soufflé with ice cream', 'desserts', 24, null, 3),
  ('BEV-CHAMP', 'Champagne', 'Premium champagne', 'beverages', 120, null, 4)
on conflict (code) do update set image_url = null;

insert into public.restaurant_tables (name, capacity, location, status) values
  ('T1', 2, 'Indoor', 'available'),
  ('T2', 4, 'Indoor', 'available'),
  ('T3', 4, 'Terrace', 'available'),
  ('T4', 6, 'Terrace', 'available')
on conflict (name) do nothing;

-- Seed a few slots today/tomorrow for each table
insert into public.restaurant_slots (table_id, reservation_at, capacity_limit, capacity_used, status)
select t.id, (current_date + i)::date + time '18:00', t.capacity, 0, 'available'
from public.restaurant_tables t
cross join generate_series(0,1) as i
on conflict do nothing;

insert into public.restaurant_slots (table_id, reservation_at, capacity_limit, capacity_used, status)
select t.id, (current_date + i)::date + time '20:00', t.capacity, 0, 'available'
from public.restaurant_tables t
cross join generate_series(0,1) as i
on conflict do nothing;

-- 13. SPA SEED (services, slots)
-- Note: image_url uses Supabase Storage URLs (img/rooms/1-lg.png through 8-lg.png)
-- Frontend will cycle through images 1-8 based on service id if image_url is null
insert into public.spa_services (code, name, category, duration_minutes, price, description, image_url, display_order) values
  ('SPA-SWE', 'Swedish Massage', 'massage', 60, 95, 'Relaxation massage', null, 1),
  ('SPA-HOT', 'Hot Stone Massage', 'massage', 90, 145, 'Deep relaxation with stones', null, 2),
  ('SPA-FAC', 'Signature Facial', 'facial', 60, 120, 'Deep cleansing facial', null, 3)
on conflict (code) do update set image_url = null;

-- Seed slots for today/tomorrow for each service
insert into public.spa_slots (service_id, therapist, appointment_at, capacity, status)
select s.id, 'Therapist A', (current_date + i)::date + time '10:00', 1, 'available'
from public.spa_services s
cross join generate_series(0,1) as i
on conflict do nothing;

insert into public.spa_slots (service_id, therapist, appointment_at, capacity, status)
select s.id, 'Therapist B', (current_date + i)::date + time '14:00', 1, 'available'
from public.spa_services s
cross join generate_series(0,1) as i
on conflict do nothing;

-- ============================================================================
-- FIX IMAGE URLs - Remove placeholder URLs (run this after initial seed)
-- ============================================================================
-- Frontend will automatically use Supabase Storage fallback images from rooms/ folder
UPDATE public.restaurant_menu_items
SET image_url = NULL
WHERE image_url LIKE '%via.placeholder.com%'
   OR image_url LIKE '%placeholder.com%';

UPDATE public.spa_services
SET image_url = NULL
WHERE image_url LIKE '%via.placeholder.com%'
   OR image_url LIKE '%placeholder.com%';