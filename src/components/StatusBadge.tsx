import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/derive";
import { cn } from "@/lib/utils";

const styles: Record<EventStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/12 text-destructive border-destructive/30",
  completed: "bg-info/15 text-info border-info/30",
};

export function StatusBadge({
  status,
  className,
}: {
  status: EventStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", styles[status], className)}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}
