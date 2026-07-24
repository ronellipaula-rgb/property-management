"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
});

export type PropertyInput = z.infer<typeof propertySchema>;

interface ActionResult {
  error?: string;
}

export async function createProperty(input: PropertyInput): Promise<ActionResult> {
  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("properties").insert({
    name: parsed.data.name,
    address: parsed.data.address || null,
    currency: parsed.data.currency,
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function updateProperty(
  id: string,
  input: PropertyInput
): Promise<ActionResult> {
  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      name: parsed.data.name,
      address: parsed.data.address || null,
      currency: parsed.data.currency,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
