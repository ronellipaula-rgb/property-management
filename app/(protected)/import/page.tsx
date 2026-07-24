import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Property } from "@/lib/types";
import { PropertiesImportTab } from "./properties-import-tab";
import { BookingsImportTab } from "./bookings-import-tab";
import { ExpensesImportTab } from "./expenses-import-tab";

export default async function ImportPage() {
  const supabase = await createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<Property[]>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Import</h1>
        <p className="text-muted-foreground">
          Bulk-import data from a CSV spreadsheet.
        </p>
      </div>
      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="properties">
          <PropertiesImportTab />
        </TabsContent>
        <TabsContent value="bookings">
          <BookingsImportTab properties={properties ?? []} />
        </TabsContent>
        <TabsContent value="expenses">
          <ExpensesImportTab properties={properties ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
