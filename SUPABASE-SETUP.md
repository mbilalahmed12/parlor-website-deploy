# Supabase Setup Guide (Free Tier)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose a project name (e.g., "parlor-website")
4. Create a strong database password
5. Select region closest to your users
6. Click "Create new project" (free tier is default)
7. Wait for project to initialize (~2-3 min)

## Step 2: Get Project Credentials

In your Supabase dashboard:
- Click **Settings** → **API**
- Copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Create Database Tables

Go to **SQL Editor** in Supabase dashboard and run the SQL below (or paste into `supabase-schema.sql` and import):

```sql
-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INT DEFAULT 30,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  booking_date TIMESTAMP NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Can view own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users: Can update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Services: Anyone can view active services
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = TRUE);

-- Services: Admin can manage services
CREATE POLICY "Admin can manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Bookings: Users can view own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Bookings: Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookings: Admin can view all bookings
CREATE POLICY "Admin can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Bookings: Admin can update bookings
CREATE POLICY "Admin can update bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Reviews: Anyone can view reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (TRUE);

-- Reviews: Users can create reviews on own bookings
CREATE POLICY "Users can create reviews on own bookings" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = booking_id AND bookings.user_id = auth.uid()
    )
  );

-- Settings: Anyone can view public settings
CREATE POLICY "Anyone can view settings" ON settings
  FOR SELECT USING (TRUE);

-- Settings: Admin can update settings
CREATE POLICY "Admin can update settings" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_services_category ON services(category);
```

## Step 4: Setup Storage for File Uploads

1. Go to **Storage** in Supabase dashboard
2. Click **Create a new bucket**
3. Name it `service-images` (public)
4. Repeat for `user-uploads` (public)
5. Go to **Policies** on each bucket and allow public read

## Step 5: Create Admin User

Run in SQL Editor:
```sql
-- Create admin user (replace with your email/password)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@parlor.com', crypt('Admin123!', gen_salt('bf')), NOW());

-- Then manually set role to admin in users table
UPDATE users SET role = 'admin' WHERE email = 'admin@parlor.com';
```

Or use Supabase Auth tab to create user, then update role in users table.

## Step 6: Environment Variables

Create `.env.local` in your frontend folder:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Free Tier Limits
- **Database**: 500 MB
- **Auth Users**: Unlimited
- **Storage**: 1 GB
- **API requests**: Unlimited
- **Realtime**: Included

This is plenty for a salon booking system!
