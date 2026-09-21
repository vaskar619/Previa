import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DiseaseDetail } from "@/components/clinical/disease-detail";
import { UrgencyChip } from "@/components/clinical/urgency-chip";
import { DISEASE_BY_ID } from "@/lib/clinical/catalog";
import { SPECIALTY_LABEL } from "@/lib/clinical/labels";
import { useAssess } from "@/lib/clinical/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results")({ component: ResultsPage });

function ResultsPage() {
  const { t, diseaseName } = useT();
  const prediction = useAssess((s) => s.prediction);
  const selected = useAssess((s) => s.selected);
  const reset = useAssess((s) => s.reset);
  const [openId, setOpenId] = useState<string | null>(prediction?.findings[0]?.diseaseId ?? null);

  if (!prediction) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">{t("emptyResults")}</h1>
        <p className="mt-2 text-muted-foreground">{t("emptyResultsLead")}</p>
        <Button asChild className="mt-6">
          <Link to="/assess">{t("ctaStart")}</Link>
        </Button>
      </main>
    );
  }

  const top = prediction.findings[0];
  const disease = openId ? DISEASE_BY_ID[openId] : top ? DISEASE_BY_ID[top.diseaseId] : undefined;
  const selfHarm = prediction.crisisKind === "self-harm";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost">
          <Link to="/assess">
            <ArrowLeft />
            {t("editCheck")}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/assess" onClick={() => reset()}>
            {t("newCheck")}
          </Link>
        </Button>
      </div>

      {selfHarm ? (
        <div className="mt-6 rounded-2xl border border-emergency/40 bg-emergency/10 p-5">
          <p className="flex items-center gap-2 font-medium text-emergency">
            <AlertTriangle className="size-4" />
            {t("crisis")}
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            If you are thinking about harming yourself, stop here. Call local emergency services. In
            the United States, call or text 988 (Suicide & Crisis Lifeline). You deserve help
            that a webpage cannot give.
          </p>
        </div>
      ) : null}

      {prediction.redFlags.length > 0 && !selfHarm ? (
        <div className="mt-6 rounded-2xl border-2 border-emergency/40 bg-card p-5">
          <p className="flex items-center gap-2 font-medium text-emergency">
            <AlertTriangle className="size-4" />
            {t("emergencyPatterns")}
          </p>
          <ul className="mt-3 grid gap-3">
            {prediction.redFlags.map((f) => (
              <li key={f.id}>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.detail}</p>
                <p className="text-sm text-emergency mt-0.5">{f.action}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <header className="mt-8">
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-primary font-medium">{t("differential")}</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {top ? diseaseName(top.diseaseId) : t("noMatch")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">{t("discTitle")}</p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <Card className="rounded-2xl h-fit">
          <CardContent className="p-5 sm:p-6">
            <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">{t("ranked")}</p>
            <ol className="mt-4 grid gap-3">
              {prediction.findings.map((f, i) => (
                <li key={f.diseaseId}>
                  <button
                    type="button"
                    onClick={() => setOpenId(f.diseaseId)}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-colors",
                      openId === f.diseaseId
                        ? "border-primary bg-teal-soft/60"
                        : "border-border bg-card hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          <span className="tabular-nums text-muted-foreground mr-2">{i + 1}</span>
                          {diseaseName(f.diseaseId)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{SPECIALTY_LABEL[f.specialty]}</p>
                      </div>
                      <div className="text-right">
                        <p className="tabular-nums text-sm font-medium">{Math.round(f.probability * 100)}%</p>
                        <UrgencyChip urgency={f.urgency} className="mt-1" />
                      </div>
                    </div>
                    <Progress className="mt-3" value={Math.round(f.probability * 100)} />
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              {selected.length} {t("findingsEntered")}.
            </p>
          </CardContent>
        </Card>

        {disease ? (
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <DiseaseDetail disease={disease} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
