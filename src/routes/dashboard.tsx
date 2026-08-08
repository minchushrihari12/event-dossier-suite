import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  Wallet,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard, PageHeader, EmptyState } from "@/components/ui-bits";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { completion, departmentName, eventBudget } from "@/lib/derive";
import { fmtDate, inr } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EventFlow 360" },
      {
        name: "description",
        content:
          "Role-based dashboard with event statistics, budget analytics, documentation completion and pending tasks.",
      },
      { property: "og:title", content: "Dashboard — EventFlow 360" },
      {
        property: "og:description",
        content: "Event statistics, budget analytics and documentation completion at a glance.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <DashboardPage />
    </AppShell>
  ),
});

const COLORS = [
  "oklch(0.48 0.19 268)",
  "oklch(0.6 0.14 200)",
  "oklch(0.68 0.16 62)",
  "oklch(0.55 0.14 155)",
  "oklch(0.6 0.19 12)",
  "oklch(0.45 0.1 300)",
];

function DashboardPage() {
  const { db, currentUser } = useStore();
  const role = currentUser!.role;

  const stats = useMemo(() => {
    const events = db.events;
    const by = (s: string) => events.filter((e) => e.status === s).length;
    let planned = 0;
    let actual = 0;
    let over = 0;
    for (const ev of events) {
      const b = eventBudget(db, ev.id);
      planned += b.planned;
      actual += b.actual;
      if (b.hasActuals && b.overBudget) over += 1;
    }
    return {
      total: events.length,
      draft: by("draft"),
      pending: by("pending"),
      approved: by("approved"),
      completed: by("completed"),
      rejected: by("rejected"),
      planned,
      actual,
      savings: planned - actual,
      over,
    };
  }, [db]);

  const statusData = [
    { name: "Draft", value: stats.draft },
    { name: "Pending", value: stats.pending },
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
    { name: "Completed", value: stats.completed },
  ].filter((d) => d.value > 0);

  const deptData = db.departments
    .map((d) => ({
      name: d.code,
      events: db.events.filter((e) => e.departmentId === d.id).length,
    }))
    .filter((d) => d.events > 0);

  const typeData = Object.entries(
    db.events.reduce<Record<string, number>>((acc, e) => {
      acc[e.type] = (acc[e.type] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      map.set(d.toLocaleDateString("en-IN", { month: "short" }), 0);
    }
    for (const e of db.events) {
      const label = new Date(e.date).toLocaleDateString("en-IN", { month: "short" });
      if (map.has(label)) map.set(label, (map.get(label) ?? 0) + 1);
    }
    return [...map].map(([name, events]) => ({ name, events }));
  }, [db.events]);

  const budgetChart = db.events
    .map((e) => {
      const b = eventBudget(db, e.id);
      return {
        name: e.title.length > 16 ? e.title.slice(0, 16) + "…" : e.title,
        Planned: b.planned,
        Actual: b.actual,
      };
    })
    .filter((d) => d.Planned > 0);

  const awaiting = db.events.filter((e) => e.status === "pending");
  const upcoming = db.events
    .filter((e) => new Date(e.date) >= new Date() && e.status !== "rejected")
    .sort((a, b) => a.date.localeCompare(b.date));
  const incomplete = db.events.filter(
    (e) => e.status === "completed" && !completion(db, e).complete,
  );
  const recentlyCompleted = db.events
    .filter((e) => e.status === "completed")
    .sort((a, b) => (b.conductedAt ?? "").localeCompare(a.conductedAt ?? ""));
  const myDrafts = db.events.filter(
    (e) => e.status === "draft" && e.organizerId === currentUser!.id,
  );

  const headline =
    role === "organizer"
      ? "Organizer workspace"
      : role === "dean"
        ? "Approval workspace"
        : "Accreditation & audit workspace";

  return (
    <>
      <PageHeader
        title={`Welcome, ${currentUser!.name.split(" ").slice(-1)[0]}`}
        description={`${headline} · ${db.institution.name}`}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Events" value={stats.total} icon={CalendarDays} />
        <StatCard label="Draft" value={stats.draft} icon={FileEdit} />
        <StatCard label="Pending Approval" value={stats.pending} icon={Clock} tone="warning" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} tone="success" />
        <StatCard label="Completed" value={stats.completed} icon={Trophy} tone="info" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} tone="destructive" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Planned Budget" value={inr(stats.planned)} icon={Wallet} />
        <StatCard label="Total Actual Expense" value={inr(stats.actual)} icon={Wallet} tone="info" />
        <StatCard
          label="Total Savings"
          value={inr(stats.savings)}
          icon={TrendingDown}
          tone={stats.savings >= 0 ? "success" : "destructive"}
          hint={stats.savings >= 0 ? "Under budget overall" : "Over budget overall"}
        />
        <StatCard
          label="Over-budget Events"
          value={stats.over}
          icon={AlertTriangle}
          tone={stats.over ? "destructive" : "success"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Events by Status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Events by Department">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="events" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Events by Type">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={typeData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="name" width={100} fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS[1]} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Events">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="events" stroke={COLORS[0]} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Planned vs Actual Budget" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetChart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
              <Tooltip formatter={(v) => inr(Number(v))} />
              <Legend />
              <Bar dataKey="Planned" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="Actual" fill={COLORS[3]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <h2 className="mt-8 text-lg font-bold">My Tasks</h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        {role === "dean" && (
          <TaskList title="Awaiting My Approval" events={awaiting} db={db} />
        )}
        {role === "organizer" && <TaskList title="My Drafts" events={myDrafts} db={db} />}
        {role === "officer" && (
          <TaskList title="Documentation Incomplete" events={incomplete} db={db} showProgress />
        )}
        <TaskList title="Upcoming Events" events={upcoming} db={db} />
        {role !== "officer" && (
          <TaskList title="Incomplete Documentation" events={incomplete} db={db} showProgress />
        )}
        <TaskList title="Recently Completed" events={recentlyCompleted} db={db} />
      </div>
    </>
  );
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function TaskList({
  title,
  events,
  db,
  showProgress,
}: {
  title: string;
  events: import("@/lib/types").EventRecord[];
  db: import("@/lib/types").DB;
  showProgress?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {title}{" "}
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            ({events.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.length === 0 ? (
          <EmptyState title="Nothing here yet" />
        ) : (
          events.slice(0, 5).map((e) => {
            const c = completion(db, e);
            return (
              <Link
                key={e.id}
                to="/events/$id"
                params={{ id: e.id }}
                className="block rounded-lg border border-border p-3 transition-colors hover:bg-accent/40"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{e.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {departmentName(db, e.departmentId)} · {fmtDate(e.date)}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                {showProgress && (
                  <div className="mt-2">
                    <Progress value={c.percent} className="h-1.5" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.percent}% documented · missing {c.missing.length} item(s)
                    </p>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
