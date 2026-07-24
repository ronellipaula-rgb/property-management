"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Expense, Property } from "@/lib/types";
import { ExpenseForm } from "./expense-form";

export function ExpenseDialog({
  expense,
  properties,
  defaultPropertyId,
}: {
  expense?: Expense;
  properties: Property[];
  defaultPropertyId?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {expense ? (
          <Button variant="outline" size="icon-sm">
            <Pencil />
          </Button>
        ) : (
          <Button disabled={properties.length === 0}>
            <Plus /> Add expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit expense" : "Add expense"}</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          expense={expense}
          properties={properties}
          defaultPropertyId={defaultPropertyId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
