import { ClinicalDisclaimer } from "@/components/layout/disclaimer";
import { bmiOf } from "@/lib/clinical/features";
import { useAssess } from "@/lib/clinical/store";
import { useT } from "@/lib/i18n";

export function StepReview() {
  const { t, symptomName } = useT();
  const bio = useAssess((s) => s.bio);
  const vitals = useAssess((s) => s.vitals);
  const selected = useAssess((s) => s.selected);
  const context = useAssess((s) => s.context);
  const bmi = bmiOf(bio.heightCm, bio.weightKg);

  return (
    <div className="grid gap-6">
      <ClinicalDisclaimer compact />
      <section>
        <h3 className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-medium">{t("aboutYou")}</h3>
        <p className="mt-2 text-sm leading-relaxed">
          {bio.age}-year-old {t(bio.sex === "female" ? "female" : bio.sex === "male" ? "male" : "other")}
          {bio.pregnant ? `, ${t("pregnant")}` : ""}
          {bio.smoker ? `, ${t("smoker")}` : ""}
          {bio.travel ? `, ${t("travel")}` : ""}. {t("bmi")} {bmi.toFixed(1)}.
          {bio.notes ? ` ${bio.notes}` : ""}
        </p>
      </section>
      <section>
        <h3 className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-medium">{t("stepVitals")}</h3>
        <p className="mt-2 text-sm tabular-nums text-muted-foreground">
          {[
            vitals.temperatureC != null ? `${vitals.temperatureC} °C` : null,
            vitals.heartRate != null ? `HR ${vitals.heartRate}` : null,
            vitals.sbp != null ? `BP ${vitals.sbp}/${vitals.dbp ?? "—"}` : null,
            vitals.spo2 != null ? `SpO2 ${vitals.spo2}%` : null,
            vitals.respRate != null ? `RR ${vitals.respRate}` : null,
          ]
            .filter(Boolean)
            .join(" · ") || "—"}
        </p>
      </section>
      <section>
        <h3 className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-medium">{t("stepTiming")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(context.onset === "unknown" ? "unsure" : context.onset)}, {context.durationDays}d, {context.severity}/10
          {context.progressing ? `, ${t("worse")}` : ""}.
        </p>
      </section>
      <section>
        <h3 className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-medium">
          {t("stepSymptoms")} ({selected.length})
        </h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {selected.map((id) => (
            <li key={id} className="rounded-full bg-muted px-3 py-1 text-sm">
              {symptomName(id)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
