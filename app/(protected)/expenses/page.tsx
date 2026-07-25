import { createClient } from "@/lib/supabase/server";
import { currentMonthKey, getMonthRange } from "@/lib/dates";
import { formatCurrency } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import type { Expense, ExpenseCategory, Property } from "@/lib/types";
import { MonthPicker } from "@/components/month-picker";
import { ExpenseCategoryIcon } from "@/lib/expense-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseDialog } from "./expense-dialog";
import { DeleteExpenseButton } from "./delete-expense-button";
import { CategoryFilter } from "./category-filter";

function categoryLabel(category: ExpenseCategory) {
  return EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; category?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? currentMonthKey();
  const category = params.category;
  const { start, end } = getMonthRange(month);

  const supabase = await createClient();

  const [{ data: properties }, expensesQuery] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: true })
      .returns<Property[]>(),
    (() => {
      let query = supabase
        .from("expenses")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false });
      if (category) {
        query = query.eq("category", category);
      }
      return query.returns<Expense[]>();
    })(),
  ]);

  const expenses = expensesQuery.data ?? [];
  const operatingTotal = expenses
    .filter((e) => !e.is_capital)
    .reduce((sum, e) => sum + e.amount, 0);
  const capitalTotal = expenses
    .filter((e) => e.is_capital)
    .reduce((sum, e) => sum + e.amount, 0);
  const propertyName = (id: string) =>
    properties?.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <div className="flex items-center gap-3">
          <MonthPicker month={month} />
          <CategoryFilter category={category} />
          <ExpenseDialog properties={properties ?? []} />
        </div>
      </div>

      {!properties?.length ? (
        <p className="text-muted-foreground">
          Add a property first before recording expenses.
        </p>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No expenses match this filter.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Recurring</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{propertyName(expense.property_id)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1.5">
                        <ExpenseCategoryIcon
                          category={expense.category}
                          className="size-3 text-primary"
                        />
                        {categoryLabel(expense.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>{expense.vendor || "—"}</TableCell>
                    <TableCell>{expense.recurring ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {expense.is_capital ? (
                        <Badge variant="outline">Capital</Badge>
                      ) : (
                        <span className="text-muted-foreground">Operating</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <ExpenseDialog
                          expense={expense}
                          properties={properties ?? []}
                        />
                        <DeleteExpenseButton id={expense.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot>
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-medium">
                    Operating total
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(operatingTotal)}
                  </TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-medium">
                    Capital total
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(capitalTotal)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </tfoot>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
