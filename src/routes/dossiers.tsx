import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { departmentName } from "@/lib/derive";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/dossiers")({
  head: () => ({
    meta: [
      { title: "Event Dossiers — EventFlow 360" },
      {
        name: "description",
        content: "Repository of generated event dossiers consolidating proposal, approval, budget, evidence and outcomes.",
      },
      { property: "og:title", content: "Event Dossiers — EventFlow 360" },
      {
        property: "og:description",
        content: "Browse and open printable consolidated event dossiers.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <DossiersPage />
    </AppShell>
  ),
});

function DossiersPage() {
  const { db } = useStore();
  const items = db.dossiers
    .map((d) => ({ d, e: db.events.find((x) => x.id === d.eventId) }))
    .filter((x) => x.e);

  return (
    <>
      <PageHeader title="Event Dossiers" description="Generated consolidated event records." />
      {items.length === 0 ? (
        <EmptyState
          title="No dossiers generated yet"
          description="Complete an event's documentation, then generate its dossier."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ d, e }) => (
            <Card key={d.id}>
              <CardContent className="p-5">
                <FileText className="h-6 w-6 text-primary" />
                <p className="mt-3 truncate font-bold">{e!.title}</p>
                <p className="text-xs text-muted-foreground">
                  {departmentName(db, e!.departmentId)} · {e!.academicYear}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Generated {fmtDateTime(d.generatedAt)} by {d.generatedBy}
                </p>
                <Button className="mt-4 w-full" asChild>
                  <Link to="/dossier/$id" params={{ id: e!.id }}>Open dossier</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
