import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Plus,
  Trash2,
  XCircle,
  Send,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/ui-bits";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import {
  completion,
  departmentName,
  eventBudget,
  organizerName,
  programName,
  timeline,
} from "@/lib/derive";
import { BUDGET_CATEGORIES, type EventRecord } from "@/lib/types";
import { fmtDate, fmtDateTime, inr, readFileAsDataUrl, uid } from "@/lib/format";

export const Route = createFileRoute("/events/$id")({
  head: () => ({
    meta: [
      { title: "Event 360 — EventFlow 360" },
      {
        name: "description",
        content:
          "Complete event view: proposal, budget, approval, execution, report, photos, feedback, press coverage and dossier.",
      },
      { property: "og:title", content: "Event 360 — EventFlow 360" },
      {
        property: "og:description",
        content: "The full lifecycle record of a single institutional event in one place.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <EventDetail />
    </AppShell>
  ),
});

function EventDetail() {
  const { id } = Route.useParams();
  const { db, currentUser, update } = useStore();
  const navigate = useNavigate();
  const ev = db.events.find((e) => e.id === id);

  if (!ev) {
    return (
      <EmptyState title="Event not found" description="It may have been removed or reset." />
    );
  }

  const role = currentUser!.role;
  const isOrganizer = role === "organizer";
  const comp = completion(db, ev);
  const budget = eventBudget(db, ev.id);
  const steps = timeline(db, ev);

  const patch = (fn: (e: EventRecord) => void) =>
    update((d) => {
      const target = d.events.find((x) => x.id === id);
      if (target) fn(target);
    });

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-3" onClick={() => navigate({ to: "/events" })}>
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Button>

      <Card className="mb-5">
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-black sm:text-2xl">{ev.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {fmtDate(ev.date)} · {ev.venue} · {departmentName(db, ev.departmentId)} ·{" "}
                {organizerName(db, ev.organizerId)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <StatusBadge status={ev.status} />
              {ev.verified && (
                <Badge variant="outline" className="border-success/30 bg-success/12 text-success">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {comp.list.map((c) => (
              <span
                key={c.key}
                className={
                  "rounded-full border px-3 py-1 text-xs font-medium " +
                  (c.done
                    ? "border-success/30 bg-success/12 text-success"
                    : "border-border bg-muted text-muted-foreground")
                }
              >
                {c.done ? "✓" : "○"} {c.label}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs font-medium">
              <span>Documentation completion</span>
              <span>{comp.percent}%</span>
            </div>
            <Progress value={comp.percent} className="h-2" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {isOrganizer && ev.status === "draft" && (
              <Button
                onClick={() => {
                  patch((e) => {
                    e.status = "pending";
                    e.submittedAt = new Date().toISOString();
                  });
                  toast.success("Submitted for Dean/HOD approval");
                }}
              >
                <Send className="h-4 w-4" /> Submit for Approval
              </Button>
            )}
            {isOrganizer && ev.status === "approved" && (
              <Button
                onClick={() => {
                  patch((e) => {
                    e.status = "completed";
                    e.conductedAt = new Date().toISOString();
                  });
                  toast.success("Event marked as conducted");
                }}
              >
                <CheckCircle2 className="h-4 w-4" /> Mark as Conducted
              </Button>
            )}
            {role === "officer" && (
              <Button
                variant="outline"
                onClick={() => {
                  patch((e) => {
                    e.verified = !e.verified;
                  });
                  toast.success(ev.verified ? "Verification removed" : "Event evidence verified");
                }}
              >
                <ShieldCheck className="h-4 w-4" />
                {ev.verified ? "Remove verification" : "Mark as verified"}
              </Button>
            )}
            {ev.dossierGeneratedAt && (
              <Button variant="outline" asChild>
                <Link to="/dossier/$id" params={{ id: ev.id }}>
                  <FileText className="h-4 w-4" /> View Dossier
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader><CardTitle className="text-base">Lifecycle timeline</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-4 border-l border-border pl-5">
            {steps.map((s) => (
              <li key={s.label} className="relative">
                <span
                  className={
                    "absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 " +
                    (s.done ? "border-success bg-success" : "border-border bg-background")
                  }
                />
                <p className={"text-sm font-medium " + (s.done ? "" : "text-muted-foreground")}>
                  {s.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.done ? fmtDateTime(s.at) : "Pending"}
                </p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            {[
              ["overview", "Overview"],
              ["proposal", "Proposal"],
              ["budget", "Budget"],
              ["approval", "Approval"],
              ["execution", "Execution"],
              ["report", "Post-Event Report"],
              ["photos", "Photos"],
              ["feedback", "Feedback"],
              ["press", "Press Coverage"],
              ["dossier", "Dossier"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v!}>{l}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Event metadata</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Meta label="Event Type" value={ev.type} />
                <Meta label="Date" value={fmtDate(ev.date)} />
                <Meta label="Venue" value={ev.venue} />
                <Meta label="Department" value={departmentName(db, ev.departmentId)} />
                <Meta label="Program" value={programName(db, ev.programId)} />
                <Meta label="Academic Year" value={ev.academicYear} />
                <Meta label="Semester" value={ev.semester} />
                <Meta label="Expected Participants" value={String(ev.expectedParticipants)} />
                <Meta label="Coordinator" value={ev.coordinator} />
                <Meta label="Planned Budget" value={inr(budget.planned)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Documentation checklist</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {comp.list.map((c) => (
                  <div key={c.key} className="flex items-center gap-2 text-sm">
                    {c.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={c.done ? "" : "text-muted-foreground"}>{c.label}</span>
                  </div>
                ))}
                <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                  {comp.complete ? (
                    <span className="font-semibold text-success">✓ Documentation Complete</span>
                  ) : (
                    <>
                      <span className="font-semibold text-warning">Documentation Incomplete</span>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Missing: {comp.missing.join(", ")}
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="proposal" className="mt-4">
          <ProposalTab ev={ev} editable={isOrganizer && ev.status === "draft"} />
        </TabsContent>

        <TabsContent value="budget" className="mt-4">
          <BudgetTab ev={ev} editable={isOrganizer} />
        </TabsContent>

        <TabsContent value="approval" className="mt-4">
          <ApprovalTab ev={ev} />
        </TabsContent>

        <TabsContent value="execution" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Execution</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Meta label="Status" value={ev.status} />
              <Meta label="Conducted On" value={ev.conductedAt ? fmtDateTime(ev.conductedAt) : "Not yet conducted"} />
              {isOrganizer && ev.status === "approved" && (
                <Button
                  onClick={() => {
                    patch((e) => {
                      e.status = "completed";
                      e.conductedAt = new Date().toISOString();
                    });
                    toast.success("Event marked as conducted");
                  }}
                >
                  Mark as Conducted
                </Button>
              )}
              {ev.status === "draft" && (
                <p className="text-muted-foreground">
                  The event must be approved before it can be marked as conducted.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <ReportTab ev={ev} editable={isOrganizer} />
        </TabsContent>

        <TabsContent value="photos" className="mt-4">
          <PhotosTab ev={ev} editable={isOrganizer} />
        </TabsContent>

        <TabsContent value="feedback" className="mt-4">
          <FeedbackTab ev={ev} editable={isOrganizer} />
        </TabsContent>

        <TabsContent value="press" className="mt-4">
          <PressTab ev={ev} editable={isOrganizer} />
        </TabsContent>

        <TabsContent value="dossier" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Event Dossier</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Progress value={comp.percent} className="h-2" />
              <p className="text-sm">
                Documentation {comp.percent}% complete ({comp.done}/{comp.total} items).
              </p>
              {!comp.complete && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
                  <p className="font-semibold text-warning">Documentation Incomplete</p>
                  <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                    {comp.missing.map((m) => <li key={m}>{m}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link to="/dossier/$id" params={{ id: ev.id }}>Preview Dossier</Link>
                </Button>
                <Button
                  disabled={!comp.complete}
                  onClick={() => {
                    update((d) => {
                      const target = d.events.find((x) => x.id === id);
                      if (target) target.dossierGeneratedAt = new Date().toISOString();
                      d.dossiers = d.dossiers.filter((x) => x.eventId !== id);
                      d.dossiers.push({
                        id: "ds-" + uid(),
                        eventId: id,
                        generatedAt: new Date().toISOString(),
                        generatedBy: currentUser!.name,
                      });
                    });
                    toast.success("Event Dossier generated");
                    navigate({ to: "/dossier/$id", params: { id } });
                  }}
                >
                  <FileText className="h-4 w-4" /> Generate Event Dossier
                </Button>
              </div>
              {ev.dossierGeneratedAt && (
                <p className="text-xs text-muted-foreground">
                  Last generated {fmtDateTime(ev.dossierGeneratedAt)}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 break-words text-sm font-medium">{value}</p>
    </div>
  );
}

function ProposalTab({ ev, editable }: { ev: EventRecord; editable: boolean }) {
  const { update } = useStore();
  const [desc, setDesc] = useState(ev.description);
  const [venue, setVenue] = useState(ev.venue);
  const [date, setDate] = useState(ev.date);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">Proposal narrative</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {editable ? (
            <>
              <Label>Description</Label>
              <Textarea rows={6} value={desc} onChange={(e) => setDesc(e.target.value)} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>Venue</Label>
                  <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={() => {
                  update((d) => {
                    const t = d.events.find((x) => x.id === ev.id);
                    if (t) {
                      t.description = desc;
                      t.venue = venue;
                      t.date = date;
                    }
                  });
                  toast.success("Draft updated");
                }}
              >
                Save changes
              </Button>
            </>
          ) : (
            <p className="whitespace-pre-line text-sm leading-relaxed">{ev.description}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Poster / Brochure</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {ev.posterUrl ? (
            <img
              src={ev.posterUrl}
              alt={`Poster for ${ev.title}`}
              className="w-full rounded-lg border border-border object-cover"
            />
          ) : (
            <EmptyState title="No poster uploaded" />
          )}
          {editable && (
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await readFileAsDataUrl(file);
                update((d) => {
                  const t = d.events.find((x) => x.id === ev.id);
                  if (t) {
                    t.posterUrl = url;
                    t.posterName = file.name;
                  }
                });
                toast.success("Poster uploaded");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BudgetTab({ ev, editable }: { ev: EventRecord; editable: boolean }) {
  const { db, update } = useStore();
  const b = eventBudget(db, ev.id);
  const [line, setLine] = useState({ category: "Venue", description: "", plannedAmount: "" });
  const [exp, setExp] = useState({
    category: "Venue",
    description: "",
    plannedAmount: "",
    actualAmount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const chart = BUDGET_CATEGORIES.map((c) => ({
    name: c,
    Planned: b.items.filter((i) => i.category === c).reduce((s, i) => s + i.plannedAmount, 0),
    Actual: b.expenses.filter((i) => i.category === c).reduce((s, i) => s + i.actualAmount, 0),
  })).filter((r) => r.Planned || r.Actual);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SmallStat label="Total Planned" value={inr(b.planned)} />
        <SmallStat label="Total Actual" value={inr(b.actual)} />
        <SmallStat
          label="Difference"
          value={inr(Math.abs(b.difference))}
          tone={b.overBudget ? "bad" : "good"}
          hint={b.overBudget ? "Over budget" : "Saved"}
        />
        <SmallStat
          label="Utilization"
          value={`${b.utilization.toFixed(1)}%`}
          tone={b.overBudget ? "bad" : "good"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Planned budget breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {b.items.length === 0 && <EmptyState title="No budget lines yet" />}
            {b.items.map((i) => (
              <div key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{i.category}</p>
                  <p className="truncate text-xs text-muted-foreground">{i.description || "—"}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{inr(i.plannedAmount)}</span>
                {editable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete line"
                    onClick={() => {
                      update((d) => {
                        d.budgetItems = d.budgetItems.filter((x) => x.id !== i.id);
                      });
                      toast.success("Budget line removed");
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            {editable && (
              <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                <Select value={line.category} onValueChange={(v) => setLine((l) => ({ ...l, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BUDGET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Description" value={line.description} onChange={(e) => setLine((l) => ({ ...l, description: e.target.value }))} />
                <Input type="number" placeholder="Planned amount" value={line.plannedAmount} onChange={(e) => setLine((l) => ({ ...l, plannedAmount: e.target.value }))} />
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!line.plannedAmount) { toast.error("Enter a planned amount"); return; }
                    update((d) => {
                      d.budgetItems.push({
                        id: "bi-" + uid(),
                        eventId: ev.id,
                        category: line.category,
                        description: line.description,
                        plannedAmount: Number(line.plannedAmount),
                      });
                    });
                    setLine({ category: "Venue", description: "", plannedAmount: "" });
                    toast.success("Budget line added");
                  }}
                >
                  <Plus className="h-4 w-4" /> Add budget line
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Actual expenses</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {b.expenses.length === 0 && <EmptyState title="No expenses recorded" />}
            {b.expenses.map((x) => (
              <div key={x.id} className="rounded-lg border border-border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{x.category}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {x.description || "—"} · {fmtDate(x.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">{inr(x.actualAmount)}</p>
                    <p className={"text-xs " + (x.actualAmount > x.plannedAmount ? "text-destructive" : "text-success")}>
                      planned {inr(x.plannedAmount)}
                    </p>
                  </div>
                </div>
                {editable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-destructive"
                    onClick={() => {
                      update((d) => {
                        d.expenses = d.expenses.filter((y) => y.id !== x.id);
                      });
                      toast.success("Expense removed");
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {editable && (
              <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                <Select value={exp.category} onValueChange={(v) => setExp((l) => ({ ...l, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BUDGET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Description" value={exp.description} onChange={(e) => setExp((l) => ({ ...l, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Planned" value={exp.plannedAmount} onChange={(e) => setExp((l) => ({ ...l, plannedAmount: e.target.value }))} />
                  <Input type="number" placeholder="Actual" value={exp.actualAmount} onChange={(e) => setExp((l) => ({ ...l, actualAmount: e.target.value }))} />
                </div>
                <Input type="date" value={exp.date} onChange={(e) => setExp((l) => ({ ...l, date: e.target.value }))} />
                <Label className="text-xs text-muted-foreground">Receipt (optional)</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  id={`receipt-${ev.id}`}
                />
                <Button
                  className="w-full"
                  onClick={async () => {
                    if (!exp.actualAmount) { toast.error("Enter the actual amount"); return; }
                    const input = document.getElementById(`receipt-${ev.id}`) as HTMLInputElement | null;
                    const file = input?.files?.[0];
                    const url = file ? await readFileAsDataUrl(file) : undefined;
                    update((d) => {
                      d.expenses.push({
                        id: "ex-" + uid(),
                        eventId: ev.id,
                        category: exp.category,
                        description: exp.description,
                        plannedAmount: Number(exp.plannedAmount) || 0,
                        actualAmount: Number(exp.actualAmount),
                        date: exp.date,
                        receiptUrl: url,
                        receiptName: file?.name,
                      });
                    });
                    if (input) input.value = "";
                    setExp({ ...exp, description: "", plannedAmount: "", actualAmount: "" });
                    toast.success("Expense recorded");
                  }}
                >
                  <Plus className="h-4 w-4" /> Record expense
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {chart.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Planned vs Actual by category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
      )}
    </div>
  );
}

function SmallStat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad";
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p
          className={
            "mt-1 text-xl font-black tabular-nums " +
            (tone === "bad" ? "text-destructive" : tone === "good" ? "text-success" : "")
          }
        >
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function ApprovalTab({ ev }: { ev: EventRecord }) {
  const { db, currentUser, update } = useStore();
  const [comment, setComment] = useState("");
  const approvals = db.approvals.filter((a) => a.eventId === ev.id);
  const isDean = currentUser!.role === "dean";

  const decide = (decision: "approved" | "rejected") => {
    if (!comment.trim()) { toast.error("Please add a comment before deciding"); return; }
    update((d) => {
      d.approvals.push({
        id: "ap-" + uid(),
        eventId: ev.id,
        decision,
        approverName: currentUser!.name,
        approverRole: currentUser!.designation,
        comment: comment.trim(),
        timestamp: new Date().toISOString(),
      });
      const t = d.events.find((x) => x.id === ev.id);
      if (t) t.status = decision;
    });
    setComment("");
    toast.success(decision === "approved" ? "Event approved" : "Event rejected");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Approval history</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {approvals.length === 0 && <EmptyState title="No approval decision yet" />}
          {approvals.map((a) => (
            <div key={a.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    a.decision === "approved"
                      ? "border-success/30 bg-success/12 text-success"
                      : "border-destructive/30 bg-destructive/12 text-destructive"
                  }
                >
                  {a.decision === "approved" ? "Approved" : "Rejected"}
                </Badge>
                <span className="text-xs text-muted-foreground">{fmtDateTime(a.timestamp)}</span>
              </div>
              <p className="mt-2 text-sm font-medium">{a.approverName}</p>
              <p className="text-xs text-muted-foreground">{a.approverRole}</p>
              <p className="mt-2 text-sm">{a.comment}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {isDean && ev.status === "pending" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Your decision</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Label>Comment</Label>
            <Textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add your review remarks…" />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => decide("approved")}>
                <CheckCircle2 className="h-4 w-4" /> Approve
              </Button>
              <Button variant="destructive" onClick={() => decide("rejected")}>
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReportTab({ ev, editable }: { ev: EventRecord; editable: boolean }) {
  const { db, update } = useStore();
  const existing = db.reports.find((r) => r.eventId === ev.id);
  const [f, setF] = useState({
    description: existing?.description ?? "",
    outcomes: existing?.outcomes ?? "",
    participants: String(existing?.participants ?? ""),
    highlights: existing?.highlights ?? "",
    achievements: existing?.achievements ?? "",
    challenges: existing?.challenges ?? "",
    conclusion: existing?.conclusion ?? "",
  });

  if (!editable) {
    if (!existing) return <EmptyState title="No post-event report submitted" />;
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Post-event report</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Meta label="Participants" value={String(existing.participants)} />
          <Section title="Description" body={existing.description} />
          <Section title="Outcomes Achieved" body={existing.outcomes} />
          <Section title="Key Highlights" body={existing.highlights} />
          <Section title="Achievements" body={existing.achievements} />
          <Section title="Challenges" body={existing.challenges} />
          <Section title="Conclusion" body={existing.conclusion} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Post-event report</CardTitle></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Event Description</Label>
          <Textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Label>Outcomes Achieved</Label>
          <Textarea rows={3} value={f.outcomes} onChange={(e) => setF({ ...f, outcomes: e.target.value })} />
        </div>
        <div>
          <Label>Number of Participants</Label>
          <Input type="number" value={f.participants} onChange={(e) => setF({ ...f, participants: e.target.value })} />
        </div>
        <div>
          <Label>Key Highlights</Label>
          <Input value={f.highlights} onChange={(e) => setF({ ...f, highlights: e.target.value })} />
        </div>
        <div>
          <Label>Achievements</Label>
          <Textarea rows={2} value={f.achievements} onChange={(e) => setF({ ...f, achievements: e.target.value })} />
        </div>
        <div>
          <Label>Challenges</Label>
          <Textarea rows={2} value={f.challenges} onChange={(e) => setF({ ...f, challenges: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Label>Conclusion</Label>
          <Textarea rows={2} value={f.conclusion} onChange={(e) => setF({ ...f, conclusion: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Button
            onClick={() => {
              if (!f.description.trim()) { toast.error("Report description is required"); return; }
              update((d) => {
                d.reports = d.reports.filter((r) => r.eventId !== ev.id);
                d.reports.push({
                  eventId: ev.id,
                  description: f.description,
                  outcomes: f.outcomes,
                  participants: Number(f.participants) || 0,
                  highlights: f.highlights,
                  achievements: f.achievements,
                  challenges: f.challenges,
                  conclusion: f.conclusion,
                  updatedAt: new Date().toISOString(),
                });
              });
              toast.success("Post-event report saved");
            }}
          >
            Save report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 whitespace-pre-line leading-relaxed">{body}</p>
    </div>
  );
}

function PhotosTab({ ev, editable }: { ev: EventRecord; editable: boolean }) {
  const { db, update } = useStore();
  const photos = db.photos.filter((p) => p.eventId === ev.id);
  const [caption, setCaption] = useState("");
  const [geo, setGeo] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  return (
    <div className="space-y-4">
      {editable && (
        <Card>
          <CardHeader><CardTitle className="text-base">Upload photographs</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Caption</Label>
              <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Inauguration by the Chief Guest" />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox id="geo" checked={geo} onCheckedChange={(v) => setGeo(Boolean(v))} />
              <Label htmlFor="geo">Geo-tagged photograph</Label>
            </div>
            {geo && (
              <>
                <div>
                  <Label>Latitude</Label>
                  <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="13.0827" />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="77.5877" />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.geolocation?.getCurrentPosition(
                        (pos) => {
                          setLat(pos.coords.latitude.toFixed(6));
                          setLng(pos.coords.longitude.toFixed(6));
                          toast.success("Location captured");
                        },
                        () => toast.error("Could not read device location"),
                      );
                    }}
                  >
                    <MapPin className="h-4 w-4" /> Use my location
                  </Button>
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <Label>Photograph file(s)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = [...(e.target.files ?? [])];
                  if (!files.length) return;
                  if (geo && (!lat || !lng)) {
                    toast.error("Enter latitude and longitude for geo-tagged photos");
                    return;
                  }
                  const urls = await Promise.all(files.map(readFileAsDataUrl));
                  update((d) => {
                    urls.forEach((url, i) => {
                      d.photos.push({
                        id: "ph-" + uid(),
                        eventId: ev.id,
                        url,
                        caption: caption || files[i]!.name,
                        geoTagged: geo,
                        latitude: geo ? Number(lat) : undefined,
                        longitude: geo ? Number(lng) : undefined,
                        uploadedAt: new Date().toISOString(),
                      });
                    });
                  });
                  e.target.value = "";
                  setCaption("");
                  toast.success(`${files.length} photo(s) uploaded`);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {photos.length === 0 ? (
        <EmptyState title="No photographs uploaded yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <Card key={p.id} className="overflow-hidden pt-0">
              <img src={p.url} alt={p.caption} className="h-44 w-full object-cover" loading="lazy" />
              <CardContent className="p-4">
                <p className="truncate text-sm font-semibold">{p.caption}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{p.geoTagged ? "Geo-tagged" : "Normal"}</Badge>
                  {p.geoTagged && (
                    <a
                      className="inline-flex items-center gap-1 text-xs text-primary underline"
                      href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin className="h-3 w-3" />
                      {p.latitude?.toFixed(4)}, {p.longitude?.toFixed(4)}
                    </a>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{fmtDate(p.uploadedAt)}</p>
                {editable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-destructive"
                    onClick={() => {
                      update((d) => {
                        d.photos = d.photos.filter((x) => x.id !== p.id);
                      });
                      toast.success("Photo removed");
                    }}
                  >
                    Remove
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackTab({ ev, editable }: { ev: EventRecord; editable: boolean }) {
  const { db, update } = useStore();
  const fb = db.feedback.find((f) => f.eventId === ev.id);
  const [f, setF] = useState({
    responses: String(fb?.responses ?? ""),
    averageRating: String(fb?.averageRating ?? ""),
    satisfaction: String(fb?.satisfaction ?? ""),
    content: String(fb?.content ?? ""),
    organization: String(fb?.organization ?? ""),
    venue: String(fb?.venue ?? ""),
    experience: String(fb?.experience ?? ""),
    summary: fb?.summary ?? "",
  });

  const chart = fb
    ? [
        { name: "Content", rating: fb.content },
        { name: "Organization", rating: fb.organization },
        { name: "Venue", rating: fb.venue },
        { name: "Experience", rating: fb.experience },
      ]
    : [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Feedback metrics</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {fb ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <SmallStat label="Responses" value={String(fb.responses)} />
                <SmallStat label="Avg Rating" value={`${fb.averageRating} / 5`} />
                <SmallStat label="Satisfaction" value={`${fb.satisfaction}%`} tone="good" />
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis domain={[0, 5]} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="oklch(0.48 0.19 268)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <Section title="Summary" body={fb.summary} />
            </>
          ) : (
            <EmptyState title="No feedback recorded yet" />
          )}
        </CardContent>
      </Card>

      {editable && (
        <Card>
          <CardHeader><CardTitle className="text-base">Record feedback</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {([
              ["responses", "Number of responses"],
              ["averageRating", "Average rating (0-5)"],
              ["satisfaction", "Satisfaction %"],
              ["content", "Content rating"],
              ["organization", "Organization rating"],
              ["venue", "Venue rating"],
              ["experience", "Experience rating"],
            ] as const).map(([k, label]) => (
              <div key={k}>
                <Label>{label}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={f[k]}
                  onChange={(e) => setF({ ...f, [k]: e.target.value })}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <Label>Feedback summary</Label>
              <Textarea rows={3} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Button
                onClick={() => {
                  if (!f.responses || !f.averageRating)
                    { toast.error("Responses and average rating are required"); return; }
                  update((d) => {
                    d.feedback = d.feedback.filter((x) => x.eventId !== ev.id);
                    d.feedback.push({
                      eventId: ev.id,
                      responses: Number(f.responses),
                      averageRating: Number(f.averageRating),
                      satisfaction: Number(f.satisfaction) || 0,
                      content: Number(f.content) || 0,
                      organization: Number(f.organization) || 0,
                      venue: Number(f.venue) || 0,
                      experience: Number(f.experience) || 0,
                      summary: f.summary,
                    });
                  });
                  toast.success("Feedback saved");
                }}
              >
                Save feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PressTab({ ev, editable }: { ev: EventRecord; editable: boolean }) {
  const { db, update } = useStore();
  const items = db.press.filter((p) => p.eventId === ev.id);
  const [f, setF] = useState({
    title: "",
    source: "",
    publicationDate: new Date().toISOString().slice(0, 10),
    kind: "Newspaper Clipping",
    link: "",
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Press &amp; news coverage</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && <EmptyState title="No press coverage added" />}
          {items.map((p) => (
            <div key={p.id} className="rounded-lg border border-border p-3">
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-xs text-muted-foreground">
                {p.source} · {p.kind} · {fmtDate(p.publicationDate)}
              </p>
              {p.fileUrl && (
                <img src={p.fileUrl} alt={p.title} className="mt-2 max-h-48 rounded-md border border-border object-cover" />
              )}
              {p.link && (
                <a className="mt-1 inline-block text-xs text-primary underline" href={p.link} target="_blank" rel="noreferrer">
                  Open source link
                </a>
              )}
              {editable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-destructive"
                  onClick={() => {
                    update((d) => {
                      d.press = d.press.filter((x) => x.id !== p.id);
                    });
                    toast.success("Clipping removed");
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {editable && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add clipping</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            </div>
            <div>
              <Label>Source</Label>
              <Input value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} placeholder="The Bengaluru Chronicle" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Publication Date</Label>
                <Input type="date" value={f.publicationDate} onChange={(e) => setF({ ...f, publicationDate: e.target.value })} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={f.kind} onValueChange={(v) => setF({ ...f, kind: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Newspaper Clipping", "Magazine Clipping", "Press Report", "News Article", "External News Link"].map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>External link</Label>
              <Input value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://…" />
            </div>
            <div>
              <Label>Upload clipping</Label>
              <Input type="file" accept="image/*,.pdf" id={`press-${ev.id}`} />
            </div>
            <Button
              onClick={async () => {
                if (!f.title.trim() || !f.source.trim())
                  { toast.error("Title and source are required"); return; }
                const input = document.getElementById(`press-${ev.id}`) as HTMLInputElement | null;
                const file = input?.files?.[0];
                const url = file ? await readFileAsDataUrl(file) : undefined;
                update((d) => {
                  d.press.push({
                    id: "pr-" + uid(),
                    eventId: ev.id,
                    title: f.title,
                    source: f.source,
                    publicationDate: f.publicationDate,
                    kind: f.kind,
                    link: f.link || undefined,
                    fileUrl: url,
                    fileName: file?.name,
                  });
                });
                if (input) input.value = "";
                setF({ ...f, title: "", source: "", link: "" });
                toast.success("Press clipping added");
              }}
            >
              <Plus className="h-4 w-4" /> Add clipping
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
