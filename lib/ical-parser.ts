import ICAL from "ical.js";

export interface ICalEvent {
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  description?: string;
}

interface DateProperty {
  toJSDate(): Date;
}

export async function parseICalFromUrl(url: string): Promise<ICalEvent[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch iCal: ${response.statusText}`);
  }

  const icalText = await response.text();
  return parseICalText(icalText);
}

export function parseICalText(icalText: string): ICalEvent[] {
  const jcal = ICAL.parse(icalText);
  const comp = new ICAL.Component(jcal);
  const events = comp.getAllSubcomponents("vevent");

  return events.map((event) => {
    const startProp = event.getFirstPropertyValue("dtstart") as DateProperty | string | undefined;
    const endProp = event.getFirstPropertyValue("dtend") as DateProperty | string | undefined;
    const summary = event.getFirstPropertyValue("summary") || "Untitled";
    const description = event.getFirstPropertyValue("description") || "";

    // Convert to date strings (YYYY-MM-DD)
    const startDate =
      startProp && typeof startProp === "object" && "toJSDate" in startProp
        ? startProp.toJSDate().toISOString().split("T")[0]
        : new Date(String(startProp)).toISOString().split("T")[0];

    const endDate =
      endProp && typeof endProp === "object" && "toJSDate" in endProp
        ? endProp.toJSDate().toISOString().split("T")[0]
        : new Date(String(endProp)).toISOString().split("T")[0];

    return {
      title: String(summary),
      startDate,
      endDate,
      description: String(description),
    };
  });
}
