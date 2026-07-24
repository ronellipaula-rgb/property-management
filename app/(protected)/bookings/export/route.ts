import { createClient } from "@/lib/supabase/server";
import { generateIcs } from "@/lib/ics";
import type { Booking, Property } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();

  const [{ data: bookings }, { data: properties }] = await Promise.all([
    supabase.from("bookings").select("*").order("check_in").returns<Booking[]>(),
    supabase.from("properties").select("*").returns<Property[]>(),
  ]);

  const propertyName = (id: string) =>
    properties?.find((p) => p.id === id)?.name ?? "Property";

  const ics = generateIcs(bookings ?? [], propertyName);

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bookings.ics"',
    },
  });
}
