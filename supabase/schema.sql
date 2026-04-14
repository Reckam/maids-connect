-- SQL Schema for Maids Connect (Run this in Supabase SQL Editor)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Profile Table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  email text not null,
  user_type text check (user_type in ('maid', 'employer', 'admin')) not null,
  avatar_url text,
  is_verified boolean default false,
  district text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Maid Details Table
create table public.maids (
  id uuid references public.users on delete cascade not null primary key,
  bio text,
  hourly_rate numeric,
  experience integer default 0,
  skills text[],
  languages text[],
  availability text,
  rating numeric default 0,
  review_count integer default 0
);

-- Bookings Table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  employer_id uuid references public.users not null,
  maid_id uuid references public.users not null,
  date date not null,
  time time not null,
  duration numeric not null,
  total_price numeric not null,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  services text[],
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reviews Table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings not null,
  reviewer_id uuid references public.users not null,
  reviewee_id uuid references public.users not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reports Table
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.users not null,
  reported_id uuid references public.users not null,
  reason text not null,
  details text,
  status text check (status in ('pending', 'resolved')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) - Basic Setup
alter table public.users enable row level security;
alter table public.maids enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;

-- Policies (Example: Users can read all users, but only update their own)
create policy "Public profiles are viewable by everyone." on public.users for select using (true);
create policy "Users can update own profile." on public.users for update using (auth.uid() = id);

create policy "Maid details are viewable by everyone." on public.maids for select using (true);
create policy "Maids can update own details." on public.maids for update using (auth.uid() = id);
