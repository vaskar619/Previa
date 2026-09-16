import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAssess } from "@/lib/clinical/store";

const FIELDS = [
  { key: "temperatureC", label: "Temperature", unit: "°C", min: 34, max: 42, step: 0.1, placeholder: "36.8" },
  { key: "heartRate", label: "Heart rate", unit: "bpm", min: 30, max: 220, step: 1, placeholder: "78" },
  { key: "sbp", label: "Systolic BP", unit: "mmHg", min: 60, max: 250, step: 1, placeholder: "122" },
  { key: "dbp", label: "Diastolic BP", unit: "mmHg", min: 30, max: 140, step: 1, placeholder: "78" },
  { key: "spo2", label: "Oxygen saturation", unit: "%", min: 50, max: 100, step: 1, placeholder: "98" },
  { key: "respRate", label: "Respiratory rate", unit: "/min", min: 6, max: 50, step: 1, placeholder: "16" },
] as const;

export function StepVitals() {
  const vitals = useAssess((s) => s.vitals);
  const setVitals = useAssess((s) => s.setVitals);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6">
        Optional but useful. Leave a field blank if it was not measured — the forest will use a
        typical resting prior rather than invent a reading.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const raw = vitals[f.key];
          return (
            <div key={f.key} className="grid gap-2">
              <Label htmlFor={f.key}>
                {f.label}{" "}
                <span className="text-muted-foreground font-normal">({f.unit})</span>
              </Label>
              <Input
                id={f.key}
                type="number"
                min={f.min}
                max={f.max}
                step={f.step}
                placeholder={f.placeholder}
                value={raw ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setVitals({ [f.key]: v === "" ? null : Number(v) });
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
