import { Star } from "lucide-react";
import type { Concert } from "@/lib/types";
import { COST_FIELDS } from "@/lib/types";
import {
  concertMetrics,
  formatCurrency,
  formatDate,
  formatNumber,
  toNumber,
} from "@/lib/metrics";

export function ConcertCard({ concert }: { concert: Concert }) {
  const metrics = concertMetrics(concert);
  const costRows = COST_FIELDS.filter(
    ({ key }) => toNumber(concert[key]) > 0
  );

  return (
    <article className="card bg-base-100 shadow-md border border-base-300">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="card-title text-xl leading-tight">
              {concert.concert_name}
            </h3>
            <p className="text-base-content/70 font-medium">{concert.artist}</p>
            <p className="text-sm text-base-content/60 mt-1">
              {concert.venue} · {concert.city}, {concert.state}
            </p>
            <p className="text-sm text-base-content/50 mt-0.5">
              {formatDate(concert.concert_date)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="badge badge-primary badge-lg gap-1">
              <Star className="h-3.5 w-3.5 fill-current" />
              {concert.fun_rating}/10 fun
            </div>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(metrics.total)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Metric
            label="Cost per hour"
            value={
              metrics.costPerHour !== null
                ? formatCurrency(metrics.costPerHour)
                : "—"
            }
          />
          <Metric
            label="Fun Points per $100"
            value={
              metrics.funPointsPer100 !== null
                ? formatNumber(metrics.funPointsPer100, 2)
                : "—"
            }
          />
          <Metric
            label="Hours at event"
            value={formatNumber(toNumber(concert.hours_at_event), 1)}
          />
        </div>

        {costRows.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-2">
              Main cost categories
            </p>
            <div className="flex flex-wrap gap-2">
              {costRows.map(({ key, label }) => (
                <span key={key} className="badge badge-outline badge-lg gap-1">
                  {label}: {formatCurrency(toNumber(concert[key]))}
                </span>
              ))}
            </div>
          </div>
        )}

        {concert.notes && (
          <div className="rounded-box bg-base-200/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-1">
              Notes
            </p>
            <p className="text-sm whitespace-pre-wrap">{concert.notes}</p>
          </div>
        )}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-box bg-base-200/60 px-3 py-2">
      <p className="text-xs text-base-content/50">{label}</p>
      <p className="font-semibold text-sm sm:text-base">{value}</p>
    </div>
  );
}
