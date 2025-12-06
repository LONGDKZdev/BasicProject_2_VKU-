-- =====================================
-- 02_INIT_SCHEMA.SQL
-- =====================================

create extension if not exists "pgcrypto";

-- ====== XÓA TYPES CŨ (nếu còn) ======
-- Đảm bảo xóa types trước khi tạo lại để tránh lỗi "type already exists"
drop type if exists public.room_status cascade;
drop type if exists public.booking_status cascade;
drop type if exists public.price_rule_type cascade;
drop type if exists public.discount_type cascade;

-- ====== ENUMS ======
create type room_status as enum ('available', 'occupied', 'maintenance', 'cleaning');
create type booking_status as enum ('pending', 'pending_payment', 'approved', 'rejected', 'confirmed', 'checked_in', 'checked_out', 'modified', 'completed', 'cancelled');
create type price_rule_type as enum ('weekend', 'holiday', 'seasonal', 'season');
create type discount_type as enum ('percent', 'fixed');

-- ====== FUNCTION UPDATE TIMESTAMP ======
-- Function này chỉ update updated_at nếu có thay đổi thực sự để tránh vòng lặp
-- CẢI THIỆN: Kiểm tra updated_at không thay đổi để tránh recursive trigger
create or replace function public.trigger_set_timestamp()
returns trigger 
language plpgsql 
security definer
set search_path = public
as $$
begin
  -- Chỉ xử lý UPDATE operations
  if (TG_OP != 'UPDATE') then
    return new;
  end if;

  -- QUAN TRỌNG: Nếu updated_at đã thay đổi, không update lại (tránh vòng lặp)
  if (OLD.updated_at IS DISTINCT FROM NEW.updated_at) then
    return new;
  end if;

  -- Chỉ update updated_at nếu có cột khác thay đổi
  if (OLD IS DISTINCT FROM NEW) then
    new.updated_at = now();
  end if;

  return new;
end$$;

-- ====== 1. USERS (BẢNG RIÊNG - KHÔNG DÙNG auth.users) ======
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,  -- Mật khẩu đã hash (dùng bcrypt hoặc crypto)
  full_name text,
  phone text,
  avatar_url text,
  country text,
  city text,
  preferences jsonb not null default '[]'::jsonb,
  language text not null default 'en',
  newsletter boolean not null default true,
  bio text,
  is_admin boolean not null default false,
  is_email_verified boolean not null default false,
  email_verification_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login timestamptz
);
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_is_admin on public.users(is_admin);
create index if not exists idx_users_email_verification_token on public.users(email_verification_token);
create trigger set_users_updated_at before update on public.users for each row execute procedure public.trigger_set_timestamp();

-- Function Check Admin (đơn giản hóa - check từ users)
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select coalesce((select is_admin from public.users where id = uid), false);
$$;

-- ====== 3. AMENITIES ======
create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  icon_name text,
  created_at timestamptz not null default now()
);

-- ====== 4. ROOM TYPES ======
create table if not exists public.room_types (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  base_capacity int not null default 2,
  max_person int not null default 2,
  base_price numeric(12,2) not null,
  is_active boolean not null default true,
  facilities text[] default '{}',
  hotel_rules text[] default '{}',
  cancellation_policy text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_room_types_capacity check (max_person >= base_capacity)
);
create trigger set_room_types_updated_at before update on public.room_types for each row execute procedure public.trigger_set_timestamp();

-- ====== 4. ROOM TYPE AMENITIES ======
create table if not exists public.room_type_amenities (
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (room_type_id, amenity_id)
);

-- ====== 5. ROOM IMAGES ======
create table if not exists public.room_images (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  image_url text not null,
  image_lg_url text,
  display_order int default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_room_images_room_type_id on public.room_images(room_type_id);

-- ====== 6. ROOMS ======
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_no text unique not null,
  name text not null,
  room_type_id uuid not null references public.room_types(id),
  floor int,
  size int,
  status room_status not null default 'available',
  -- Các cột cached cho frontend
  type text, category text, price numeric(12,2), description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_rooms_room_type_id on public.rooms(room_type_id);
create trigger set_rooms_updated_at before update on public.rooms for each row execute procedure public.trigger_set_timestamp();

-- ====== 7. PRICE RULES ======
create table if not exists public.price_rules (
  id uuid primary key default gen_random_uuid(),
  rule_type price_rule_type not null,
  room_type_id uuid references public.room_types(id) on delete cascade,
  start_date date, end_date date, description text,
  apply_fri boolean not null default false,
  apply_sat boolean not null default false,
  apply_sun boolean not null default false,
  price numeric(12,2) not null,
  priority int not null default 10,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_price_rule_dates check (end_date is null or start_date is null or end_date >= start_date)
);
-- Trigger cho price_rules - CHỈ update updated_at khi có thay đổi thực sự
create trigger set_price_rules_updated_at 
  before update on public.price_rules 
  for each row 
  when (
    OLD.rule_type IS DISTINCT FROM NEW.rule_type OR
    OLD.room_type_id IS DISTINCT FROM NEW.room_type_id OR
    OLD.start_date IS DISTINCT FROM NEW.start_date OR
    OLD.end_date IS DISTINCT FROM NEW.end_date OR
    OLD.apply_fri IS DISTINCT FROM NEW.apply_fri OR
    OLD.apply_sat IS DISTINCT FROM NEW.apply_sat OR
    OLD.apply_sun IS DISTINCT FROM NEW.apply_sun OR
    OLD.price IS DISTINCT FROM NEW.price OR
    OLD.priority IS DISTINCT FROM NEW.priority OR
    OLD.description IS DISTINCT FROM NEW.description OR
    OLD.is_active IS DISTINCT FROM NEW.is_active
  )
  execute procedure public.trigger_set_timestamp();

-- ====== 8. PROMOTIONS ======
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  discount_kind discount_type not null,
  discount_value numeric(12,2) not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_promo_dates check (end_date >= start_date)
);
-- Trigger cho promotions - CHỈ update updated_at khi có thay đổi thực sự
create trigger set_promotions_updated_at 
  before update on public.promotions 
  for each row 
  when (
    OLD.code IS DISTINCT FROM NEW.code OR
    OLD.name IS DISTINCT FROM NEW.name OR
    OLD.description IS DISTINCT FROM NEW.description OR
    OLD.discount_kind IS DISTINCT FROM NEW.discount_kind OR
    OLD.discount_value IS DISTINCT FROM NEW.discount_value OR
    OLD.start_date IS DISTINCT FROM NEW.start_date OR
    OLD.end_date IS DISTINCT FROM NEW.end_date OR
    OLD.is_active IS DISTINCT FROM NEW.is_active
  )
  execute procedure public.trigger_set_timestamp();

