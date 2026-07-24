"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import { BOOKING_SOURCES } from "@/lib/types";
import type { Booking, Property } from "@/lib/types";
import { payoutStatus, type PayoutStatus } from "@/lib/accrual";
import { BookingDialog } from "./booking-dialog";
import { DeleteBookingButton } from "./delete-booking-button";

function sourceLabel(source: Booking["source"]) {
  return BOOKING_SOURCES.find((s) => s.value === source)?.label ?? source;
}

const STATUS_LABEL: Record<PayoutStatus, string> = {
  received: "Received",
  backlog: "Pending",
  future: "Future",
};

const STATUS_CLASS: Record<PayoutStatus, string> = {
  received: "bg-success/10 text-success",
  backlog: "bg-accent/20 text-accent-foreground",
  future: "bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: PayoutStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_CLASS[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function isDateWithinBooking(date: Date, booking: Booking) {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
  return dateStr >= booking.check_in && dateStr < booking.check_out;
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

  const bookedDates = useMemo(() => {
    const dates: Date[] = [];
    for (const booking of bookings) {
      const cursor = new Date(`${booking.check_in}T00:00:00`);
      const end = new Date(`${booking.check_out}T00:00:00`);
      while (cursor < end) {
        dates.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return dates;
  }, [bookings]);

  const [year, monthIndex] = month.split("-").map(Number);
  const defaultMonth = new Date(year, monthIndex - 1, 1);

  const selectedDayBookings = selectedDate
    ? bookings.filter((b) => isDateWithinBooking(selectedDate, b))
    : [];

  return (
    <Tabs defaultValue="list">
      <TabsList>
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
      </TabsList>

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
                    <TableHead>Status</TableHead>
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
                        <Badge variant="outline">{sourceLabel(booking.source)}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payoutStatus(booking.check_out)} />
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

      <TabsContent value="calendar">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Card>
            <CardContent>
              <Calendar
                defaultMonth={defaultMonth}
                selected={selectedDate}
                onDayClick={(day) => setSelectedDate(day)}
                modifiers={{ booked: bookedDates }}
                modifiersClassNames={{
                  booked: "bg-primary/15 font-semibold",
                }}
              />
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
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{booking.guest_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {propertyName(booking.property_id)} ·{" "}
                        {booking.check_in} → {booking.check_out}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <BookingDialog booking={booking} properties={properties} />
                      <DeleteBookingButton id={booking.id} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
