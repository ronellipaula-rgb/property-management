"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import type { Expense, Property } from "@/lib/types";
import { createExpense, updateExpense } from "./actions";

const schema = z.object({
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

type FormValues = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

export function ExpenseForm({
  expense,
  properties,
  defaultPropertyId,
  onSuccess,
}: {
  expense?: Expense;
  properties: Property[];
  defaultPropertyId?: string;
  onSuccess: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      property_id: expense?.property_id ?? defaultPropertyId ?? properties[0]?.id ?? "",
      date: expense?.date ?? "",
      category: expense?.category ?? "utilities",
      amount: expense?.amount ?? 0,
      vendor: expense?.vendor ?? "",
      recurring: expense?.recurring ?? false,
      notes: expense?.notes ?? "",
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = expense
        ? await updateExpense(expense.id, values)
        : await createExpense(values);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(expense ? "Expense updated" : "Expense added");
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="property_id">Property</Label>
        <Controller
          control={control}
          name="property_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="property_id" className="w-full">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.property_id && (
          <p className="text-sm text-destructive">{errors.property_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" step="0.01" {...register("amount")} />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="vendor">Vendor</Label>
        <Input id="vendor" {...register("vendor")} />
      </div>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="recurring"
          render={({ field }) => (
            <Checkbox
              id="recurring"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          )}
        />
        <Label htmlFor="recurring">Recurring expense</Label>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...register("notes")} />
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
