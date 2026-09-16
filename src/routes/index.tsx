import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpen, HeartPulse, ListChecks } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClinicalDisclaimer } from "@/components/layout/disclaimer";
import { DISEASES } from "@/lib/clinical/catalog";
import { SYMPTOMS } from "@/lib/clinical/symptoms";
import { getForest } from "@/lib/clinical/forest";
import { useAssess } from "@/lib/clinical/store";

export const Route = createFileRoute("/")({ component: Home });

const STEPS = [
  {
    n: "1",
    title: "Tell us about you",
    body: "Age, sex, medicines, long-term conditions, and any vitals you already measured at home or in clinic.",
  },
  {
    n: "2",
    title: "Tap your symptoms",
    body: "More than two hundred everyday words — fever, chest pain, dizziness — grouped by body area. Urgent signs are labelled, not just colored.",
  },
  {
    n: "3",
    title: "See likely look-alikes",
    body: "PREVIA ranks possible conditions, how soon to seek care, typical tests, prevention, and medicine classes a clinician might discuss with you.",
  },
];

function Home() {
  const reset = useAssess((s) => s.reset);

  useEffect(() => {
    const t = window.setTimeout(() => {
      getForest();
    }, 350);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
          For patients · Educational only
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
          Understand your symptoms.
          <span className="text-primary"> Then see a real clinician.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          PREVIA is a plain-language symptom guide. It does not diagnose you. It helps you
          organise what you feel, notice warning signs, and walk into a clinic with a clearer
          picture of possible look-alike conditions.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/assess" onClick={() => reset()}>
              Start a symptom check
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/library">
              Browse conditions
              <BookOpen />
            </Link>
          </Button>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Conditions explained", v: String(DISEASES.length) },
            { k: "Symptoms you can tap", v: String(SYMPTOMS.length) },
            { k: "Decision trees", v: "41" },
            { k: "Specialties", v: "21" },
          ].map((stat) => (
            <div key={stat.k} className="rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)]">
              <dt className="text-xs font-semibold text-muted-foreground">{stat.k}</dt>
              <dd className="mt-1 font-display text-3xl font-bold tabular-nums text-foreground">{stat.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-y border-border bg-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.n}>
              <p className="text-sm font-bold tabular-nums text-primary">Step {step.n}</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-2xl">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-primary">
                <ListChecks className="size-4" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-[0.14em]">How PREVIA ranks conditions</p>
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
                A model that votes — a person who decides
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Each of the {DISEASES.length} conditions has typical symptoms, age ranges, and
                warning signs drawn from hospital teaching. A random-forest model (41 decision
                trees) plus a clinical match score ranks look-alikes. You still need a bedside
                exam, tests, and a licensed clinician before any treatment.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                You will see suggested department, usual tests, prevention tips, and medicine{" "}
                <em>classes</em> — never a take-home prescription or a dose.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-emergency/40">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-emergency">
                <HeartPulse className="size-4" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-[0.14em]">Do not use this instead of emergency care</p>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-foreground">
                <li>Chest pressure, one-sided weakness, or the worst headache of your life.</li>
                <li>Trouble breathing, blue lips, or feeling like you might collapse.</li>
                <li>Thoughts of self-harm — call emergency services or a crisis line (988 in the US).</li>
                <li>Infants, late pregnancy, or anyone who looks seriously unwell.</li>
              </ul>
              <Button asChild className="mt-6 w-full sm:w-auto">
                <Link to="/assess">I understand — start a check</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <ClinicalDisclaimer />
        </div>
      </section>
    </main>
  );
}
