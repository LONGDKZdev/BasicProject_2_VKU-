-- Script để set tài khoản admin@hotel.com thành admin
-- Chạy script này sau khi đã đăng ký tài khoản admin@hotel.com

-- Kiểm tra và cập nhật is_admin cho admin@hotel.com
UPDATE public.users
SET is_admin = true
WHERE email = 'admin@hotel.com';

-- Kiểm tra kết quả
SELECT id, email, is_admin, created_at
FROM public.users
WHERE email = 'admin@hotel.com';

