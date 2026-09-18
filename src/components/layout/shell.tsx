import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { PreviaMark } from "@/components/brand/mark";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/assess", label: "Symptom check" },
  { to: "/library", label: "Conditions" },
  { to: "/history", label: "My results" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="border-b border-border bg-paper/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 min-w-0 text-primary">
            <PreviaMark className="size-9 shrink-0" />
            <span className="min-w-0 text-foreground">
              <span className="block font-display text-[1.15rem] font-bold leading-none tracking-tight">
                PREVIA
              </span>
              <span className="mt-1 block text-[0.7rem] text-muted-foreground">
                Symptom guide · not a diagnosis
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Primary">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-md px-2 py-2 text-sm font-semibold transition-colors duration-150 min-h-11 inline-flex items-center sm:px-3",
                    active
                      ? "bg-teal-soft text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div id="main" className="flex-1">
        {children}
      </div>
      <footer className="border-t border-border bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-sm leading-relaxed text-muted-foreground max-w-3xl">
            <strong className="text-foreground">PREVIA</strong> is an educational symptom guide. It
            is not a medical device, not a doctor, and not a prescription. If you think you are
            having an emergency, call local emergency services. Medicines listed are classes
            clinicians often consider — never start, stop, or change a drug from this screen.
          </p>
          <p className="mt-5 border-t border-border pt-4 text-xs font-semibold tracking-wide text-muted-foreground">
            Created by VASKAR BHUNIA
          </p>
        </div>
      </footer>
    </div>
  );
}
