import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "@/lib/types";
import { PropertyDialog } from "./property-dialog";
import { DeletePropertyButton } from "./delete-property-button";

export default async function PropertiesPage() {
  const supabase = await createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<Property[]>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Properties</h1>
        <PropertyDialog />
      </div>

      {!properties?.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No properties yet. Add one to start tracking bookings and expenses.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle>{property.name}</CardTitle>
                <div className="flex gap-2">
                  <PropertyDialog property={property} />
                  <DeletePropertyButton id={property.id} name={property.name} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                {property.address && <p>{property.address}</p>}
                <p>Currency: {property.currency}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