-- ====== 9. BOOKINGS ======
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  confirmation_code text not null unique,
  booking_type text not null default 'room',
  status booking_status not null default 'pending_payment',
  check_in date not null,
  check_out date not null,
  room_id uuid references public.rooms(id),
  room_name text,
  user_name text, user_email text, guest_name text, guest_phone text, note text,
  promo_code text references public.promotions(code),
  num_adults int not null default 1,
  num_children int not null default 0,
  total_nights int not null default 1,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  pricing_breakdown jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  payment_code text, payment_method text, paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_dates_valid check (check_out > check_in)
);
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create unique index if not exists idx_bookings_confirmation_code on public.bookings(confirmation_code);
create trigger set_bookings_updated_at before update on public.bookings for each row execute procedure public.trigger_set_timestamp();

-- ====== 10. BOOKING ITEMS ======
create table if not exists public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  room_id uuid not null references public.rooms(id),
  room_type_id uuid not null references public.room_types(id),
  price_per_night numeric(12,2) not null,
  nights int not null,
  amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

-- ====== 11. ROOM REVIEWS ======
create table if not exists public.room_reviews (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  room_type_id uuid references public.room_types(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  user_name text, user_email text, rating int not null check (rating between 1 and 5),
  comment text, stay_date date,
  created_at timestamptz not null default now(),
  constraint chk_room_reviews_room check (room_id is not null or room_type_id is not null)
);

-- ====== 12. OTHERS (Audit, Restaurant, Spa, Holidays) ======
create table if not exists public.booking_pricing_breakdown (
  id bigint generated by default as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  stay_date date not null, rate_type text not null, rate numeric(12,2) not null,
  created_at timestamptz not null default now(),
  constraint uniq_booking_pricing unique (booking_id, stay_date, rate_type)
);

create table if not exists public.booking_events (
  id bigint generated by default as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  event_type text not null, note text, actor uuid references public.users(id) on delete set null, meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  confirmation_code text not null unique,
  name text not null, email text not null, phone text,
  reservation_at timestamptz not null, guests int default 1, special_requests text,
  price numeric(12,2) default 0, total_price numeric(12,2) default 0,
  status booking_status default 'pending_payment',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger set_restaurant_bookings_updated_at before update on public.restaurant_bookings for each row execute procedure public.trigger_set_timestamp();

create table if not exists public.spa_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  confirmation_code text not null unique,
  name text not null, email text not null, phone text,
  appointment_at timestamptz not null, service_name text not null, service_duration text,
  therapist text, special_requests text,
  price numeric(12,2) default 0, total_price numeric(12,2) default 0,
  status booking_status default 'pending_payment',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger set_spa_bookings_updated_at before update on public.spa_bookings for each row execute procedure public.trigger_set_timestamp();

create table if not exists public.password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null, code text not null, expires_at timestamptz not null, used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated by default as identity primary key,
  actor uuid references public.users(id) on delete set null,
  action text not null, target_table text, target_id text, meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.holiday_calendar (
  id uuid primary key default gen_random_uuid(),
  holiday_date date not null unique,
  name text, multiplier numeric(5,2) default 1.35, is_active boolean default true,
  created_at timestamptz not null default now()
);

-- ====== LOGIC FUNCTIONS ======
create or replace function public.is_room_available(p_room_id uuid, p_start date, p_end date)
returns boolean language sql stable as $$
  select 
    (select r.status = 'available'::room_status from public.rooms r where r.id = p_room_id)
    and not exists (
      select 1 from public.bookings b
      join public.booking_items bi on bi.booking_id = b.id
      where b.status in ('confirmed', 'checked_in')
        and bi.room_id = p_room_id
        and daterange(b.check_in, b.check_out) && daterange(p_start, p_end)
    );
$$;

create or replace function public.get_available_rooms(p_start date, p_end date, p_guests int)
returns setof public.rooms language sql stable as $$
  select r.*
  from public.rooms r
  join public.room_types rt on r.room_type_id = rt.id
  where r.status in ('available', 'cleaning')
    and rt.base_capacity >= p_guests
    and public.is_room_available(r.id, p_start, p_end);
$$;