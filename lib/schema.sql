-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type asset_type as enum ('stock', 'etf', 'realEstate', 'cash', 'crypto', 'bond', 'other', 'gemel');
create type currency as enum ('USD', 'EUR', 'ILS', 'GBP');
create type risk_level as enum ('low', 'medium', 'high');
create type recurring_frequency as enum ('weekly', 'monthly', 'quarterly', 'annually');

-- Create users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create assets table
create table public.assets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type asset_type not null,
  ticker text,
  value numeric not null,
  currency currency not null,
  location text not null,
  risk_level risk_level not null,
  annual_yield numeric,
  has_recurring_contribution boolean default false,
  recurring_amount numeric,
  recurring_frequency recurring_frequency,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  asset_id uuid references public.assets(id) on delete cascade not null,
  type text not null check (type in ('buy', 'sell', 'dividend', 'rent', 'interest')),
  amount numeric not null,
  currency currency not null,
  date timestamp with time zone not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create statements table
create table public.statements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null,
  file_url text not null,
  file_type text not null check (file_type in ('pdf', 'csv')),
  status text not null check (status in ('pending', 'processing', 'completed', 'failed')),
  processed_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create prices table for tracking asset values
create table public.prices (
  id uuid default uuid_generate_v4() primary key,
  asset_id uuid references public.assets(id) on delete cascade not null,
  price numeric not null,
  date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.transactions enable row level security;
alter table public.statements enable row level security;
alter table public.prices enable row level security;

-- Create RLS policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can view their own assets"
  on public.assets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own assets"
  on public.assets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own assets"
  on public.assets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own assets"
  on public.assets for delete
  using (auth.uid() = user_id);

-- Similar policies for transactions, statements, and prices
create policy "Users can manage their own transactions"
  on public.transactions for all
  using (auth.uid() = user_id);

create policy "Users can manage their own statements"
  on public.statements for all
  using (auth.uid() = user_id);

create policy "Users can manage their own prices"
  on public.prices for all
  using (auth.uid() = (select user_id from public.assets where id = asset_id));

-- Create indexes for better performance
create index assets_user_id_idx on public.assets(user_id);
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_asset_id_idx on public.transactions(asset_id);
create index statements_user_id_idx on public.statements(user_id);
create index prices_asset_id_idx on public.prices(asset_id);
create index prices_date_idx on public.prices(date); 