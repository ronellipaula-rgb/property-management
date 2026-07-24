import { z } from "zod";

export const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const bookingSchema = z
  .object({
    property_id: z.string().uuid("Select a property"),
    guest_name: z.string().min(1, "Guest name is required"),
    check_in: z.string().min(1, "Check-in date is required"),
    check_out: z.string().min(1, "Check-out date is required"),
    owner_share: z.coerce.number().min(0, "Must be 0 or more"),
    commission: z.coerce.number().min(0, "Must be 0 or more"),
    platform_fee: z.coerce.number().min(0, "Must be 0 or more"),
    source: z.enum(["airbnb", "booking_com", "direct"]),
    notes: z.string().optional(),
  })
  .refine((data) => data.check_out > data.check_in, {
    message: "Check-out must be after check-in",
    path: ["check_out"],
  });

export type BookingInput = z.infer<typeof bookingSchema>;

export const expenseSchema = z.object({
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
  is_capital: z.boolean(),
  notes: z.string().optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
