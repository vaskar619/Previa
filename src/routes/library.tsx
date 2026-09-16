import type { ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DISEASES } from "@/lib/clinical/catalog";
import { SPECIALTY_LABEL, URGENCY_LABEL } from "@/lib/clinical/labels";
import type { Specialty, Urgency } from "@/lib/clinical/types";

export const Route = createFileRoute("/library")({ component: LibraryPage });

function LibraryPage() {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState<Specialty | "all">("all");
  const specialties = useMemo(() => {
    const s = new Set(DISEASES.map((d) => d.specialty));
    return [...s].sort((a, b) => SPECIALTY_LABEL[a].localeCompare(SPECIALTY_LABEL[b]));
  }, []);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return DISEASES.filter((d) => {
      if (spec !== "all" && d.specialty !== spec) return false;
      if (!query) return true;
      return (
        d.name.toLowerCase().includes(query) ||
        d.icd10.toLowerCase().includes(query) ||
        d.summary.toLowerCase().includes(query) ||
        d.department.toLowerCase().includes(query)
      );
    });
  }, [q, spec]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-primary font-medium">Condition atlas</p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">What the forest was taught</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {DISEASES.length} conditions spanning emergency medicine through the ward specialties, each
        with hallmarks, workup, prevention, and medication classes. Search or filter, then open a
        leaf.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, ICD-10, department…"
            className="pl-9"
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <FilterChip on={spec === "all"} onClick={() => setSpec("all")}>
          All
        </FilterChip>
        {specialties.map((s) => (
          <FilterChip key={s} on={spec === s} onClick={() => setSpec(s)}>
            {SPECIALTY_LABEL[s]}
          </FilterChip>
        ))}
      </div>

      <p className="mt-4 text-sm tabular-nums text-muted-foreground">{rows.length} conditions</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((d) => (
          <li key={d.id}>
            <Link
              to="/library/$id"
              params={{ id: d.id }}
              className="block rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow] hover:shadow-[var(--shadow-border-hover)] min-h-28"
            >
              <div className="flex flex-wrap items-center gap-2">
                <UrgencyBadge urgency={d.urgency} />
                <span className="text-xs tabular-nums text-muted-foreground">{d.icd10}</span>
              </div>
              <h2 className="mt-2 font-display text-xl font-medium tracking-tight">{d.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">{d.department}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

function FilterChip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        on
          ? "h-10 shrink-0 rounded-full bg-primary px-3 text-sm text-primary-foreground"
          : "h-10 shrink-0 rounded-full border border-border bg-card px-3 text-sm hover:bg-muted"
      }
    >
      {children}
    </button>
  );
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const variant =
    urgency === "emergency"
      ? "emergency"
      : urgency === "urgent"
        ? "urgent"
        : urgency === "soon"
          ? "soon"
          : "ok";
  return <Badge variant={variant}>{URGENCY_LABEL[urgency]}</Badge>;
}
