"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bookingSchema = z
  .object({
    property_id: z.string().uuid("Select a property"),
    guest_name: z.string().min(1, "Guest name is required"),
    check_in: z.string().min(1, "Check-in date is required"),
    check_out: z.string().min(1, "Check-out date is required"),
    gross_amount: z.coerce.number().min(0, "Must be 0 or more"),
    platform_fee: z.coerce.number().min(0, "Must be 0 or more"),
    net_payout: z.coerce.number().min(0, "Must be 0 or more"),
    source: z.enum(["airbnb", "booking_com", "direct"]),
    notes: z.string().optional(),
  })
  .refine((data) => data.check_out > data.check_in, {
    message: "Check-out must be after check-in",
    path: ["check_out"],
  });

export type BookingInput = z.infer<typeof bookingSchema>;

interface ActionResult {
  error?: string;
}

export async function createBooking(input: BookingInput): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("bookings").insert({
    property_id: parsed.data.property_id,
    guest_name: parsed.data.guest_name,
    check_in: parsed.data.check_in,
    check_out: parsed.data.check_out,
    gross_amount: parsed.data.gross_amount,
    platform_fee: parsed.data.platform_fee,
    net_payout: parsed.data.net_payout,
    source: parsed.data.source,
    notes: parsed.data.notes || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function updateBooking(
  id: string,
  input: BookingInput
): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      property_id: parsed.data.property_id,
      guest_name: parsed.data.guest_name,
      check_in: parsed.data.check_in,
      check_out: parsed.data.check_out,
      gross_amount: parsed.data.gross_amount,
      platform_fee: parsed.data.platform_fee,
      net_payout: parsed.data.net_payout,
      source: parsed.data.source,
      notes: parsed.data.notes || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function deleteBooking(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
