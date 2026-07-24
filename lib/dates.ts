export function toDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Returns `n` month keys ending at (and including) `endMonthKey`, oldest first. */
export function lastNMonths(n: number, endMonthKey: string = currentMonthKey()) {
  const [year, month] = endMonthKey.split("-").map(Number);
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export function getMonthRange(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    start: toDateString(start),
    end: toDateString(end),
    daysInMonth: end.getDate(),
  };
}

/** Nights of [checkIn, checkOut) that fall within [rangeStart, rangeEnd] (both dates inclusive). */
export function overlapNights(
  checkIn: string,
  checkOut: string,
  rangeStart: string,
  rangeEnd: string
) {
  const ci = new Date(`${checkIn}T00:00:00`);
  const co = new Date(`${checkOut}T00:00:00`);
  const rs = new Date(`${rangeStart}T00:00:00`);
  const re = new Date(`${rangeEnd}T00:00:00`);
  re.setDate(re.getDate() + 1);

  const start = ci > rs ? ci : rs;
  const end = co < re ? co : re;
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / 86400000));
}
