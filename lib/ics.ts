import type { Booking } from "@/lib/types";

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatDateOnly(iso: string) {
  return iso.replace(/-/g, "");
}

function formatTimestamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function generateIcs(
  bookings: Booking[],
  propertyName: (propertyId: string) => string
) {
  const now = formatTimestamp(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Property Manager//Bookings//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const booking of bookings) {
    const summary = `${booking.guest_name} — ${propertyName(booking.property_id)}`;
    const descriptionParts = [
      `Source: ${booking.source}`,
      `Your share: ${booking.owner_share.toFixed(2)}`,
      `Commission: ${booking.commission.toFixed(2)}`,
      `Platform fee: ${booking.platform_fee.toFixed(2)}`,
    ];
    if (booking.notes) descriptionParts.push(`Notes: ${booking.notes}`);

    lines.push(
      "BEGIN:VEVENT",
      `UID:${booking.id}@property-manager`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${formatDateOnly(booking.check_in)}`,
      `DTEND;VALUE=DATE:${formatDateOnly(booking.check_out)}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(descriptionParts.join("\n"))}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
