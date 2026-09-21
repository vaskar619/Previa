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
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const reset = useAssess((s) => s.reset);
  const { t } = useT();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      getForest();
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  const steps = [
    { n: "1", title: t("step1t"), body: t("step1b") },
    { n: "2", title: t("step2t"), body: t("step2b") },
    { n: "3", title: t("step3t"), body: t("step3b") },
  ];

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("heroKicker")}</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
          {t("heroTitle")}
          <span className="text-primary"> {t("heroTitle2")}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("heroLead")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/assess" onClick={() => reset()}>
              {t("ctaStart")}
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/library">
              {t("ctaBrowse")}
              <BookOpen />
            </Link>
          </Button>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: t("statConditions"), v: String(DISEASES.length) },
            { k: t("statSymptoms"), v: String(SYMPTOMS.length) },
            { k: t("statTrees"), v: "41" },
            { k: t("statSpecs"), v: "21" },
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
          {steps.map((step) => (
            <article key={step.n}>
              <p className="text-sm font-bold tabular-nums text-primary">
                {t("checkStep")} {step.n}
              </p>
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
                <p className="text-xs font-bold uppercase tracking-[0.14em]">{t("howKicker")}</p>
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">{t("howTitle")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("howBody")}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("howBody2")}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-emergency/40">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-emergency">
                <HeartPulse className="size-4" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-[0.14em]">{t("whenNot")}</p>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-foreground">
                <li>Chest pressure, one-sided weakness, or the worst headache of your life.</li>
                <li>Trouble breathing, blue lips, or feeling like you might collapse.</li>
                <li>Thoughts of self-harm — call emergency services or a crisis line (988 in the US).</li>
                <li>Infants, late pregnancy, or anyone who looks seriously unwell.</li>
              </ul>
              <Button asChild className="mt-6 w-full sm:w-auto">
                <Link to="/assess">{t("ctaUnderstand")}</Link>
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
