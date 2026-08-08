import type { DB, EventRecord, EventStatus } from "./types";

export const STATUS_LABEL: Record<EventStatus, string> = {
  draft: "Draft",
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

export interface Checklist {
  key: string;
  label: string;
  done: boolean;
}

export function eventBudget(db: DB, eventId: string) {
  const items = db.budgetItems.filter((b) => b.eventId === eventId);
  const expenses = db.expenses.filter((x) => x.eventId === eventId);
  const ev = db.events.find((e) => e.id === eventId);
  const itemsPlanned = items.reduce((s, b) => s + b.plannedAmount, 0);
  const planned = itemsPlanned || ev?.plannedBudget || 0;
  const actual = expenses.reduce((s, x) => s + x.actualAmount, 0);
  const difference = planned - actual;
  const utilization = planned > 0 ? (actual / planned) * 100 : 0;
  return {
    items,
    expenses,
    planned,
    actual,
    difference,
    utilization,
    overBudget: actual > planned,
    hasActuals: expenses.length > 0,
  };
}

export function checklist(db: DB, ev: EventRecord): Checklist[] {
  const has = <T,>(arr: T[]) => arr.length > 0;
  const photos = db.photos.filter((p) => p.eventId === ev.id);
  return [
    { key: "proposal", label: "Proposal", done: Boolean(ev.title && ev.description) },
    { key: "poster", label: "Poster / Brochure", done: Boolean(ev.posterUrl) },
    {
      key: "approval",
      label: "Approval",
      done: db.approvals.some((a) => a.eventId === ev.id && a.decision === "approved"),
    },
    {
      key: "budget",
      label: "Budget Breakdown",
      done: has(db.budgetItems.filter((b) => b.eventId === ev.id)),
    },
    {
      key: "report",
      label: "Post-event Report",
      done: db.reports.some((r) => r.eventId === ev.id),
    },
    { key: "photos", label: "Normal Photos", done: photos.some((p) => !p.geoTagged) },
    { key: "geo", label: "Geo-tagged Photos", done: photos.some((p) => p.geoTagged) },
    {
      key: "feedback",
      label: "Feedback",
      done: db.feedback.some((f) => f.eventId === ev.id),
    },
    {
      key: "press",
      label: "Press Clipping",
      done: has(db.press.filter((p) => p.eventId === ev.id)),
    },
    {
      key: "expenses",
      label: "Actual Expenses",
      done: has(db.expenses.filter((x) => x.eventId === ev.id)),
    },
  ];
}

export function completion(db: DB, ev: EventRecord) {
  const list = checklist(db, ev);
  const done = list.filter((c) => c.done).length;
  return {
    list,
    done,
    total: list.length,
    percent: Math.round((done / list.length) * 100),
    missing: list.filter((c) => !c.done).map((c) => c.label),
    complete: done === list.length,
  };
}

export function departmentName(db: DB, id: string) {
  return db.departments.find((d) => d.id === id)?.name ?? "—";
}
export function programName(db: DB, id: string) {
  return db.programs.find((p) => p.id === id)?.name ?? "—";
}
export function organizerName(db: DB, id: string) {
  return db.users.find((u) => u.id === id)?.name ?? "—";
}

export function timeline(db: DB, ev: EventRecord) {
  const approval = db.approvals
    .filter((a) => a.eventId === ev.id)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  const report = db.reports.find((r) => r.eventId === ev.id);
  const photos = db.photos.filter((p) => p.eventId === ev.id);
  return [
    { label: "Proposal Created", at: ev.createdAt, done: true },
    { label: "Submitted for Approval", at: ev.submittedAt, done: Boolean(ev.submittedAt) },
    {
      label: approval?.decision === "rejected" ? "Rejected" : "Approved",
      at: approval?.timestamp,
      done: Boolean(approval),
    },
    { label: "Event Conducted", at: ev.conductedAt, done: Boolean(ev.conductedAt) },
    { label: "Report Uploaded", at: report?.updatedAt, done: Boolean(report) },
    { label: "Evidence Uploaded", at: photos[0]?.uploadedAt, done: photos.length > 0 },
    {
      label: "Dossier Generated",
      at: ev.dossierGeneratedAt,
      done: Boolean(ev.dossierGeneratedAt),
    },
  ];
}
