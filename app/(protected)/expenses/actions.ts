"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { expenseSchema, type ExpenseInput } from "@/lib/schemas";

interface ActionResult {
  error?: string;
}

export async function createExpense(input: ExpenseInput): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert({
    property_id: parsed.data.property_id,
    date: parsed.data.date,
    category: parsed.data.category,
    amount: parsed.data.amount,
    vendor: parsed.data.vendor || null,
    recurring: parsed.data.recurring,
    is_capital: parsed.data.is_capital,
    notes: parsed.data.notes || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function updateExpense(
  id: string,
  input: ExpenseInput
): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      property_id: parsed.data.property_id,
      date: parsed.data.date,
      category: parsed.data.category,
      amount: parsed.data.amount,
      vendor: parsed.data.vendor || null,
      recurring: parsed.data.recurring,
      is_capital: parsed.data.is_capital,
      notes: parsed.data.notes || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
