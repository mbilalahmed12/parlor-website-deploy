-- Supabase schema for the salon app
-- Matches the backend API in backend/routes/* and the frontend auth store.

create extension if not exists pgcrypto;

-- User profiles linked to Supabase Auth
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role text check (role in ('customer', 'admin')) default 'customer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Services
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  duration integer,
  category text not null,
  category_label text,
  audience text default 'her',
  category_video_url text,
  image text,
  media_type text default 'none',
  media_url text,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  service_id uuid references services(id) on delete set null,
  booking_date date not null,
  booking_time text not null,
  notes text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_email text not null,
  rating integer not null,
  comment text not null,
  service_id uuid references services(id) on delete set null,
  image text,
  approved boolean default false,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Single settings row keyed by id = 1
create table if not exists settings (
  id integer primary key,
  parlor_name text,
  parlor_description text,
  parlor_logo_url text,
  hero_video_url text,
  hero_image_url text,
  hero_title text,
  hero_subtitle text,
  hero_cta_text text,
  discount_text text,
  offer_banner text,
  why_us_title text,
  why_us_description text,
  why_us_points jsonb,
  why_us_media_url text,
  why_us_media_type text,
  why_us_signature_detail text,
  customize_cta_text text,
  contact_email text,
  contact_phone text,
  contact_address text,
  locations_text text,
  social_links jsonb,
  working_hours jsonb,
  updated_at timestamptz default now()
);

alter table users enable row level security;
alter table services enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table settings enable row level security;

-- Users can read/update their own profile
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

-- Public read access for content that the frontend may fetch directly
create policy "Anyone can view active services" on services
  for select using (active = true);

create policy "Anyone can view reviews" on reviews
  for select using (approved = true);

create policy "Anyone can view settings" on settings
  for select using (true);

-- Admin writes are handled by the backend service role key, so these are permissive for direct SQL use.
create policy "Admin can manage services" on services
  for all using (true) with check (true);

create policy "Admin can manage bookings" on bookings
  for all using (true) with check (true);

create policy "Admin can manage reviews" on reviews
  for all using (true) with check (true);

create policy "Admin can manage settings" on settings
  for all using (true) with check (true);

create index if not exists idx_services_category on services(category);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_bookings_date on bookings(booking_date);
create index if not exists idx_reviews_service_id on reviews(service_id);
