"use server";

import { createClient } from "@/lib/supabase/server";
import { parseICalFromUrl, type ICalEvent } from "@/lib/ical-parser";

interface ImportPreview {
  events: (ICalEvent & { duplicate: boolean })[];
  newCount: number;
  duplicateCount: number;
}

interface ImportResult {
  success: boolean;
  createdCount: number;
  duplicateCount: number;
  error?: string;
}

export async function previewICalImport(
  url: string,
  propertyId: string
): Promise<ImportPreview> {
  try {
    const events = await parseICalFromUrl(url);
    const supabase = await createClient();

    // Fetch existing bookings for duplicate detection
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("guest_name, check_in, check_out")
      .eq("property_id", propertyId)
      .returns<Array<{ guest_name: string; check_in: string; check_out: string }>>();

    const existingSet = new Set(
      (existingBookings ?? []).map(
        (b) => `${b.guest_name}|${b.check_in}|${b.check_out}`
      )
    );

    const eventsWithDuplicates = events.map((event) => ({
      ...event,
      duplicate: existingSet.has(
        `${event.title}|${event.startDate}|${event.endDate}`
      ),
    }));

    const newCount = eventsWithDuplicates.filter((e) => !e.duplicate).length;
    const duplicateCount = eventsWithDuplicates.filter((e) => e.duplicate).length;

    return { events: eventsWithDuplicates, newCount, duplicateCount };
  } catch (error) {
    throw new Error(
      `Failed to preview iCal import: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function importICalBookings(
  url: string,
  propertyId: string,
  skipDuplicates: boolean = true
): Promise<ImportResult> {
  try {
    const preview = await previewICalImport(url, propertyId);
    const supabase = await createClient();

    const eventsToImport = skipDuplicates
      ? preview.events.filter((e) => !e.duplicate)
      : preview.events;

    let createdCount = 0;
    let errorCount = 0;

    for (const event of eventsToImport) {
      const { error } = await supabase.from("bookings").insert({
        property_id: propertyId,
        guest_name: event.title,
        check_in: event.startDate,
        check_out: event.endDate,
        owner_share: 0,
        commission: 0,
        platform_fee: 0,
        source: "Calendar Import",
        notes: event.description || null,
      });

      if (!error) {
        createdCount++;
      } else {
        errorCount++;
      }
    }

    return {
      success: errorCount === 0,
      createdCount,
      duplicateCount: preview.duplicateCount,
    };
  } catch (error) {
    return {
      success: false,
      createdCount: 0,
      duplicateCount: 0,
      error:
        error instanceof Error ? error.message : "Failed to import iCal bookings",
    };
  }
}
