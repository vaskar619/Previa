import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { clearHistory, loadHistory } from "@/lib/clinical/history";
import { useAssess } from "@/lib/clinical/store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  const { t, diseaseName, symptomName } = useT();
  const [tick, setTick] = useState(0);
  const rows = useMemo(() => loadHistory(), [tick]);
  const setPrediction = useAssess((s) => s.setPrediction);
  const setBio = useAssess((s) => s.setBio);
  const setVitals = useAssess((s) => s.setVitals);
  const setContext = useAssess((s) => s.setContext);
  const setSelected = useAssess((s) => s.setSelected);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-primary font-medium">{t("historyKicker")}</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">{t("historyTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("historyLead")}</p>
        </div>
        {rows.length > 0 ? (
          <Button
            variant="outline"
            onClick={() => {
              clearHistory();
              setTick((n) => n + 1);
            }}
          >
            {t("clear")}
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">{t("historyEmpty")}</p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {rows.map((row) => {
            const top = row.prediction.findings[0];
            return (
              <li key={row.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
                <p className="text-xs tabular-nums text-muted-foreground">
                  {new Date(row.createdAt).toLocaleString()}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold">
                  {top ? diseaseName(top.diseaseId) : t("noMatch")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {row.input.selectedSymptoms
                    .slice(0, 8)
                    .map((id) => symptomName(id))
                    .join(" · ")}
                </p>
                <Button asChild variant="outline" className="mt-3" size="sm">
                  <Link
                    to="/results"
                    onClick={() => {
                      setBio(row.input.bio);
                      setVitals(row.input.vitals);
                      setContext(row.input.context);
                      setSelected(row.input.selectedSymptoms);
                      setPrediction(row.prediction);
                    }}
                  >
                    {t("open")}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
