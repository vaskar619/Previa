import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAssess } from "@/lib/clinical/store";
import { cn } from "@/lib/utils";

export function StepCourse() {
  const context = useAssess((s) => s.context);
  const setContext = useAssess((s) => s.setContext);

  return (
    <div className="grid gap-8">
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <Label>How long have the main symptoms been present?</Label>
          <span className="text-sm tabular-nums text-muted-foreground">
            {context.durationDays < 1
              ? "Hours"
              : context.durationDays === 1
                ? "1 day"
                : `${context.durationDays} days`}
          </span>
        </div>
        <Slider
          min={0}
          max={30}
          step={1}
          value={[Math.min(30, context.durationDays)]}
          onValueChange={([durationDays]) => setContext({ durationDays })}
        />
        <p className="mt-2 text-xs text-muted-foreground">0 = started in the last few hours. 30 = a month or longer.</p>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <Label>How severe is it, right now?</Label>
          <span className="text-sm tabular-nums text-muted-foreground">{context.severity} / 10</span>
        </div>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[context.severity]}
          onValueChange={([severity]) => setContext({ severity })}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Onset</p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["sudden", "Sudden — minutes to an hour"],
              ["gradual", "Gradual"],
              ["unknown", "Not sure"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setContext({ onset: id })}
              className={cn(
                "h-11 rounded-md border px-4 text-sm",
                context.onset === id
                  ? "border-primary bg-teal-soft text-primary"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setContext({ progressing: !context.progressing })}
        className={cn(
          "flex h-12 items-center justify-between rounded-lg border px-4 text-sm",
          context.progressing ? "border-primary bg-teal-soft text-primary" : "border-border bg-card",
        )}
      >
        <span>Getting worse over the last few hours</span>
        <span className="text-xs uppercase tracking-wider">{context.progressing ? "Yes" : "No"}</span>
      </button>
    </div>
  );
}
