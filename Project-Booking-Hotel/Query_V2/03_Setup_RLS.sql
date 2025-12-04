-- =========================================
-- 03_SETUP_RLS.SQL (SIMPLIFIED)
-- Disable RLS - Permission check on Frontend/Services
-- =========================================

-- DISABLE RLS - Tất cả các bảng không dùng RLS
-- Permissions được quản lý ở Frontend (AuthContext) & Services layer
-- Admin check: if (user.role === 'admin') { allow all operations }
-- User check: if (booking.user_id === current_user.id) { allow update/delete }

alter table public.users disable row level security;
alter table public.profiles disable row level security;
-- BỎ admin_accounts (đã gộp vào profiles)
alter table public.room_types disable row level security;
alter table public.amenities disable row level security;
alter table public.room_type_amenities disable row level security;
alter table public.rooms disable row level security;
alter table public.room_images disable row level security;
alter table public.room_reviews disable row level security;
alter table public.price_rules disable row level security;
alter table public.promotions disable row level security;
alter table public.bookings disable row level security;
alter table public.booking_items disable row level security;
alter table public.audit_logs disable row level security;
alter table public.restaurant_bookings disable row level security;
alter table public.spa_bookings disable row level security;
alter table public.password_reset_requests disable row level security;