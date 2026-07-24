"use client";

import { useState } from "react";
import { bookingSchema, type BookingInput } from "@/lib/schemas";
import type { Property } from "@/lib/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CsvImporter } from "./csv-importer";
import { bulkImportBookings } from "./actions";

const HEADERS = [
  "guest_name",
  "check_in",
  "check_out",
  "owner_share",
  "commission",
  "platform_fee",
  "source (e.g. Airbnb, Booking.com, VRBO, Direct, or any custom name)",
  "notes",
];

export function BookingsImportTab({ properties }: { properties: Property[] }) {
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Property</Label>
        <Select value={propertyId} onValueChange={setPropertyId}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <CsvImporter<BookingInput>
        expectedHeaders={HEADERS}
        disabled={!propertyId}
        disabledMessage="Add a property first."
        parseRow={(raw) => {
          const parsed = bookingSchema.safeParse({
            property_id: propertyId,
            guest_name: raw.guest_name,
            check_in: raw.check_in,
            check_out: raw.check_out,
            owner_share: raw.owner_share || "0",
            commission: raw.commission || "0",
            platform_fee: raw.platform_fee || "0",
            source: (raw.source || "Direct").trim(),
            notes: raw.notes,
          });
          if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message ?? "Invalid row" };
          }
          return { data: parsed.data };
        }}
        onImport={(rows) => bulkImportBookings(rows)}
        previewColumns={["Guest", "Check-in", "Check-out", "Share"]}
        previewRow={(row) => [
          row.guest_name,
          row.check_in,
          row.check_out,
          String(row.owner_share),
        ]}
      />
    </div>
  );
}
