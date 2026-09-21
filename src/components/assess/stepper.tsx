import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function Stepper({ step }: { step: number }) {
  const { t } = useT();
  const STEPS = [t("stepYou"), t("stepVitals"), t("stepSymptoms"), t("stepTiming"), t("stepReview")];

  return (
    <ol className="flex flex-wrap gap-2" aria-label={t("navCheck")}>
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full text-xs font-medium tabular-nums",
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                  ? "bg-teal-soft text-primary"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {i + 1}
          </span>
          <span
            className={cn(
              "hidden text-sm sm:inline",
              i === step ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
