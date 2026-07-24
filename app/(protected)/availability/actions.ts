"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const availabilitySchema = z.object({
  property_id: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid month"),
  available_nights: z.coerce.number().int().min(0, "Must be 0 or more"),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;

interface ActionResult {
  error?: string;
}

export async function upsertAvailability(
  input: AvailabilityInput
): Promise<ActionResult> {
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("availability")
    .upsert(
      {
        property_id: parsed.data.property_id,
        month: parsed.data.month,
        available_nights: parsed.data.available_nights,
      },
      { onConflict: "property_id,month" }
    );

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
