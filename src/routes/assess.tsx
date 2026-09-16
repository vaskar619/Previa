import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { StepBio } from "@/components/assess/step-bio";
import { StepCourse } from "@/components/assess/step-course";
import { StepReview } from "@/components/assess/step-review";
import { StepSymptoms } from "@/components/assess/step-symptoms";
import { StepVitals } from "@/components/assess/step-vitals";
import { Stepper } from "@/components/assess/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveEncounter } from "@/lib/clinical/history";
import { runPrediction } from "@/lib/clinical/predict";
import { useAssess } from "@/lib/clinical/store";

export const Route = createFileRoute("/assess")({ component: AssessPage });

const TITLES = [
  "About you",
  "Vital signs (if you have them)",
  "Your symptoms",
  "How long this has been going on",
  "Check your answers",
];

function AssessPage() {
  const step = useAssess((s) => s.step);
  const setStep = useAssess((s) => s.setStep);
  const selected = useAssess((s) => s.selected);
  const fitting = useAssess((s) => s.fitting);
  const setFitting = useAssess((s) => s.setFitting);
  const setPrediction = useAssess((s) => s.setPrediction);
  const asInput = useAssess((s) => s.asInput);
  const navigate = useNavigate();

  const canNext = step !== 2 || selected.length > 0;

  async function next() {
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (selected.length === 0) return;
    setFitting(true);
    await new Promise((r) => setTimeout(r, 40));
    try {
      const input = asInput();
      const prediction = runPrediction(input);
      setPrediction(prediction);
      saveEncounter(input, prediction);
      await navigate({ to: "/results" });
    } finally {
      setFitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Stepper step={step} />
      <Card className="mt-6 rounded-2xl">
        <CardHeader>
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-medium">
            Symptom check · step {step + 1} of 5
          </p>
          <CardTitle className="text-2xl">{TITLES[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 0 ? <StepBio /> : null}
          {step === 1 ? <StepVitals /> : null}
          {step === 2 ? <StepSymptoms /> : null}
          {step === 3 ? <StepCourse /> : null}
          {step === 4 ? <StepReview /> : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0 || fitting}
              onClick={() => {
                setStep(Math.max(0, step - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <ArrowLeft />
              Back
            </Button>
            <Button type="button" onClick={next} disabled={!canNext || fitting}>
              {fitting ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Fitting ensemble
                </>
              ) : step === 4 ? (
                <>
                  See possible conditions
                  <ArrowRight />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight />
                </>
              )}
            </Button>
          </div>
          {step === 2 && selected.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Select at least one finding to continue.</p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
