import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, HeartPulse, Stethoscope } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClinicalDisclaimer } from "@/components/layout/disclaimer";
import { DISEASE_BY_ID } from "@/lib/clinical/catalog";
import { SPECIALTY_LABEL, URGENCY_HINT, URGENCY_LABEL } from "@/lib/clinical/labels";
import { SYMPTOM_BY_ID } from "@/lib/clinical/symptoms";
import { useAssess } from "@/lib/clinical/store";
import type { Urgency } from "@/lib/clinical/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results")({ component: ResultsPage });

function urgencyVariant(u: Urgency) {
  if (u === "emergency") return "emergency" as const;
  if (u === "urgent") return "urgent" as const;
  if (u === "soon") return "soon" as const;
  return "ok" as const;
}

function ResultsPage() {
  const prediction = useAssess((s) => s.prediction);
  const selected = useAssess((s) => s.selected);
  const reset = useAssess((s) => s.reset);
  const [openId, setOpenId] = useState<string | null>(prediction?.findings[0]?.diseaseId ?? null);

  if (!prediction) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl">No encounter on the desk</h1>
        <p className="mt-2 text-muted-foreground">Open a new assessment to run the forest.</p>
        <Button asChild className="mt-6">
          <Link to="/assess">Start an encounter</Link>
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
            Edit intake
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/assess" onClick={() => reset()}>
            New encounter
          </Link>
        </Button>
      </div>

      {selfHarm ? (
        <div className="mt-6 rounded-2xl border border-emergency/40 bg-emergency/10 p-5">
          <p className="flex items-center gap-2 font-medium text-emergency">
            <AlertTriangle className="size-4" />
            Crisis support
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            If you are thinking about harming yourself, stop here. Call local emergency services. In
            the United States, call or text 988 (Suicide & Crisis Lifeline). You deserve help
            that a webpage cannot give.
          </p>
        </div>
      ) : null}

      {prediction.redFlags.length > 0 && !selfHarm ? (
        <div className="mt-6 rounded-2xl border border-emergency/30 bg-card p-5">
          <p className="flex items-center gap-2 font-medium text-emergency">
            <AlertTriangle className="size-4" />
            Emergency patterns on this intake
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
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-primary font-medium">
          Random-forest differential
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          {top ? top.name : "No confident match"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
          {prediction.nTrees}-tree ensemble over {prediction.nFeatures} features and{" "}
          {prediction.nDiseases} conditions
          {prediction.elapsedMs ? ` · ${prediction.elapsedMs} ms` : ""}. Rankings are educational
          look-alikes, not a verdict.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <Card className="rounded-2xl h-fit">
          <CardContent className="p-5 sm:p-6">
            <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">Ranked conditions</p>
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
                          {f.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {SPECIALTY_LABEL[f.specialty]} · {f.rfVotes} of {prediction.nTrees} trees
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="tabular-nums text-sm font-medium">
                          {Math.round(f.probability * 100)}%
                        </p>
                        <Badge variant={urgencyVariant(f.urgency)} className="mt-1">
                          {URGENCY_LABEL[f.urgency]}
                        </Badge>
                      </div>
                    </div>
                    <Progress className="mt-3" value={Math.round(f.probability * 100)} />
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              {selected.length} finding{selected.length === 1 ? "" : "s"} entered.
            </p>
          </CardContent>
        </Card>

        {disease ? (
          <Card className="rounded-2xl">
            <CardContent className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={urgencyVariant(disease.urgency)}>{URGENCY_LABEL[disease.urgency]}</Badge>
                <Badge variant="outline">{disease.icd10}</Badge>
                <Badge variant="secondary">{SPECIALTY_LABEL[disease.specialty]}</Badge>
              </div>
              <h2 className="mt-3 font-display text-2xl font-medium tracking-tight">{disease.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{disease.summary}</p>
              <p className="mt-3 flex items-start gap-2 text-sm">
                <Stethoscope className="mt-0.5 size-4 text-primary shrink-0" />
                <span>
                  <span className="font-medium">{disease.department}</span>
                  <span className="text-muted-foreground"> — {disease.setting}</span>
                </span>
              </p>
              <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                <HeartPulse className="mt-0.5 size-4 text-primary shrink-0" />
                {URGENCY_HINT[disease.urgency]}
              </p>

              {top && openId === top.diseaseId ? (
                <div className="mt-4 rounded-lg bg-muted/70 px-4 py-3 text-sm">
                  <p className="font-medium">Matched hallmarks</p>
                  <p className="mt-1 text-muted-foreground">
                    {top.matchedHallmarks.length
                      ? top.matchedHallmarks.map((id) => SYMPTOM_BY_ID[id]?.name ?? id).join(", ")
                      : "No high-prior findings overlapped — ranking is from the broader ensemble."}
                  </p>
                </div>
              ) : null}

              <Separator className="my-5" />

              <Accordion type="multiple" defaultValue={["workup", "meds", "prevention"]}>
                <AccordionItem value="red">
                  <AccordionTrigger>Red flags on this condition</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {disease.redFlags.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="workup">
                  <AccordionTrigger>Typical hospital workup</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {disease.workup.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="meds">
                  <AccordionTrigger>Medication classes clinicians consider</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-3">
                      {disease.medications.map((m) => (
                        <div key={m.class} className="rounded-lg border border-border p-3">
                          <p className="text-sm font-medium">{m.class}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Examples: {m.examples.join(", ")}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{m.notes}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      These are not instructions to take a drug. Dosing, interactions, pregnancy, and
                      allergies require a licensed prescriber.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="prevention">
                  <AccordionTrigger>Prevention</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {disease.prevention.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="self">
                  <AccordionTrigger>Self-care while awaiting assessment</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {disease.selfCare.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm">{disease.seekCare}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="mt-8">
        <ClinicalDisclaimer />
      </div>
    </main>
  );
}
