create type public.booking_source as enum ('airbnb', 'booking_com', 'direct');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  guest_name text not null,
  check_in date not null,
  check_out date not null,
  gross_amount numeric(10, 2) not null default 0,
  platform_fee numeric(10, 2) not null default 0,
  net_payout numeric(10, 2) not null default 0,
  source public.booking_source not null default 'direct',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_out_after_check_in check (check_out > check_in)
);

create index bookings_owner_id_idx on public.bookings (owner_id);
create index bookings_property_id_idx on public.bookings (property_id);
create index bookings_check_in_idx on public.bookings (check_in);

alter table public.bookings enable row level security;

create policy "Owners manage own bookings"
  on public.bookings for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create trigger set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();
