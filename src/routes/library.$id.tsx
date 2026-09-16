import type { ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DISEASE_BY_ID } from "@/lib/clinical/catalog";
import { SPECIALTY_LABEL, URGENCY_HINT, URGENCY_LABEL } from "@/lib/clinical/labels";
import { SYMPTOM_BY_ID } from "@/lib/clinical/symptoms";

export const Route = createFileRoute("/library/$id")({ component: DiseasePage });

function DiseasePage() {
  const { id } = Route.useParams();
  const d = DISEASE_BY_ID[id];
  if (!d) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Condition not in the atlas</h1>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/library">Back to atlas</Link>
        </Button>
      </main>
    );
  }

  const hallmarks = Object.entries(d.symptoms)
    .filter(([, p]) => p >= 0.8)
    .map(([sid]) => SYMPTOM_BY_ID[sid]?.name ?? sid);
  const supportive = Object.entries(d.symptoms)
    .filter(([, p]) => p < 0.8 && p >= 0.35)
    .map(([sid]) => SYMPTOM_BY_ID[sid]?.name ?? sid);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Button asChild variant="ghost">
        <Link to="/library">
          <ArrowLeft />
          Atlas
        </Link>
      </Button>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge
          variant={
            d.urgency === "emergency"
              ? "emergency"
              : d.urgency === "urgent"
                ? "urgent"
                : d.urgency === "soon"
                  ? "soon"
                  : "ok"
          }
        >
          {URGENCY_LABEL[d.urgency]}
        </Badge>
        <Badge variant="outline">{d.icd10}</Badge>
        <Badge variant="secondary">{SPECIALTY_LABEL[d.specialty]}</Badge>
      </div>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">{d.name}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{d.summary}</p>
      <p className="mt-3 text-sm">
        <span className="font-medium">{d.department}</span>
        <span className="text-muted-foreground"> — {d.setting}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{URGENCY_HINT[d.urgency]}</p>

      <Section title="Hallmarks">
        <p className="text-sm leading-relaxed">{hallmarks.join(" · ") || "—"}</p>
      </Section>
      <Section title="Supportive findings">
        <p className="text-sm leading-relaxed">{supportive.join(" · ") || "—"}</p>
      </Section>
      <Section title="Red flags">
        <List items={d.redFlags} />
      </Section>
      <Section title="Workup">
        <List items={d.workup} />
      </Section>
      <Section title="Medication classes">
        <div className="grid gap-3">
          {d.medications.map((m) => (
            <div key={m.class} className="rounded-lg border border-border bg-card p-4">
              <p className="font-medium text-sm">{m.class}</p>
              <p className="text-sm text-muted-foreground mt-1">Examples: {m.examples.join(", ")}</p>
              <p className="text-sm text-muted-foreground mt-1">{m.notes}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Prevention">
        <List items={d.prevention} />
      </Section>
      <Section title="Self-care and when to be seen">
        <List items={d.selfCare} />
        <p className="mt-3 text-sm">{d.seekCare}</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-medium">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}
