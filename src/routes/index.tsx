import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarCheck, ShieldCheck, FileSearch, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { ROLE_LABEL, type Role } from "@/lib/types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EventFlow 360 — College Event Management & Documentation" },
      {
        name: "description",
        content:
          "EventFlow 360 manages the full college event lifecycle: proposal, budget, approval, execution, evidence and final event dossier.",
      },
      { property: "og:title", content: "EventFlow 360 — From Proposal to Final Dossier" },
      {
        property: "og:description",
        content:
          "Institutional event management: proposals, budgets, approvals, documentation tracking and printable event dossiers.",
      },
    ],
  }),
  component: LoginPage,
});

const ROLES: {
  role: Role;
  icon: typeof CalendarCheck;
  blurb: string;
  points: string[];
}[] = [
  {
    role: "organizer",
    icon: CalendarCheck,
    blurb: "Plan, run and document your events end to end.",
    points: [
      "Create & edit event proposals",
      "Budget breakdown and actual expenses",
      "Reports, photos, feedback & press",
      "Generate the final Event Dossier",
    ],
  },
  {
    role: "dean",
    icon: ShieldCheck,
    blurb: "Review proposals and take approval decisions.",
    points: [
      "Events awaiting your approval",
      "Full proposal and budget review",
      "Approve or reject with comments",
      "Track approved & completed events",
    ],
  },
  {
    role: "officer",
    icon: FileSearch,
    blurb: "Audit evidence and documentation completeness.",
    points: [
      "All events across departments",
      "Event-wise evidence & records",
      "Documentation completion tracking",
      "Verify and access dossiers",
    ],
  },
];

function LoginPage() {
  const { signIn, currentUser } = useStore();
  const navigate = useNavigate();

  const enter = (role: Role) => {
    signIn(role);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sidebar-primary text-base font-black text-sidebar-primary-foreground">
              EF
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black sm:text-2xl">EventFlow 360</h1>
              <p className="truncate text-xs text-sidebar-foreground/60 sm:text-sm">
                From Proposal to Final Dossier
              </p>
            </div>
          </div>
          {currentUser && (
            <Button variant="secondary" onClick={() => navigate({ to: "/dashboard" })}>
              Continue
            </Button>
          )}
        </header>

        <div className="mt-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-sidebar-primary">
            Institutional event lifecycle platform
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            One event. Complete lifecycle. One consolidated dossier.
          </h2>
          <p className="mt-4 text-sm text-sidebar-foreground/70 sm:text-base">
            Choose a role to sign in to the demo workspace. You can switch roles at any
            time from the top bar.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ROLES.map(({ role, icon: Icon, blurb, points }) => (
            <button
              key={role}
              onClick={() => enter(role)}
              className="group rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-6 text-left transition-colors hover:border-sidebar-primary hover:bg-sidebar-accent"
            >
              <Icon className="h-7 w-7 text-sidebar-primary" />
              <h3 className="mt-4 text-lg font-bold">{ROLE_LABEL[role]}</h3>
              <p className="mt-1 text-sm text-sidebar-foreground/70">{blurb}</p>
              <ul className="mt-4 space-y-1.5 text-xs text-sidebar-foreground/70">
                {points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-sidebar-primary">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-sidebar-primary">
                Sign in as this role
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
