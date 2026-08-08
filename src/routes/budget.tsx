import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatCard } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { departmentName, eventBudget } from "@/lib/derive";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Budget Analytics — EventFlow 360" },
      {
        name: "description",
        content: "Planned versus actual budget analytics, utilisation and savings across all institutional events.",
      },
      { property: "og:title", content: "Budget Analytics — EventFlow 360" },
      {
        property: "og:description",
        content: "Track planned vs actual spend, savings and over-budget events.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <BudgetPage />
    </AppShell>
  ),
});

function BudgetPage() {
  const { db } = useStore();
  const rows = db.events.map((e) => {
    const b = eventBudget(db, e.id);
    return { event: e, ...b };
  });
  const planned = rows.reduce((s, r) => s + r.planned, 0);
  const actual = rows.reduce((s, r) => s + r.actual, 0);
  const over = rows.filter((r) => r.hasActuals && r.overBudget).length;

  const chart = rows
    .filter((r) => r.planned > 0)
    .map((r) => ({
      name: r.event.title.length > 14 ? r.event.title.slice(0, 14) + "…" : r.event.title,
      Planned: r.planned,
      Actual: r.actual,
    }));

  return (
    <>
      <PageHeader title="Budget" description="Institution-wide planned vs actual spend." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Planned" value={inr(planned)} />
        <StatCard label="Total Actual" value={inr(actual)} tone="info" />
        <StatCard
          label="Savings"
          value={inr(planned - actual)}
          tone={planned - actual >= 0 ? "success" : "destructive"}
        />
        <StatCard label="Over-budget Events" value={over} tone={over ? "destructive" : "success"} />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Planned vs Actual by event</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
              <Tooltip formatter={(v) => inr(Number(v))} />
              <Legend />
              <Bar dataKey="Planned" fill="oklch(0.48 0.19 268)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Actual" fill="oklch(0.55 0.14 155)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <Link key={r.event.id} to="/events/$id" params={{ id: r.event.id }}>
            <Card>
              <CardContent className="p-4">
                <p className="truncate font-semibold">{r.event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {departmentName(db, r.event.departmentId)}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span>{inr(r.actual)} / {inr(r.planned)}</span>
                  <span className={r.overBudget ? "text-destructive" : "text-success"}>
                    {r.utilization.toFixed(0)}%
                  </span>
                </div>
                <Progress value={Math.min(r.utilization, 100)} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
