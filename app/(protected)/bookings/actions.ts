"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema, type BookingInput } from "@/lib/schemas";

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
    owner_share: parsed.data.owner_share,
    commission: parsed.data.commission,
    platform_fee: parsed.data.platform_fee,
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
      owner_share: parsed.data.owner_share,
      commission: parsed.data.commission,
      platform_fee: parsed.data.platform_fee,
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

export async function setPaymentReceived(
  id: string,
  received: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ payment_received: received })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
