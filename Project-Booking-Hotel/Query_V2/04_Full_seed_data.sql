-- =====================================================
-- 04_FULL_SEED_DATA.SQL (UPDATED)
-- =====================================================

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

-- 4. ROOM IMAGES (ẢNH TỪ SUPABASE STORAGE)
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
insert into public.room_reviews (room_type_id, user_name, user_email, rating, comment, stay_date, created_at) values
  ((select id from public.room_types where code='STD'), 'Sophia Nguyen', 'sophia@email.com', 5, 'Room was spotless, pool view stunning.', '2024-10-15', now()),
  ((select id from public.room_types where code='STD'), 'Daniel Park', 'daniel@email.com', 4, 'Bed was plush and breakfast tasty.', '2024-11-10', now()),
  ((select id from public.room_types where code='DLX'), 'Marco Rossi', 'marco@email.com', 5, 'Serene courtyard setting.', '2024-07-22', now())
on conflict do nothing;

-- 6. KHUYẾN MÃI & QUY TẮC GIÁ
insert into public.price_rules (rule_type, room_type_id, apply_fri, apply_sat, apply_sun, price, priority, description, is_active)
select 'weekend'::price_rule_type, rt.id, false, true, true, rt.base_price * 1.15, 5, 'Weekend rate', true from public.room_types rt on conflict do nothing;

insert into public.promotions (code, name, description, discount_kind, discount_value, start_date, end_date, is_active) values
  ('WELCOME25', 'Welcome 25% Off', 'Giảm 25% cho đặt phòng lần đầu', 'percent', 25, '2025-01-01', '2025-12-31', true),
  ('SUMMER50', 'Summer Special 50k', 'Giảm 50k cho đặt phòng mùa hè', 'fixed', 50, '2025-06-01', '2025-08-31', true),
  ('WEEKEND15', 'Weekend Bonus', 'Giảm 15% cuối tuần', 'percent', 15, '2025-01-01', '2025-12-31', true)
on conflict (code) do nothing;

-- 7. UPDATE PROFILES WITH STATUS (NEW - Support for updated schema)
-- This updates any existing profiles to have email and status if missing
update public.profiles 
set status = 'active' 
where status is null;

-- 8. LIÊN KẾT TIỆN NGHI (AUTO LINK)
insert into public.room_type_amenities (room_type_id, amenity_id)
select distinct rt.id, a.id 
from public.room_types rt 
cross join lateral unnest(rt.facilities) as facility_name 
join public.amenities a on a.name = facility_name 
on conflict do nothing;

-- 9. LỊCH LỄ
insert into public.holiday_calendar (holiday_date, name, multiplier) values
    ('2025-01-01', 'New Year 2025', 1.5), 
    ('2025-04-30', 'Reunification Day', 1.3), 
    ('2025-12-25', 'Christmas Day', 1.5)
on conflict (holiday_date) do nothing;