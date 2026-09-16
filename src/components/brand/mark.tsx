import { cn } from "@/lib/utils";

export function PreviaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      role="img"
      aria-label="PREVIA"
    >
      <rect x="0" y="0" width="32" height="32" rx="8" fill="currentColor" />
      <path
        fill="#ffffff"
        d="M10.2 7.4h8.15c3.55 0 5.75 2.05 5.75 5.35 0 3.25-2.2 5.4-5.75 5.4H13.4V24.6h-3.2V7.4Zm3.2 2.55v5.6h4.7c1.85 0 2.95-1.05 2.95-2.8 0-1.75-1.1-2.8-2.95-2.8h-4.7Z"
      />
    </svg>
  );
}

/** @deprecated Use PreviaMark */
export const AshbourneMark = PreviaMark;
