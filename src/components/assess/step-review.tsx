import { ClinicalDisclaimer } from "@/components/layout/disclaimer";
import { bmiOf } from "@/lib/clinical/features";
import { SYMPTOM_BY_ID } from "@/lib/clinical/symptoms";
import { useAssess } from "@/lib/clinical/store";

export function StepReview() {
  const bio = useAssess((s) => s.bio);
  const vitals = useAssess((s) => s.vitals);
  const selected = useAssess((s) => s.selected);
  const context = useAssess((s) => s.context);
  const bmi = bmiOf(bio.heightCm, bio.weightKg);

  return (
    <div className="grid gap-6">
      <ClinicalDisclaimer compact />
      <section>
        <h3 className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-medium">Person</h3>
        <p className="mt-2 text-sm leading-relaxed">
          {bio.age}-year-old {bio.sex}
          {bio.pregnant ? ", pregnant" : ""}
          {bio.smoker ? ", smokes" : ""}
          {bio.travel ? ", recent travel" : ""}. BMI {bmi.toFixed(1)}.
          {bio.comorbidities.length ? ` Background: ${bio.comorbidities.join(", ")}.` : ""}
          {bio.notes ? ` Concern: ${bio.notes}` : ""}
        </p>
      </section>
      <section>
        <h3 className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-medium">Vitals</h3>
        <p className="mt-2 text-sm tabular-nums text-muted-foreground">
          {[
            vitals.temperatureC != null ? `${vitals.temperatureC} °C` : null,
            vitals.heartRate != null ? `HR ${vitals.heartRate}` : null,
            vitals.sbp != null ? `BP ${vitals.sbp}/${vitals.dbp ?? "—"}` : null,
            vitals.spo2 != null ? `SpO2 ${vitals.spo2}%` : null,
            vitals.respRate != null ? `RR ${vitals.respRate}` : null,
          ]
            .filter(Boolean)
            .join(" · ") || "No vitals entered — priors will be used."}
        </p>
      </section>
      <section>
        <h3 className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-medium">
          Course
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {context.onset} onset, day {context.durationDays}, severity {context.severity}/10
          {context.progressing ? ", progressing" : ""}.
        </p>
      </section>
      <section>
        <h3 className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-medium">
          Findings ({selected.length})
        </h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {selected.map((id) => (
            <li key={id} className="rounded-full bg-muted px-3 py-1 text-sm">
              {SYMPTOM_BY_ID[id]?.name ?? id}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
