import { ShieldAlert } from "lucide-react";

export function ClinicalDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className="rounded-lg border-2 border-primary/30 bg-teal-soft/50 px-4 py-3 text-sm leading-relaxed text-foreground"
      role="note"
    >
      <p className="flex items-start gap-2 font-bold">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>Not a diagnosis. Not a prescription. Not a substitute for a clinician.</span>
      </p>
      {!compact ? (
        <p className="mt-2 pl-6 text-muted-foreground">
          PREVIA ranks look-alike conditions from the symptoms you enter so you can have a clearer
          conversation with a doctor or nurse. Only a licensed clinician can examine you, order
          tests, and decide treatment. If something feels like an emergency, get in-person help
          now.
        </p>
      ) : null}
    </aside>
  );
}
