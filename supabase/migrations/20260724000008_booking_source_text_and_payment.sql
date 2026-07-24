-- Bookings can now come from any source, not just a fixed enum, so hosts can log
-- VRBO, Expedia, TripAdvisor, or any custom platform. The stored value is now the
-- display label itself, so no more code->label mapping is needed anywhere.
alter table public.bookings alter column source drop default;
alter table public.bookings alter column source type text using (
  case source::text
    when 'airbnb' then 'Airbnb'
    when 'booking_com' then 'Booking.com'
    when 'direct' then 'Direct'
    else initcap(source::text)
  end
);
alter table public.bookings alter column source set default 'Direct';
drop type if exists public.booking_source;

-- Manual payment confirmation, replacing the old date-derived received/backlog/future
-- status: a booking starts unpaid ("to receive") until explicitly marked received.
alter table public.bookings add column payment_received boolean not null default false;
