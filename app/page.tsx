import Link from "next/link";
import { ArrowRight, CalendarRange, LineChart, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";

const FEATURES = [
  {
    icon: Building2,
    title: "Every property in one place",
    description:
      "Add each unit you manage, keep addresses and currency separate, all visible together.",
  },
  {
    icon: CalendarRange,
    title: "Bookings, split the right way",
    description:
      "Track your share, a co-host's commission, and platform fees separately for every stay.",
  },
  {
    icon: LineChart,
    title: "A clear monthly picture",
    description:
      "Accrual-based income, occupancy, and profit trends, so you always know where you stand.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          {user ? (
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 sm:py-24 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-6">
            <Badge
              variant="outline"
              className="w-fit border-primary/30 bg-primary/5 text-primary"
            >
              For property owners, not spreadsheets
            </Badge>
            <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Own your property&rsquo;s{" "}
              <span className="bg-gradient-to-r from-primary via-violet-600 to-primary bg-clip-text text-transparent">
                finances
              </span>
              .
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Track bookings, expenses, and mortgage-free profit for every unit you rent out —
              see exactly where your money goes each month.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="group" asChild>
                <Link href={user ? "/dashboard" : "/login"}>
                  {user ? "Go to Dashboard" : "Get started"}
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">See how it works</a>
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <Card className="card-hover mx-auto max-w-sm overflow-hidden">
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Net this month</p>
                  <div className="flex items-center gap-2">
                    <p className="font-heading text-3xl font-semibold text-success">
                      +$1,030
                    </p>
                    <Badge className="bg-success/10 text-success">On track</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Income</p>
                    <p className="font-medium">$1,250</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Expenses</p>
                    <p className="font-medium">$220</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Occupancy</p>
                    <p className="font-medium">45%</p>
                  </div>
                </div>
                <div className="h-24 rounded-lg bg-gradient-to-r from-primary/25 via-violet-400/20 to-success/20" />
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="features" className="border-t bg-secondary/40">
          <div className="mx-auto grid max-w-5xl gap-4 px-6 py-16 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="card-hover">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <p className="font-heading font-semibold">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto max-w-5xl px-6 text-sm text-muted-foreground">
          Property Manager
        </div>
      </footer>
    </div>
  );
}
