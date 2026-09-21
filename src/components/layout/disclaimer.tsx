import { ShieldAlert } from "lucide-react";
import { useT } from "@/lib/i18n";

export function ClinicalDisclaimer({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  return (
    <aside
      className="rounded-lg border-2 border-primary/30 bg-teal-soft/50 px-4 py-3 text-sm leading-relaxed text-foreground"
      role="note"
    >
      <p className="flex items-start gap-2 font-bold">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>{t("discTitle")}</span>
      </p>
      {!compact ? <p className="mt-2 pl-6 text-muted-foreground">{t("discBody")}</p> : null}
    </aside>
  );
}
