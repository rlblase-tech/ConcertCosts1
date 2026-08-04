import type { ReactNode } from "react";

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: boolean;
};

export function StatCard({ label, value, hint, icon, accent }: Props) {
  return (
    <div
      className={`card shadow-md border border-base-300 ${
        accent ? "bg-primary text-primary-content" : "bg-base-100"
      }`}
    >
      <div className="card-body p-4 sm:p-5 gap-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-xs sm:text-sm font-medium uppercase tracking-wide ${
              accent ? "opacity-80" : "text-base-content/60"
            }`}
          >
            {label}
          </p>
          {icon && <span className="opacity-80 shrink-0">{icon}</span>}
        </div>
        <p className="text-xl sm:text-2xl font-bold leading-tight break-words">
          {value}
        </p>
        {hint && (
          <p
            className={`text-xs sm:text-sm truncate ${
              accent ? "opacity-80" : "text-base-content/50"
            }`}
            title={hint}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
