-- ============================================================
-- HotelOS — Database Schema
-- Ekzekuto në Supabase → SQL Editor
-- ============================================================

-- HOTELS
create table if not exists hotels (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text unique not null,
  address      text,
  phone        text,
  email        text,
  admin_email  text,
  created_at   timestamptz default now()
);

-- USER PROFILES
create table if not exists user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  hotel_id    uuid references hotels(id) on delete set null,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        text not null default 'guest',
  created_at  timestamptz default now()
);

-- ROOMS
create table if not exists rooms (
  id               uuid primary key default gen_random_uuid(),
  hotel_id         uuid references hotels(id) on delete cascade,
  name             text not null,
  type             text not null,
  capacity         int default 2,
  price_per_night  numeric(10,2) not null,
  description      text,
  images           text[],
  is_active        bool default true,
  created_at       timestamptz default now()
);

-- BOOKINGS
create table if not exists bookings (
  id           uuid primary key default gen_random_uuid(),
  hotel_id     uuid references hotels(id) on delete cascade,
  room_id      uuid references rooms(id),
  user_id      uuid references auth.users(id),
  guest_name   text not null,
  guest_email  text not null,
  guest_phone  text,
  check_in     date not null,
  check_out    date not null,
  nights       int generated always as (check_out - check_in) stored,
  total_price  numeric(10,2) not null,
  status       text default 'pending',
  source       text default 'direct',
  notes        text,
  created_at   timestamptz default now()
);

-- PAYMENTS
create table if not exists payments (
  id                 uuid primary key default gen_random_uuid(),
  booking_id         uuid references bookings(id) on delete cascade,
  hotel_id           uuid references hotels(id),
  amount             numeric(10,2) not null,
  method             text not null,
  status             text default 'pending',
  stripe_payment_id  text,
  invoice_url        text,
  paid_at            timestamptz,
  created_at         timestamptz default now()
);

-- STAFF
create table if not exists staff (
  id          uuid primary key default gen_random_uuid(),
  hotel_id    uuid references hotels(id) on delete cascade,
  user_id     uuid references auth.users(id),
  full_name   text not null,
  role        text not null,
  department  text,
  phone       text,
  salary      numeric(10,2),
  hired_at    date,
  is_active   bool default true,
  created_at  timestamptz default now()
);

-- SHIFTS
create table if not exists shifts (
  id          uuid primary key default gen_random_uuid(),
  hotel_id    uuid references hotels(id) on delete cascade,
  staff_id    uuid references staff(id) on delete cascade,
  shift_date  date not null,
  start_time  time not null,
  end_time    time not null,
  status      text default 'scheduled',
  notes       text,
  created_at  timestamptz default now()
);

-- SUPPLIERS
create table if not exists suppliers (
  id            uuid primary key default gen_random_uuid(),
  hotel_id      uuid references hotels(id) on delete cascade,
  name          text not null,
  contact_name  text,
  phone         text,
  email         text,
  category      text,
  contract_url  text,
  is_active     bool default true,
  created_at    timestamptz default now()
);

-- INVENTORY
create table if not exists inventory_items (
  id           uuid primary key default gen_random_uuid(),
  hotel_id     uuid references hotels(id) on delete cascade,
  supplier_id  uuid references suppliers(id),
  name         text not null,
  category     text not null,
  unit         text default 'cope',
  quantity     numeric(10,2) default 0,
  min_quantity numeric(10,2) default 5,
  unit_cost    numeric(10,2),
  created_at   timestamptz default now()
);

-- CHANNEL MAPPINGS
create table if not exists channel_mappings (
  id                uuid primary key default gen_random_uuid(),
  hotel_id          uuid references hotels(id) on delete cascade,
  room_id           uuid references rooms(id),
  channel           text not null,
  external_room_id  text not null,
  last_synced_at    timestamptz,
  created_at        timestamptz default now()
);

-- ============================================================
-- RLS
-- ============================================================
alter table hotels           enable row level security;
alter table user_profiles    enable row level security;
alter table rooms            enable row level security;
alter table bookings         enable row level security;
alter table payments         enable row level security;
alter table staff            enable row level security;
alter table shifts           enable row level security;
alter table suppliers        enable row level security;
alter table inventory_items  enable row level security;
alter table channel_mappings enable row level security;

-- Helper functions
create or replace function get_my_hotel_id()
returns uuid language sql stable security definer as $$
  select hotel_id from user_profiles where id = auth.uid()
$$;

create or replace function get_my_role()
returns text language sql stable security definer as $$
  select role from user_profiles where id = auth.uid()
$$;

-- user_profiles policies
create policy "profile_self_read"   on user_profiles for select using (id = auth.uid());
create policy "profile_self_update" on user_profiles for update using (id = auth.uid());

-- rooms policies
create policy "rooms_public_read" on rooms for select using (is_active = true);
create policy "rooms_admin_all"   on rooms for all using (hotel_id = get_my_hotel_id() and get_my_role() in ('admin','superadmin'));

-- bookings policies
create policy "bookings_guest_read"   on bookings for select using (user_id = auth.uid());
create policy "bookings_guest_insert" on bookings for insert with check (user_id = auth.uid());
create policy "bookings_staff_all"    on bookings for all using (hotel_id = get_my_hotel_id() and get_my_role() in ('admin','superadmin','receptionist'));

-- payments policies
create policy "payments_staff_all" on payments for all using (hotel_id = get_my_hotel_id() and get_my_role() in ('admin','superadmin'));

-- staff policies
create policy "staff_hotel_all" on staff for all using (hotel_id = get_my_hotel_id() and get_my_role() in ('admin','superadmin','hr'));

-- shifts policies
create policy "shifts_hotel_all" on shifts for all using (hotel_id = get_my_hotel_id() and get_my_role() in ('admin','superadmin','hr','receptionist'));

-- inventory policies
create policy "inventory_staff_all" on inventory_items for all using (hotel_id = get_my_hotel_id() and get_my_role() in ('admin','superadmin','staff'));

-- suppliers policies
create policy "suppliers_admin_all" on suppliers for all using (hotel_id = get_my_hotel_id() and get_my_role() in ('admin','superadmin'));

-- channel_mappings policies
create policy "channels_admin_all" on channel_mappings for all using (hotel_id = get_my_hotel_id() and get_my_role() in ('admin','superadmin'));

-- ============================================================
-- TRIGGER: auto-create profile pas sign-up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    'guest'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CRON: alarm stok i ulët çdo mëngjes 08:00
-- (kërkon pg_net dhe pg_cron extensions)
-- ============================================================
-- select cron.schedule('low-stock-check', '0 8 * * *', 'select check_low_stock()');
