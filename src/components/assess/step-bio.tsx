import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMORBIDITY_OPTIONS } from "@/lib/clinical/labels";
import { bmiOf } from "@/lib/clinical/features";
import { useAssess } from "@/lib/clinical/store";
import type { ComorbidityId, Sex } from "@/lib/clinical/types";
import { cn } from "@/lib/utils";

export function StepBio() {
  const bio = useAssess((s) => s.bio);
  const setBio = useAssess((s) => s.setBio);
  const bmi = bmiOf(bio.heightCm, bio.weightKg);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Age (years)" htmlFor="age">
          <Input
            id="age"
            type="number"
            min={0}
            max={120}
            value={bio.age}
            onChange={(e) => setBio({ age: Number(e.target.value) })}
          />
        </Field>
        <Field label="Height (cm)" htmlFor="height">
          <Input
            id="height"
            type="number"
            min={40}
            max={220}
            value={bio.heightCm}
            onChange={(e) => setBio({ heightCm: Number(e.target.value) })}
          />
        </Field>
        <Field label="Weight (kg)" htmlFor="weight">
          <Input
            id="weight"
            type="number"
            min={3}
            max={300}
            value={bio.weightKg}
            onChange={(e) => setBio({ weightKg: Number(e.target.value) })}
          />
        </Field>
      </div>
      <p className="text-sm text-muted-foreground">
        Body-mass index{" "}
        <span className="tabular-nums font-medium text-foreground">{bmi.toFixed(1)}</span>
      </p>

      <div>
        <p className="text-sm font-medium mb-2">Sex recorded at intake</p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["female", "Female"],
              ["male", "Male"],
              ["other", "Other / unspecified"],
            ] as [Sex, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setBio({ sex: id, pregnant: id === "female" ? bio.pregnant : false })}
              className={cn(
                "h-11 rounded-md px-4 text-sm border transition-colors",
                bio.sex === id
                  ? "border-primary bg-teal-soft text-primary"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle
          label="Currently pregnant"
          on={bio.pregnant}
          disabled={bio.sex === "male"}
          onChange={(pregnant) => setBio({ pregnant })}
        />
        <Toggle label="Current smoker" on={bio.smoker} onChange={(smoker) => setBio({ smoker })} />
        <Toggle
          label="Recent travel (endemic / long-haul)"
          on={bio.travel}
          onChange={(travel) => setBio({ travel })}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Alcohol intake</p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["none", "None"],
              ["moderate", "Moderate"],
              ["heavy", "Heavy"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setBio({ alcohol: id })}
              className={cn(
                "h-11 rounded-md px-4 text-sm border",
                bio.alcohol === id
                  ? "border-primary bg-teal-soft text-primary"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Known long-term conditions</p>
        <div className="flex flex-wrap gap-2">
          {COMORBIDITY_OPTIONS.map((opt) => {
            const on = bio.comorbidities.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  const next = on
                    ? bio.comorbidities.filter((c) => c !== opt.id)
                    : [...bio.comorbidities, opt.id as ComorbidityId];
                  setBio({ comorbidities: next });
                }}
                className={cn(
                  "h-11 rounded-md px-3 text-sm border",
                  on
                    ? "border-primary bg-teal-soft text-primary"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Allergies (free text)" htmlFor="allergies">
        <Input
          id="allergies"
          value={bio.allergies}
          placeholder="e.g. penicillin — rash"
          onChange={(e) => setBio({ allergies: e.target.value })}
        />
      </Field>
      <Field label="Regular medicines" htmlFor="meds">
        <Input
          id="meds"
          value={bio.medications}
          placeholder="e.g. metformin, ramipril"
          onChange={(e) => setBio({ medications: e.target.value })}
        />
      </Field>
      <Field label="Chief concern (optional)" htmlFor="notes">
        <Textarea
          id="notes"
          value={bio.notes}
          placeholder="In your words — what changed, and when."
          onChange={(e) => setBio({ notes: e.target.value })}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
  disabled,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cn(
        "flex h-12 items-center justify-between rounded-lg border px-4 text-sm disabled:opacity-40",
        on ? "border-primary bg-teal-soft text-primary" : "border-border bg-card",
      )}
    >
      <span>{label}</span>
      <span className="text-xs uppercase tracking-wider">{on ? "Yes" : "No"}</span>
    </button>
  );
}
