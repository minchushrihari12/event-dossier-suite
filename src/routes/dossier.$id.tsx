import { createFileRoute } from "@tanstack/react-router";
import { Printer, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { completion, departmentName, eventBudget, organizerName, programName } from "@/lib/derive";
import { fmtDate, fmtDateTime, inr } from "@/lib/format";

export const Route = createFileRoute("/dossier/$id")({
  head: () => ({
    meta: [
      { title: "Event Dossier — EventFlow 360" },
      {
        name: "description",
        content: "Printable institutional event dossier consolidating proposal, approval, budget, evidence, feedback and press coverage.",
      },
      { property: "og:title", content: "Event Dossier — EventFlow 360" },
      {
        property: "og:description",
        content: "A complete, printable consolidated record of one institutional event.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <DossierPage />
    </AppShell>
  ),
});

function DossierPage() {
  const { id } = Route.useParams();
  const { db } = useStore();
  const navigate = useNavigate();
  const ev = db.events.find((e) => e.id === id);
  if (!ev) return <EmptyState title="Event not found" />;

  const b = eventBudget(db, ev.id);
  const report = db.reports.find((r) => r.eventId === ev.id);
  const fb = db.feedback.find((f) => f.eventId === ev.id);
  const photos = db.photos.filter((p) => p.eventId === ev.id);
  const press = db.press.filter((p) => p.eventId === ev.id);
  const approval = db.approvals
    .filter((a) => a.eventId === ev.id)
    .sort((a, x) => x.timestamp.localeCompare(a.timestamp))[0];
  const comp = completion(db, ev);

  return (
    <>
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/events/$id", params: { id } })}>
          <ArrowLeft className="h-4 w-4" /> Back to event
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Generate PDF / Print
        </Button>
      </div>

      <article className="mx-auto max-w-4xl bg-card p-8 font-serif text-card-foreground shadow-sm sm:p-12">
        <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-b-2 border-foreground pb-5">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-foreground text-lg font-black">
            {db.institution.logoText}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">{db.institution.name}</h1>
            <p className="text-xs text-muted-foreground">{db.institution.address}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest">
              Event Documentation Dossier · {ev.academicYear}
            </p>
          </div>
        </header>

        <div className="mt-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Event Dossier</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{ev.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {fmtDate(ev.date)} · {ev.venue}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Generated on {fmtDateTime(ev.dossierGeneratedAt ?? new Date().toISOString())} ·
            Documentation {comp.percent}% complete
          </p>
        </div>

        <Sec n={1} title="Event Metadata">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <D k="Event Type" v={ev.type} />
            <D k="Department" v={departmentName(db, ev.departmentId)} />
            <D k="Program" v={programName(db, ev.programId)} />
            <D k="Academic Year" v={ev.academicYear} />
            <D k="Semester" v={ev.semester} />
            <D k="Venue" v={ev.venue} />
            <D k="Coordinator" v={ev.coordinator} />
            <D k="Organizer" v={organizerName(db, ev.organizerId)} />
            <D k="Expected Participants" v={String(ev.expectedParticipants)} />
            <D k="Actual Participants" v={report ? String(report.participants) : "—"} />
          </dl>
        </Sec>

        <Sec n={2} title="Event Proposal">
          <p className="whitespace-pre-line text-sm leading-relaxed">{ev.description}</p>
        </Sec>

        {ev.posterUrl && (
          <Sec n={3} title="Event Poster / Brochure">
            <img src={ev.posterUrl} alt={`Poster for ${ev.title}`} className="max-h-96 rounded border border-border" />
          </Sec>
        )}

        <Sec n={4} title="Approval Details">
          {approval ? (
            <div className="text-sm">
              <p><strong>Decision:</strong> {approval.decision === "approved" ? "Approved" : "Rejected"}</p>
              <p><strong>Approver:</strong> {approval.approverName} ({approval.approverRole})</p>
              <p><strong>Timestamp:</strong> {fmtDateTime(approval.timestamp)}</p>
              <p className="mt-2"><strong>Comments:</strong> {approval.comment}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No approval record.</p>
          )}
        </Sec>

        <Sec n={5} title="Budget Summary & Breakdown">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-foreground text-left">
                <th className="py-1.5">Category</th>
                <th className="py-1.5">Description</th>
                <th className="py-1.5 text-right">Planned</th>
                <th className="py-1.5 text-right">Actual</th>
              </tr>
            </thead>
            <tbody>
              {b.items.map((i) => {
                const actual = b.expenses
                  .filter((x) => x.category === i.category)
                  .reduce((s, x) => s + x.actualAmount, 0);
                return (
                  <tr key={i.id} className="border-b border-border">
                    <td className="py-1.5">{i.category}</td>
                    <td className="py-1.5">{i.description || "—"}</td>
                    <td className="py-1.5 text-right tabular-nums">{inr(i.plannedAmount)}</td>
                    <td className="py-1.5 text-right tabular-nums">{actual ? inr(actual) : "—"}</td>
                  </tr>
                );
              })}
              <tr className="font-bold">
                <td className="py-2" colSpan={2}>Total</td>
                <td className="py-2 text-right tabular-nums">{inr(b.planned)}</td>
                <td className="py-2 text-right tabular-nums">{inr(b.actual)}</td>
              </tr>
            </tbody>
          </table>
          <p className={"mt-3 text-sm font-semibold " + (b.overBudget ? "text-destructive" : "text-success")}>
            {b.overBudget ? "Over budget by " : "Savings of "}
            {inr(Math.abs(b.difference))} · Utilisation {b.utilization.toFixed(1)}%
          </p>
        </Sec>

        {report && (
          <Sec n={6} title="Post-Event Report">
            <div className="space-y-3 text-sm leading-relaxed">
              <P t="Description" v={report.description} />
              <P t="Outcomes Achieved" v={report.outcomes} />
              <P t="Key Highlights" v={report.highlights} />
              <P t="Achievements" v={report.achievements} />
              <P t="Challenges" v={report.challenges} />
              <P t="Conclusion" v={report.conclusion} />
            </div>
          </Sec>
        )}

        {photos.length > 0 && (
          <Sec n={7} title="Photo Gallery & Geo-tagged Evidence">
            <div className="grid grid-cols-2 gap-3">
              {photos.map((p) => (
                <figure key={p.id}>
                  <img src={p.url} alt={p.caption} className="h-40 w-full rounded border border-border object-cover" />
                  <figcaption className="mt-1 text-xs text-muted-foreground">
                    {p.caption}
                    {p.geoTagged && ` · ${p.latitude?.toFixed(4)}, ${p.longitude?.toFixed(4)}`}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Sec>
        )}

        {fb && (
          <Sec n={8} title="Feedback Metrics">
            <p className="text-sm">
              Overall Rating: <strong>{fb.averageRating} / 5</strong> · {fb.responses} responses ·{" "}
              {fb.satisfaction}% satisfaction
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-1 text-sm">
              <li>Content: {fb.content}</li>
              <li>Organization: {fb.organization}</li>
              <li>Venue: {fb.venue}</li>
              <li>Experience: {fb.experience}</li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">{fb.summary}</p>
          </Sec>
        )}

        {press.length > 0 && (
          <Sec n={9} title="Press / News Coverage">
            <ul className="space-y-2 text-sm">
              {press.map((p) => (
                <li key={p.id}>
                  <strong>{p.title}</strong> — {p.source}, {fmtDate(p.publicationDate)} ({p.kind})
                  {p.link && <span className="block break-all text-xs text-muted-foreground">{p.link}</span>}
                </li>
              ))}
            </ul>
          </Sec>
        )}

        <Sec n={10} title="Final Event Summary">
          <p className="text-sm leading-relaxed">
            {ev.title} was organised by {departmentName(db, ev.departmentId)} on {fmtDate(ev.date)} at{" "}
            {ev.venue} under the coordination of {ev.coordinator}. The event was
            {approval?.decision === "approved" ? " duly approved" : " processed"} by{" "}
            {approval?.approverName ?? "the competent authority"} and recorded
            {report ? ` ${report.participants} participants` : " participation as planned"}, with a total
            expenditure of {inr(b.actual)} against a planned budget of {inr(b.planned)}.
          </p>
        </Sec>

        <footer className="mt-10 border-t-2 border-foreground pt-4 text-center text-xs text-muted-foreground">
          <p>{db.institution.name} · Event Dossier · {ev.title} · {ev.academicYear}</p>
          <p className="mt-1">Page 1 · Generated by EventFlow 360 on {fmtDate(new Date().toISOString())}</p>
        </footer>
      </article>
    </>
  );
}

function Sec({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="mb-3 border-b border-border pb-1 text-sm font-bold uppercase tracking-wide">
        {n}. {title}
      </h3>
      {children}
    </section>
  );
}

function D({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}

function P({ t, v }: { t: string; v: string }) {
  if (!v) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t}</p>
      <p className="whitespace-pre-line">{v}</p>
    </div>
  );
}
