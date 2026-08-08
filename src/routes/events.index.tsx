import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { completion, departmentName, eventBudget, organizerName, programName } from "@/lib/derive";
import { EVENT_TYPES } from "@/lib/types";
import { fmtDate, inr } from "@/lib/format";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — EventFlow 360" },
      {
        name: "description",
        content:
          "Search, filter and sort every institutional event by status, department, type, academic year and budget.",
      },
      { property: "og:title", content: "Events — EventFlow 360" },
      {
        property: "og:description",
        content: "Search and filter all institutional events across departments and academic years.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <EventsPage />
    </AppShell>
  ),
});

const ALL = "all";

function EventsPage() {
  const { db, currentUser } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const [dept, setDept] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [sem, setSem] = useState(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minB, setMinB] = useState("");
  const [maxB, setMaxB] = useState("");
  const [sort, setSort] = useState("newest");

  const years = [...new Set(db.events.map((e) => e.academicYear))];
  const sems = [...new Set(db.events.map((e) => e.semester))];

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = db.events.filter((e) => {
      const hay = [
        e.title,
        organizerName(db, e.organizerId),
        e.coordinator,
        departmentName(db, e.departmentId),
        programName(db, e.programId),
        e.type,
        e.venue,
      ]
        .join(" ")
        .toLowerCase();
      if (term && !hay.includes(term)) return false;
      if (status !== ALL && e.status !== status) return false;
      if (dept !== ALL && e.departmentId !== dept) return false;
      if (type !== ALL && e.type !== type) return false;
      if (year !== ALL && e.academicYear !== year) return false;
      if (sem !== ALL && e.semester !== sem) return false;
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      const budget = eventBudget(db, e.id).planned;
      if (minB && budget < Number(minB)) return false;
      if (maxB && budget > Number(maxB)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      const ba = eventBudget(db, a.id).planned;
      const bb = eventBudget(db, b.id).planned;
      return sort === "budget-desc" ? bb - ba : ba - bb;
    });
    return list;
  }, [db, q, status, dept, type, year, sem, from, to, minB, maxB, sort]);

  const reset = () => {
    setQ("");
    setStatus(ALL);
    setDept(ALL);
    setType(ALL);
    setYear(ALL);
    setSem(ALL);
    setFrom("");
    setTo("");
    setMinB("");
    setMaxB("");
    setSort("newest");
  };

  return (
    <>
      <PageHeader
        title="Events"
        description={`${rows.length} of ${db.events.length} events`}
        action={
          currentUser?.role === "organizer" ? (
            <Button asChild>
              <Link to="/events/new">
                <Plus className="h-4 w-4" /> New Proposal
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Card className="mb-5">
        <CardContent className="space-y-4 p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by event, organizer, department, program, type or venue…"
              className="pl-9"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Filter label="Status" value={status} onChange={setStatus} options={[
              ["draft", "Draft"],
              ["pending", "Pending Approval"],
              ["approved", "Approved"],
              ["rejected", "Rejected"],
              ["completed", "Completed"],
            ]} />
            <Filter
              label="Department"
              value={dept}
              onChange={setDept}
              options={db.departments.map((d) => [d.id, d.name] as [string, string])}
            />
            <Filter
              label="Event Type"
              value={type}
              onChange={setType}
              options={EVENT_TYPES.map((t) => [t, t] as [string, string])}
            />
            <Filter
              label="Academic Year"
              value={year}
              onChange={setYear}
              options={years.map((y) => [y, y] as [string, string])}
            />
            <Filter
              label="Semester"
              value={sem}
              onChange={setSem}
              options={sems.map((s) => [s, s] as [string, string])}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field label="From">
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </Field>
              <Field label="To">
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Min ₹">
                <Input type="number" value={minB} onChange={(e) => setMinB(e.target.value)} placeholder="0" />
              </Field>
              <Field label="Max ₹">
                <Input type="number" value={maxB} onChange={(e) => setMaxB(e.target.value)} placeholder="Any" />
              </Field>
            </div>
            <Field label="Sort by">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="budget-desc">Highest Budget</SelectItem>
                  <SelectItem value="budget-asc">Lowest Budget</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear filters
          </Button>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="No events match your filters"
          description="Try clearing filters or searching for something else."
        />
      ) : (
        <>
          <Card className="hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead>Docs</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e) => {
                  const c = completion(db, e);
                  return (
                    <TableRow key={e.id} className="cursor-pointer">
                      <TableCell className="max-w-[280px]">
                        <Link to="/events/$id" params={{ id: e.id }} className="block">
                          <p className="truncate font-semibold">{e.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {e.type} · {e.venue}
                          </p>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{departmentName(db, e.departmentId)}</TableCell>
                      <TableCell className="text-sm">{fmtDate(e.date)}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {inr(eventBudget(db, e.id).planned)}
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <Progress value={c.percent} className="h-1.5" />
                        <span className="text-xs text-muted-foreground">{c.percent}%</span>
                      </TableCell>
                      <TableCell><StatusBadge status={e.status} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          <div className="grid gap-3 md:hidden">
            {rows.map((e) => {
              const c = completion(db, e);
              return (
                <Link key={e.id} to="/events/$id" params={{ id: e.id }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <p className="min-w-0 truncate font-semibold">{e.title}</p>
                        <StatusBadge status={e.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {departmentName(db, e.departmentId)} · {fmtDate(e.date)}
                      </p>
                      <p className="mt-2 text-sm font-semibold">
                        {inr(eventBudget(db, e.id).planned)}
                      </p>
                      <Progress value={c.percent} className="mt-2 h-1.5" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map(([v, l]) => (
            <SelectItem key={v} value={v}>{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
