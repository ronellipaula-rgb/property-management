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
import type { Property } from "@/lib/types";
import { PropertyForm } from "./property-form";

export function PropertyDialog({ property }: { property?: Property }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {property ? (
          <Button variant="outline" size="icon-sm">
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus /> Add property
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{property ? "Edit property" : "Add property"}</DialogTitle>
        </DialogHeader>
        <PropertyForm property={property} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
