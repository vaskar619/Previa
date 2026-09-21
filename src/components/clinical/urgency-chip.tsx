import { AlertTriangle, Clock, Home, Stethoscope, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Urgency } from "@/lib/clinical/types";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ICONS = {
  emergency: Siren,
  urgent: AlertTriangle,
  soon: Clock,
  routine: Stethoscope,
  "self-care": Home,
} as const;

const KEY: Record<Urgency, string> = {
  emergency: "emergency",
  urgent: "urgent",
  soon: "soon",
  routine: "routine",
  "self-care": "selfcare",
};

export function urgencyVariant(u: Urgency) {
  if (u === "emergency") return "emergency" as const;
  if (u === "urgent") return "urgent" as const;
  if (u === "soon") return "soon" as const;
  if (u === "self-care") return "ok" as const;
  return "soon" as const;
}

export function UrgencyChip({ urgency, className }: { urgency: Urgency; className?: string }) {
  const { t } = useT();
  const Icon = ICONS[urgency];
  return (
    <Badge
      variant={urgencyVariant(urgency)}
      className={cn("gap-1 border font-semibold", className)}
    >
      <Icon className="size-3" aria-hidden />
      <span>{t(KEY[urgency])}</span>
    </Badge>
  );
}
