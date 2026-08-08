import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatCard } from "@/components/ui-bits";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { completion, departmentName, organizerName } from "@/lib/derive";

export const Route = createFileRoute("/documentation")({
  head: () => ({
    meta: [
      { title: "Documentation Tracker — EventFlow 360" },
      {
        name: "description",
        content: "Track documentation completion for every event: proposal, approval, budget, report, photos, feedback and press.",
      },
      { property: "og:title", content: "Documentation Tracker — EventFlow 360" },
      {
        property: "og:description",
        content: "See exactly which evidence is missing for each institutional event.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <DocumentationPage />
    </AppShell>
  ),
});

function DocumentationPage() {
  const { db } = useStore();
  const rows = db.events.map((e) => ({ e, c: completion(db, e) }));
  const complete = rows.filter((r) => r.c.complete).length;
  const avg = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.c.percent, 0) / rows.length)
    : 0;

  return (
    <>
      <PageHeader
        title="Documentation"
        description="Evidence completeness across all events, ready for audit and accreditation."
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Events tracked" value={rows.length} />
        <StatCard label="Fully documented" value={complete} tone="success" />
        <StatCard label="Incomplete" value={rows.length - complete} tone="warning" />
        <StatCard label="Average completion" value={`${avg}%`} tone="info" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {rows.map(({ e, c }) => (
          <Card key={e.id}>
            <CardContent className="p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{e.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {departmentName(db, e.departmentId)} · {e.academicYear} ·{" "}
                    {organizerName(db, e.organizerId)}
                  </p>
                </div>
                <StatusBadge status={e.status} />
              </div>

              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs font-medium">
                  <span>{c.done}/{c.total} items</span>
                  <span>{c.percent}%</span>
                </div>
                <Progress value={c.percent} className="h-2" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
                {c.list.map((i) => (
                  <span key={i.key} className="flex items-center gap-1.5">
                    {i.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className={i.done ? "" : "text-muted-foreground"}>{i.label}</span>
                  </span>
                ))}
              </div>

              <p className="mt-3 text-xs">
                {c.complete ? (
                  <span className="font-semibold text-success">✓ Documentation Complete</span>
                ) : (
                  <span className="text-warning">
                    Documentation Incomplete — missing: {c.missing.join(", ")}
                  </span>
                )}
              </p>

              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/events/$id" params={{ id: e.id }}>Open event</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
