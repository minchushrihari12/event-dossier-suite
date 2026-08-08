import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Wallet,
  ClipboardCheck,
  FileText,
  PlusCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { ROLE_LABEL, type Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["organizer", "dean", "officer"] },
  { to: "/events", label: "Events", icon: CalendarDays, roles: ["organizer", "dean", "officer"] },
  { to: "/events/new", label: "Create Proposal", icon: PlusCircle, roles: ["organizer"] },
  { to: "/approvals", label: "Approvals", icon: CheckSquare, roles: ["dean"] },
  { to: "/budget", label: "Budget", icon: Wallet, roles: ["organizer", "dean", "officer"] },
  { to: "/documentation", label: "Documentation", icon: ClipboardCheck, roles: ["organizer", "officer"] },
  { to: "/dossiers", label: "Event Dossiers", icon: FileText, roles: ["organizer", "dean", "officer"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { currentUser, signIn, signOut, ready } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !currentUser) navigate({ to: "/" });
  }, [ready, currentUser, navigate]);

  if (!currentUser) return null;

  const items = NAV.filter((n) => n.roles.includes(currentUser.role));

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sm font-black text-sidebar-primary-foreground">
          EF
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">EventFlow 360</p>
          <p className="truncate text-[11px] text-sidebar-foreground/60">
            From Proposal to Final Dossier
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active =
            pathname === item.to ||
            (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4 text-[11px] text-sidebar-foreground/60">
        Institutional Event Documentation System
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 w-64">{sidebar}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{currentUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser.designation}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Select
              value={currentUser.role}
              onValueChange={(v) => {
                signIn(v as Role);
                navigate({ to: "/dashboard" });
              }}
            >
              <SelectTrigger className="w-[150px] sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              aria-label="Sign out"
              onClick={() => {
                signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
