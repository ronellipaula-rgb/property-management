"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const expenseSchema = z.object({
  property_id: z.string().uuid("Select a property"),
  date: z.string().min(1, "Date is required"),
  category: z.enum([
    "utilities",
    "cleaning",
    "maintenance",
    "supplies",
    "insurance",
    "tax",
  ]),
  amount: z.coerce.number().min(0, "Must be 0 or more"),
  vendor: z.string().optional(),
  recurring: z.boolean(),
  notes: z.string().optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

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
