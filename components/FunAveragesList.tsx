import { formatNumber } from "@/lib/metrics";
import type { FunAverageRow } from "@/lib/metrics";

type Props = {
  title: string;
  subtitle: string;
  rows: FunAverageRow[];
  emptyLabel?: string;
};

export function FunAveragesList({
  title,
  subtitle,
  rows,
  emptyLabel = "No data yet",
}: Props) {
  return (
    <div className="card bg-base-100/95 shadow-md border border-base-300">
      <div className="card-body gap-3">
        <div>
          <h3 className="card-title text-base sm:text-lg">{title}</h3>
          <p className="text-sm text-base-content/60">{subtitle}</p>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-base-content/50 py-4 text-center">
            {emptyLabel}
          </p>
        ) : (
          <ul className="divide-y divide-base-300">
            {rows.map((row) => (
              <li
                key={row.name}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{row.name}</p>
                  <p className="text-xs text-base-content/50">
                    {row.count} show{row.count === 1 ? "" : "s"} logged
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-primary leading-none">
                    {formatNumber(row.avgFun, 1)}
                    <span className="text-sm font-medium text-base-content/50">
                      /10
                    </span>
                  </p>
                  <p className="text-xs text-base-content/50">avg fun</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
