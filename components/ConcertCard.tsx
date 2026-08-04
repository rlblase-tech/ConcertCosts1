"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Star, X } from "lucide-react";
import type { Concert } from "@/lib/types";
import { COST_FIELDS } from "@/lib/types";
import {
  concertMetrics,
  formatCurrency,
  formatDate,
  formatNumber,
  toNumber,
} from "@/lib/metrics";
import { createClient } from "@/lib/supabase/client";

export function ConcertCard({ concert }: { concert: Concert }) {
  const router = useRouter();
  const metrics = concertMetrics(concert);
  const costRows = COST_FIELDS.filter(
    ({ key }) => toNumber(concert[key]) > 0
  );
  const venueFun = toNumber(concert.venue_fun_rating ?? concert.fun_rating);

  const [editing, setEditing] = useState(false);
  const [concertScore, setConcertScore] = useState(String(concert.fun_rating));
  const [venueScore, setVenueScore] = useState(String(venueFun));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setConcertScore(String(concert.fun_rating));
    setVenueScore(String(venueFun));
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
    setConcertScore(String(concert.fun_rating));
    setVenueScore(String(venueFun));
  }

  async function saveScores() {
    const fun = Math.round(toNumber(concertScore));
    const venue = Math.round(toNumber(venueScore));

    if (fun < 1 || fun > 10 || venue < 1 || venue > 10) {
      setError("Both scores must be between 1 and 10.");
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("concerts")
      .update({
        fun_rating: fun,
        venue_fun_rating: venue,
      })
      .eq("id", concert.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message || "Could not save scores. Try again.");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  return (
    <article className="card bg-base-100/40 backdrop-blur-md shadow-lg border border-white/25">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="card-title text-xl leading-tight">
              {concert.artist}
            </h3>
            <p className="text-base-content/80 font-medium">{concert.venue}</p>
            {concert.city !== "—" && concert.state !== "—" && (
              <p className="text-sm text-base-content/60 mt-1">
                {concert.city}, {concert.state}
              </p>
            )}
            <p className="text-sm text-base-content/55 mt-0.5">
              {formatDate(concert.concert_date)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(metrics.total)}
            </p>
            {!editing && (
              <button
                type="button"
                className="btn btn-sm btn-outline gap-1"
                onClick={startEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit scores
              </button>
            )}
          </div>
        </div>

        {error && (
          <div role="alert" className="alert alert-error text-sm py-2">
            <span>{error}</span>
          </div>
        )}

        {editing ? (
          <div className="space-y-4 rounded-xl border border-white/25 bg-base-100/30 p-4">
            <EditSlider
              label="Concert fun"
              icon={<Star className="h-4 w-4 text-primary fill-primary" />}
              value={concertScore}
              onChange={setConcertScore}
            />
            <EditSlider
              label="Venue score"
              icon={<MapPin className="h-4 w-4 text-secondary" />}
              value={venueScore}
              onChange={setVenueScore}
            />
            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <button
                type="button"
                className="btn btn-ghost btn-sm gap-1"
                onClick={cancelEdit}
                disabled={saving}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={saveScores}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Save scores"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-primary/15 border border-primary/30 px-3 py-2.5">
              <Star className="h-5 w-5 text-primary fill-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/60">
                  Concert fun
                </p>
                <p className="text-lg font-bold leading-tight">
                  {concert.fun_rating}
                  <span className="text-sm font-medium text-base-content/50">
                    /10
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/15 border border-secondary/30 px-3 py-2.5">
              <MapPin className="h-5 w-5 text-secondary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/60">
                  Venue score
                </p>
                <p className="text-lg font-bold leading-tight">
                  {venueFun}
                  <span className="text-sm font-medium text-base-content/50">
                    /10
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

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
              Costs
            </p>
            <div className="flex flex-wrap gap-2">
              {costRows.map(({ key, label }) => (
                <span
                  key={key}
                  className="badge badge-outline badge-lg gap-1 bg-base-100/50"
                >
                  {label}: {formatCurrency(toNumber(concert[key]))}
                </span>
              ))}
            </div>
          </div>
        )}

        {concert.notes && (
          <div className="rounded-box bg-base-100/40 p-3 border border-white/15">
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

function EditSlider({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          {icon}
          {label}
        </span>
        <span className="badge badge-primary badge-outline">{value}/10</span>
      </div>
      <div className="flex justify-between text-xs text-base-content/60">
        <span>1 — Terrible</span>
        <span>10 — Best Ever</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        className="range range-primary range-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-box bg-base-100/35 border border-white/15 px-3 py-2">
      <p className="text-xs text-base-content/55">{label}</p>
      <p className="font-semibold text-sm sm:text-base">{value}</p>
    </div>
  );
}
