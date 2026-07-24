import type { Booking } from "@/lib/types";

export function bookingGross(
  b: Pick<Booking, "owner_share" | "commission" | "platform_fee">
) {
  return b.owner_share + b.commission + b.platform_fee;
}

export interface MonthAccrual {
  nights: number;
  ownerShare: number;
  commission: number;
  platformFee: number;
}

function emptyAccrual(): MonthAccrual {
  return { nights: 0, ownerShare: 0, commission: 0, platformFee: 0 };
}

/**
 * Spreads each booking's dollar amounts evenly across every night of the stay,
 * bucketed by the calendar month that night falls in. A stay crossing a month
 * boundary earns pro-rated in both months instead of being lump-summed into one.
 */
export function accrueBookingsByMonth(
  bookings: Booking[]
): Map<string, MonthAccrual> {
  const map = new Map<string, MonthAccrual>();

  for (const b of bookings) {
    const start = new Date(`${b.check_in}T00:00:00`);
    const end = new Date(`${b.check_out}T00:00:00`);
    const nights = Math.round(
      (end.getTime() - start.getTime()) / 86400000
    );
    if (nights <= 0) continue;

    const perNightShare = b.owner_share / nights;
    const perNightCommission = b.commission / nights;
    const perNightFee = b.platform_fee / nights;

    const cursor = new Date(start);
    for (let i = 0; i < nights; i++) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      const entry = map.get(key) ?? emptyAccrual();
      entry.nights += 1;
      entry.ownerShare += perNightShare;
      entry.commission += perNightCommission;
      entry.platformFee += perNightFee;
      map.set(key, entry);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return map;
}

export function resolveAvailableNights(
  daysInMonth: number,
  nightsBooked: number,
  override?: number
) {
  const base = override ?? daysInMonth;
  return Math.min(daysInMonth, Math.max(base, nightsBooked));
}
