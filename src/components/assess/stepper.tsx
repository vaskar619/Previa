import { cn } from "@/lib/utils";

const STEPS = ["You", "Vitals", "Symptoms", "Timing", "Review"] as const;

export function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Symptom check steps">
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
