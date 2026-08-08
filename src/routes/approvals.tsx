import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { departmentName, eventBudget, organizerName } from "@/lib/derive";
import { fmtDate, fmtDateTime, inr } from "@/lib/format";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — EventFlow 360" },
      {
        name: "description",
        content: "Review event proposals awaiting Dean/HOD approval with full budget and metadata.",
      },
      { property: "og:title", content: "Approvals — EventFlow 360" },
      {
        property: "og:description",
        content: "Approve or reject event proposals with comments and timestamps.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ApprovalsPage />
    </AppShell>
  ),
});

function ApprovalsPage() {
  const { db } = useStore();
  const awaiting = db.events.filter((e) => e.status === "pending");
  const decided = db.events.filter((e) => e.status === "approved" || e.status === "rejected" || e.status === "completed");

  return (
    <>
      <PageHeader title="Approvals" description="Proposals submitted for your decision." />
      <h2 className="mb-3 text-base font-bold">Awaiting My Approval ({awaiting.length})</h2>
      {awaiting.length === 0 ? (
        <EmptyState title="Nothing awaiting approval" description="All submitted proposals have been decided." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {awaiting.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 truncate text-base font-bold">{e.title}</p>
                  <StatusBadge status={e.status} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <Row k="Organizer" v={organizerName(db, e.organizerId)} />
                  <Row k="Department" v={departmentName(db, e.departmentId)} />
                  <Row k="Date" v={fmtDate(e.date)} />
                  <Row k="Venue" v={e.venue} />
                  <Row k="Budget" v={inr(eventBudget(db, e.id).planned)} />
                  <Row k="Submitted" v={fmtDateTime(e.submittedAt)} />
                </dl>
                <Button className="mt-4" asChild>
                  <Link to="/events/$id" params={{ id: e.id }}>Open proposal & decide</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-8 text-base font-bold">Decided events ({decided.length})</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {decided.map((e) => (
          <Link key={e.id} to="/events/$id" params={{ id: e.id }}>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <p className="min-w-0 truncate font-semibold">{e.title}</p>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {departmentName(db, e.departmentId)} · {fmtDate(e.date)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
      <dd className="truncate font-medium">{v}</dd>
    </div>
  );
}
