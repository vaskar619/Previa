import type { ReactNode } from "react";
import {
  AlertTriangle,
  HeartPulse,
  Pill,
  ShieldCheck,
  Stethoscope,
  TestTube2,
  Home,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClinicalDisclaimer } from "@/components/layout/disclaimer";
import { UrgencyChip } from "@/components/clinical/urgency-chip";
import { SPECIALTY_LABEL, URGENCY_HINT } from "@/lib/clinical/labels";
import type { Disease } from "@/lib/clinical/types";
import { useT } from "@/lib/i18n";

export function DiseaseDetail({ disease }: { disease: Disease }) {
  const { t, locale, diseaseName, symptomName } = useT();
  const hallmarks = Object.entries(disease.symptoms)
    .filter(([, p]) => p >= 0.8)
    .map(([sid]) => symptomName(sid));
  const supportive = Object.entries(disease.symptoms)
    .filter(([, p]) => p < 0.8 && p >= 0.35)
    .map(([sid]) => symptomName(sid));

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <UrgencyChip urgency={disease.urgency} />
        <Badge variant="outline">{disease.icd10}</Badge>
        <Badge variant="secondary">{SPECIALTY_LABEL[disease.specialty]}</Badge>
      </div>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {diseaseName(disease.id)}
        </h1>
        {locale !== "en" ? (
          <p className="mt-1 text-sm text-muted-foreground">{disease.name}</p>
        ) : null}
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{disease.summary}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="flex items-start gap-2 text-sm">
          <Stethoscope className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            <span className="font-semibold">{t("where")}: </span>
            {disease.department} — {disease.setting}
          </span>
        </p>
        <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
          <HeartPulse className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          {URGENCY_HINT[disease.urgency]}
        </p>
      </div>

      <Section icon={AlertTriangle} title={t("typicalSymptoms")}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("hallmarks")}</p>
        <p className="mt-1 text-sm leading-relaxed">{hallmarks.join(" · ") || "—"}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("supportive")}</p>
        <p className="mt-1 text-sm leading-relaxed">{supportive.join(" · ") || "—"}</p>
      </Section>

      <Section icon={AlertTriangle} title={t("warningSigns")} tone="emergency">
        <List items={disease.redFlags} />
      </Section>

      <Section icon={TestTube2} title={t("tests")}>
        <List items={disease.workup} />
      </Section>

      <Section icon={Pill} title={t("medClasses")}>
        <div className="grid gap-3">
          {disease.medications.map((m) => (
            <div key={m.class} className="rounded-lg border border-border bg-background p-4">
              <p className="font-semibold text-sm">{m.class}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("examples")}: {m.examples.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{m.notes}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t("medDisclaimer")}</p>
      </Section>

      <Section icon={ShieldCheck} title={t("prevention")}>
        <List items={disease.prevention} />
      </Section>

      <Section icon={Home} title={t("selfCare")}>
        <List items={disease.selfCare} />
        <p className="mt-4 text-sm font-semibold">{t("seekCare")}</p>
        <p className="mt-1 text-sm leading-relaxed">{disease.seekCare}</p>
      </Section>

      {locale !== "en" ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{t("clinicalNote")}</p>
      ) : null}

      <ClinicalDisclaimer />
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  tone,
}: {
  title: string;
  icon: typeof AlertTriangle;
  children: ReactNode;
  tone?: "emergency";
}) {
  return (
    <section
      className={
        tone === "emergency"
          ? "rounded-xl border-2 border-emergency/40 bg-card p-4 sm:p-5"
          : "rounded-xl border border-border bg-card p-4 sm:p-5"
      }
    >
      <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
        <Icon className={tone === "emergency" ? "size-4 text-emergency" : "size-4 text-primary"} aria-hidden />
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}
