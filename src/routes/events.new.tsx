import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { BUDGET_CATEGORIES, EVENT_TYPES, type BudgetItem } from "@/lib/types";
import { inr, readFileAsDataUrl, uid } from "@/lib/format";

export const Route = createFileRoute("/events/new")({
  head: () => ({
    meta: [
      { title: "Create Event Proposal — EventFlow 360" },
      {
        name: "description",
        content:
          "Create a new institutional event proposal with metadata, poster upload and a detailed line-item budget breakdown.",
      },
      { property: "og:title", content: "Create Event Proposal — EventFlow 360" },
      {
        property: "og:description",
        content: "Draft a new event proposal with budget breakdown and submit it for approval.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <NewEventPage />
    </AppShell>
  ),
});

type Line = Pick<BudgetItem, "category" | "description" | "plannedAmount"> & { id: string };

function NewEventPage() {
  const { db, currentUser, update } = useStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Workshop",
    date: "",
    venue: "",
    departmentId: currentUser?.departmentId ?? db.departments[0]!.id,
    programId: "",
    academicYear: "2025-26",
    semester: "Semester 5",
    expectedParticipants: "",
    coordinator: currentUser?.name ?? "",
    plannedBudget: "",
  });
  const [poster, setPoster] = useState<{ url: string; name: string } | null>(null);
  const [lines, setLines] = useState<Line[]>([
    { id: uid(), category: "Venue", description: "", plannedAmount: 0 },
  ]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const programs = db.programs.filter((p) => p.departmentId === form.departmentId);
  const linesTotal = lines.reduce((s, l) => s + (Number(l.plannedAmount) || 0), 0);

  const validate = () => {
    const required: [string, string][] = [
      ["Event Title", form.title],
      ["Event Description", form.description],
      ["Event Date", form.date],
      ["Venue", form.venue],
      ["Program", form.programId],
      ["Expected Participants", form.expectedParticipants],
      ["Event Coordinator", form.coordinator],
      ["Budget", form.plannedBudget],
    ];
    const missing = required.filter(([, v]) => !String(v).trim()).map(([k]) => k);
    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return false;
    }
    return true;
  };

  const save = (submit: boolean) => {
    if (!validate()) return;
    setSaving(true);
    const id = "ev-" + uid();
    const now = new Date().toISOString();
    update((d) => {
      d.events.push({
        id,
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        date: form.date,
        venue: form.venue.trim(),
        departmentId: form.departmentId,
        programId: form.programId,
        academicYear: form.academicYear,
        semester: form.semester,
        expectedParticipants: Number(form.expectedParticipants) || 0,
        coordinator: form.coordinator.trim(),
        plannedBudget: Number(form.plannedBudget) || 0,
        posterUrl: poster?.url,
        posterName: poster?.name,
        status: submit ? "pending" : "draft",
        organizerId: currentUser!.id,
        createdAt: now,
        submittedAt: submit ? now : undefined,
      });
      for (const l of lines) {
        if (!l.description.trim() && !l.plannedAmount) continue;
        d.budgetItems.push({
          id: "bi-" + uid(),
          eventId: id,
          category: l.category,
          description: l.description.trim(),
          plannedAmount: Number(l.plannedAmount) || 0,
        });
      }
    });
    toast.success(submit ? "Proposal submitted for approval" : "Saved as draft");
    setSaving(false);
    navigate({ to: "/events/$id", params: { id } });
  };

  return (
    <>
      <PageHeader
        title="Create Event Proposal"
        description="Fill in the event metadata and plan your budget breakdown."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Event details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="AI & Machine Learning Workshop" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="desc">Event Description *</Label>
              <Textarea id="desc" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Purpose, target audience and structure of the event…" />
            </div>
            <div>
              <Label>Event Type / Category *</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Event Date *</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="venue">Venue *</Label>
              <Input id="venue" value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="CSE Seminar Hall" />
            </div>
            <div>
              <Label>Department *</Label>
              <Select
                value={form.departmentId}
                onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v, programId: "" }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {db.departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Program *</Label>
              <Select value={form.programId} onValueChange={(v) => set("programId", v)}>
                <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                <SelectContent>
                  {programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Academic Year *</Label>
              <Select value={form.academicYear} onValueChange={(v) => set("academicYear", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["2024-25", "2025-26", "2026-27"].map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Semester *</Label>
              <Select value={form.semester} onValueChange={(v) => set("semester", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <SelectItem key={s} value={`Semester ${s}`}>Semester {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="part">Expected Participants *</Label>
              <Input id="part" type="number" value={form.expectedParticipants} onChange={(e) => set("expectedParticipants", e.target.value)} placeholder="120" />
            </div>
            <div>
              <Label htmlFor="coord">Event Coordinator *</Label>
              <Input id="coord" value={form.coordinator} onChange={(e) => set("coordinator", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="budget">Total Planned Budget (₹) *</Label>
              <Input id="budget" type="number" value={form.plannedBudget} onChange={(e) => set("plannedBudget", e.target.value)} placeholder="50000" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="poster">Poster / Brochure</Label>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <Input
                  id="poster"
                  type="file"
                  accept="image/*,.pdf"
                  className="max-w-xs"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPoster({ url: await readFileAsDataUrl(file), name: file.name });
                    toast.success("Poster attached");
                  }}
                />
                {poster && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-success">
                    <Upload className="h-3.5 w-3.5" /> {poster.name}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Budget breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {lines.map((l, i) => (
              <div key={l.id} className="space-y-2 rounded-lg border border-border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <Select
                    value={l.category}
                    onValueChange={(v) =>
                      setLines((ls) => ls.map((x, j) => (j === i ? { ...x, category: v } : x)))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BUDGET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove line"
                    onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Input
                  placeholder="Description"
                  value={l.description}
                  onChange={(e) =>
                    setLines((ls) => ls.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))
                  }
                />
                <Input
                  type="number"
                  placeholder="Planned amount"
                  value={l.plannedAmount || ""}
                  onChange={(e) =>
                    setLines((ls) =>
                      ls.map((x, j) => (j === i ? { ...x, plannedAmount: Number(e.target.value) } : x)),
                    )
                  }
                />
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setLines((ls) => [...ls, { id: uid(), category: "Other", description: "", plannedAmount: 0 }])
              }
            >
              <Plus className="h-4 w-4" /> Add line item
            </Button>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm font-semibold">
              <span>Breakdown total</span>
              <span className="tabular-nums">{inr(linesTotal)}</span>
            </div>
            {Number(form.plannedBudget) > 0 && linesTotal > Number(form.plannedBudget) && (
              <p className="text-xs text-destructive">
                Breakdown exceeds the declared total budget by {inr(linesTotal - Number(form.plannedBudget))}.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" disabled={saving} onClick={() => save(false)}>
          Save as Draft
        </Button>
        <Button disabled={saving} onClick={() => save(true)}>
          Submit for Approval
        </Button>
      </div>
    </>
  );
}
