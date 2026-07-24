"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { propertySchema, bookingSchema, expenseSchema } from "@/lib/schemas";

interface BulkResult {
  error?: string;
  inserted?: number;
}

export async function bulkImportProperties(rows: unknown[]): Promise<BulkResult> {
  const parsed = z.array(propertySchema).safeParse(rows);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  if (parsed.data.length === 0) return { error: "No rows to import" };

  const supabase = await createClient();
  const { error } = await supabase.from("properties").insert(
    parsed.data.map((p) => ({
      name: p.name,
      address: p.address || null,
      currency: p.currency,
    }))
  );

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { inserted: parsed.data.length };
}

export async function bulkImportBookings(rows: unknown[]): Promise<BulkResult> {
  const parsed = z.array(bookingSchema).safeParse(rows);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  if (parsed.data.length === 0) return { error: "No rows to import" };

  const supabase = await createClient();
  const { error } = await supabase.from("bookings").insert(
    parsed.data.map((b) => ({
      property_id: b.property_id,
      guest_name: b.guest_name,
      check_in: b.check_in,
      check_out: b.check_out,
      owner_share: b.owner_share,
      commission: b.commission,
      platform_fee: b.platform_fee,
      source: b.source,
      notes: b.notes || null,
    }))
  );

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { inserted: parsed.data.length };
}

export async function bulkImportExpenses(rows: unknown[]): Promise<BulkResult> {
  const parsed = z.array(expenseSchema).safeParse(rows);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  if (parsed.data.length === 0) return { error: "No rows to import" };

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert(
    parsed.data.map((e) => ({
      property_id: e.property_id,
      date: e.date,
      category: e.category,
      amount: e.amount,
      vendor: e.vendor || null,
      recurring: e.recurring,
      is_capital: e.is_capital,
      notes: e.notes || null,
    }))
  );

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { inserted: parsed.data.length };
}
