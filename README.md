# Property Manager

Track bookings and expenses for your rental property. See [SPEC.md](./SPEC.md) for
the product spec.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com/dashboard) (free tier is fine).
2. **Get your API keys**: Project Settings → Data API → copy the Project URL and the
   `anon` `public` key. Put them in `.env.local` (copy `.env.local.example`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

3. **Run the migrations**: open the SQL Editor in Supabase Studio and run each file
   in `supabase/migrations/` in order (profiles → properties → bookings →
   expenses). Or, if you have the Supabase CLI set up: `supabase link` then
   `supabase db push`.
4. **Create your login**: this is a single-user app with no public sign-up.
   In Supabase Studio go to Authentication → Users → Add user, and set an email +
   password. That's what you'll use to log in at `/login`.
5. **Run the app**:

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and log in.

## Notes

- Every table (`properties`, `bookings`, `expenses`, `profiles`) has row-level
  security scoped to `auth.uid()`, so only your logged-in user can see or modify
  its own rows.
- No service-role key is used anywhere — the app only ever acts through the
  logged-in user's session.
