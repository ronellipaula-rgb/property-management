"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import type { Booking, Property } from "@/lib/types";
import { BookingDialog } from "./booking-dialog";
import { DeleteBookingButton } from "./delete-booking-button";
import { setPaymentReceived } from "./actions";

const KNOWN_SOURCE_COLORS: Record<string, { dot: string; modifier: string }> = {
  Airbnb: {
    dot: "bg-rose-500",
    modifier: "bg-rose-500/15 font-semibold text-rose-600 dark:text-rose-400",
  },
  "Booking.com": {
    dot: "bg-blue-500",
    modifier: "bg-blue-500/15 font-semibold text-blue-600 dark:text-blue-400",
  },
  VRBO: {
    dot: "bg-amber-500",
    modifier: "bg-amber-500/15 font-semibold text-amber-600 dark:text-amber-400",
  },
  Expedia: {
    dot: "bg-violet-500",
    modifier: "bg-violet-500/15 font-semibold text-violet-600 dark:text-violet-400",
  },
  TripAdvisor: {
    dot: "bg-emerald-500",
    modifier: "bg-emerald-500/15 font-semibold text-emerald-600 dark:text-emerald-400",
  },
  Direct: {
    dot: "bg-primary",
    modifier: "bg-primary/15 font-semibold text-primary",
  },
};

const FALLBACK_SOURCE_COLOR = {
  dot: "bg-slate-400",
  modifier: "bg-slate-400/15 font-semibold text-slate-600 dark:text-slate-400",
};

function sourceColor(source: string) {
  return KNOWN_SOURCE_COLORS[source] ?? FALLBACK_SOURCE_COLOR;
}

function isDateWithinBooking(date: Date, booking: Booking) {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
  return dateStr >= booking.check_in && dateStr < booking.check_out;
}

function PaymentToggle({ booking }: { booking: Booking }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      const result = await setPaymentReceived(booking.id, checked);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={booking.payment_received}
        disabled={pending}
        onCheckedChange={(checked) => handleChange(checked === true)}
        aria-label="Mark payment received"
      />
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium",
          booking.payment_received
            ? "bg-success/10 text-success"
            : "bg-accent/20 text-accent-foreground"
        )}
      >
        {booking.payment_received ? "Received" : "To receive"}
      </span>
    </div>
  );
}

export function BookingsView({
  bookings,
  properties,
  month,
}: {
  bookings: Booking[];
  properties: Property[];
  month: string;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const propertyName = (id: string) =>
    properties.find((p) => p.id === id)?.name ?? "—";

  const datesBySource = useMemo(() => {
    const map: Record<string, Date[]> = {};
    for (const booking of bookings) {
      const cursor = new Date(`${booking.check_in}T00:00:00`);
      const end = new Date(`${booking.check_out}T00:00:00`);
      const dates = map[booking.source] ?? (map[booking.source] = []);
      while (cursor < end) {
        dates.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return map;
  }, [bookings]);

  const sourcesPresent = Object.keys(datesBySource).sort();

  const modifiersClassNames = useMemo(() => {
    const result: Record<string, string> = {};
    for (const source of sourcesPresent) {
      result[source] = sourceColor(source).modifier;
    }
    return result;
  }, [sourcesPresent]);

  const [year, monthIndex] = month.split("-").map(Number);
  const defaultMonth = new Date(year, monthIndex - 1, 1);

  const selectedDayBookings = selectedDate
    ? bookings.filter((b) => isDateWithinBooking(selectedDate, b))
    : [];

  return (
    <Tabs defaultValue="calendar">
      <TabsList>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="list">List</TabsTrigger>
      </TabsList>

      <TabsContent value="calendar">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <Calendar
                className="w-fit [--cell-size:3rem]"
                defaultMonth={defaultMonth}
                selected={selectedDate}
                onDayClick={(day) => setSelectedDate(day)}
                modifiers={datesBySource}
                modifiersClassNames={modifiersClassNames}
              />
              {sourcesPresent.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 border-t pt-3 text-sm text-muted-foreground">
                  {sourcesPresent.map((source) => (
                    <div key={source} className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-block size-2.5 rounded-full",
                          sourceColor(source).dot
                        )}
                      />
                      {source}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {selectedDate
                  ? `Bookings on ${selectedDate.toLocaleDateString("en-CA")}`
                  : "Click a highlighted day to see bookings"}
              </p>
              {selectedDayBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {selectedDate ? "No bookings on this day." : ""}
                </p>
              ) : (
                selectedDayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{booking.guest_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {propertyName(booking.property_id)} ·{" "}
                        {booking.check_in} → {booking.check_out}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <PaymentToggle booking={booking} />
                      <div className="flex gap-2">
                        <BookingDialog booking={booking} properties={properties} />
                        <DeleteBookingButton id={booking.id} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="list">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No bookings for this month.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Nights</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Your share</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.guest_name}
                      </TableCell>
                      <TableCell>{propertyName(booking.property_id)}</TableCell>
                      <TableCell>{booking.check_in}</TableCell>
                      <TableCell>{booking.check_out}</TableCell>
                      <TableCell>
                        {differenceInCalendarDays(
                          new Date(booking.check_out),
                          new Date(booking.check_in)
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{booking.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <PaymentToggle booking={booking} />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(booking.owner_share)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <BookingDialog booking={booking} properties={properties} />
                          <DeleteBookingButton id={booking.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
