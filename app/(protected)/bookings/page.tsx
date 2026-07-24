import { createClient } from "@/lib/supabase/server";
import { currentMonthKey, getMonthRange } from "@/lib/dates";
import type { Booking, Property } from "@/lib/types";
import { MonthPicker } from "@/components/month-picker";
import { BookingDialog } from "./booking-dialog";
import { BookingsView } from "./bookings-view";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? currentMonthKey();
  const { start, end } = getMonthRange(month);

  const supabase = await createClient();

  const [{ data: properties }, { data: bookings }] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: true })
      .returns<Property[]>(),
    supabase
      .from("bookings")
      .select("*")
      .lte("check_in", end)
      .gte("check_out", start)
      .order("check_in", { ascending: true })
      .returns<Booking[]>(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <div className="flex items-center gap-3">
          <MonthPicker month={month} />
          <BookingDialog properties={properties ?? []} />
        </div>
      </div>

      {!properties?.length ? (
        <p className="text-muted-foreground">
          Add a property first before recording bookings.
        </p>
      ) : (
        <BookingsView
          key={month}
          bookings={bookings ?? []}
          properties={properties}
          month={month}
        />
      )}
    </div>
  );
}
