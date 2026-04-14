-- Drop existing tables and functions
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.booking_services CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.maids CASCADE;
DROP TABLE IF EXISTS public.employers CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE; -- Legacy
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  user_type TEXT,
  is_verified BOOLEAN DEFAULT false,
  district TEXT
);

-- Create Services Table
CREATE TABLE public.services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration INT, -- in minutes
  price NUMERIC(10, 2)
);

-- Create a table for employers
CREATE TABLE public.employers (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  address TEXT,
  preferences TEXT
);

-- Create a table for maids
CREATE TABLE public.maids (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  skills TEXT[],
  availability TEXT,
  experience INT, -- in years
  hourly_rate NUMERIC(10, 2),
  languages TEXT[],
  bio TEXT
);

-- Create Bookings Table
CREATE TABLE public.bookings (
  id SERIAL PRIMARY KEY,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  maid_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Join table for many-to-many relationship between bookings and services
CREATE TABLE public.booking_services (
  booking_id INT REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id INT REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (booking_id, service_id)
);

-- Create Payments Table
CREATE TABLE public.payments (
  id SERIAL PRIMARY KEY,
  booking_id INT REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create Ratings Table
CREATE TABLE public.ratings (
  id SERIAL PRIMARY KEY,
  maid_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  booking_id INT REFERENCES public.bookings(id) ON DELETE CASCADE,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to create a public user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a record in public.users
  INSERT INTO public.users (id, full_name, user_type)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'user_type');

  -- Create a profile in either employers or maids table
  IF new.raw_user_meta_data->>'user_type' = 'employer' THEN
    INSERT INTO public.employers (id) VALUES (new.id);
  ELSIF new.raw_user_meta_data->>'user_type' = 'maid' THEN
    INSERT INTO public.maids (id) VALUES (new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
