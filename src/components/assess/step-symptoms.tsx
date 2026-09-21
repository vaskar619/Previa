import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { symptomsBySystem } from "@/lib/clinical/symptoms";
import { useAssess } from "@/lib/clinical/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function StepSymptoms() {
  const { t, locale, symptomName, systemName } = useT();
  const selected = useAssess((s) => s.selected);
  const toggle = useAssess((s) => s.toggleSymptom);
  const [q, setQ] = useState("");
  const groups = useMemo(() => symptomsBySystem(), []);
  const query = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((s) => {
          const local = symptomName(s.id).toLowerCase();
          return (
            s.name.toLowerCase().includes(query) ||
            local.includes(query) ||
            s.id.includes(query) ||
            (s.hint?.toLowerCase().includes(query) ?? false)
          );
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query, locale, symptomName]);

  return (
    <div className="grid gap-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchSymptoms")}
          className="pl-9"
          aria-label={t("searchSymptoms")}
        />
      </div>

      {selected.length > 0 ? (
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2">
            {t("selected")} · {selected.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-3 text-sm text-primary-foreground"
              >
                {symptomName(id)}
                <X className="size-3.5" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("symptomHint")}</p>
      )}

      <div className="grid gap-6">
        {filtered.map((group) => (
          <section key={group.system}>
            <h3 className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-medium mb-3">
              {systemName(group.system)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((s) => {
                const on = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    title={s.hint}
                    onClick={() => toggle(s.id)}
                    className={cn(
                      "min-h-11 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      on
                        ? "border-primary bg-teal-soft text-primary"
                        : s.redFlag
                          ? "border-emergency/40 bg-card hover:bg-muted"
                          : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    {symptomName(s.id)}
                    {s.redFlag ? (
                      <span className="ml-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-emergency">
                        {t("urgentSign")}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
