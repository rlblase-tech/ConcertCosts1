"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, toNumber } from "@/lib/metrics";

const EMPTY_FORM = {
  artist: "",
  venue: "",
  ticket_cost: "0",
  fun_rating: "7",
  venue_fun_rating: "7",
};

const GLASS =
  "rounded-2xl border border-white/25 bg-white/15 backdrop-blur-md shadow-lg";

function RatingBlock({
  title,
  helper,
  value,
  onChange,
}: {
  title: string;
  helper: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-base text-base-content drop-shadow-sm">
          {title}
        </h3>
        <p className="text-sm text-base-content/70">{helper}</p>
      </div>
      <div className="flex justify-between text-sm font-medium gap-2">
        <span className="text-base-content/80">1 — Terrible</span>
        <span className="text-primary text-lg font-bold bg-base-100/80 px-2 rounded-lg">
          {value}/10
        </span>
        <span className="text-base-content/80">10 — Best Ever</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        className="range range-primary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex w-full justify-between px-1 text-xs text-base-content/60">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
    </div>
  );
}

export function ConcertForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const ticketTotal = useMemo(
    () => toNumber(form.ticket_cost),
    [form.ticket_cost]
  );

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const artist = form.artist.trim();
    const venue = form.venue.trim();
    const fun = Math.round(toNumber(form.fun_rating));
    const venueFun = Math.round(toNumber(form.venue_fun_rating));
    const ticket = toNumber(form.ticket_cost);

    if (!artist || !venue) {
      setError("Please fill in artist and venue.");
      setLoading(false);
      return;
    }
    if (ticket < 0) {
      setError("Ticket cost can’t be negative.");
      setLoading(false);
      return;
    }
    if (fun < 1 || fun > 10) {
      setError("Concert fun rating must be between 1 and 10.");
      setLoading(false);
      return;
    }
    if (venueFun < 1 || venueFun > 10) {
      setError("Venue fun score must be between 1 and 10.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be signed in to save a concert.");
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    const { error: insertError } = await supabase.from("concerts").insert({
      user_id: user.id,
      concert_name: `${artist} at ${venue}`,
      artist,
      venue,
      city: "—",
      state: "—",
      concert_date: today,
      distance_from_home: 0,
      hours_at_event: 1,
      ticket_cost: ticket,
      ticket_fees: 0,
      parking_cost: 0,
      food_drink_cost: 0,
      merchandise_cost: 0,
      lodging_cost: 0,
      travel_cost: 0,
      other_cost: 0,
      fun_rating: fun,
      venue_fun_rating: venueFun,
      notes: null,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message || "Could not save this concert. Try again.");
      return;
    }

    setForm(EMPTY_FORM);
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div role="alert" className="alert alert-error shadow-lg">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="alert" className="alert alert-success shadow-lg">
          <CheckCircle2 className="h-5 w-5" />
          <span>
            Concert saved! Check My Concerts for both concert and venue scores.
          </span>
        </div>
      )}

      {/* Details */}
      <section className={`${GLASS} p-4 sm:p-5 space-y-4`}>
        <div>
          <h2 className="text-lg font-bold tracking-tight drop-shadow-sm">
            Concert details
          </h2>
          <p className="text-sm text-base-content/75">
            Who you saw and where you saw them
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Artist or band" required>
            <input
              className="input input-bordered w-full bg-base-100/90"
              value={form.artist}
              onChange={(e) => update("artist", e.target.value)}
              placeholder="The Midnight Lights"
              required
            />
          </Field>
          <Field label="Venue" required>
            <input
              className="input input-bordered w-full bg-base-100/90"
              value={form.venue}
              onChange={(e) => update("venue", e.target.value)}
              placeholder="Main Street Amphitheater"
              required
            />
          </Field>
        </div>
      </section>

      {/* Ticket */}
      <section className={`${GLASS} p-4 sm:p-5 space-y-4`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight drop-shadow-sm">
              Ticket cost
            </h2>
            <p className="text-sm text-base-content/75">
              What you paid for admission
            </p>
          </div>
          <div className="badge badge-lg badge-primary gap-1 py-3 shadow">
            Total: <strong>{formatCurrency(ticketTotal)}</strong>
          </div>
        </div>
        <Field label="Ticket cost">
          <label className="input input-bordered flex items-center gap-2 w-full max-w-xs bg-base-100/90">
            <span className="opacity-60">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="grow"
              value={form.ticket_cost}
              onChange={(e) => update("ticket_cost", e.target.value)}
            />
          </label>
        </Field>
      </section>

      {/* Concert fun + Venue fun together */}
      <section className={`${GLASS} p-4 sm:p-5 space-y-5`}>
        <div>
          <h2 className="text-lg font-bold tracking-tight drop-shadow-sm">
            Fun scores
          </h2>
          <p className="text-sm text-base-content/75">
            Rate the concert overall and the venue separately (1–10)
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="rounded-xl border border-white/20 bg-base-100/20 p-4">
            <RatingBlock
              title="Concert fun rating"
              helper="How fun was this concert overall?"
              value={form.fun_rating}
              onChange={(v) => update("fun_rating", v)}
            />
          </div>
          <div className="rounded-xl border border-white/20 bg-base-100/20 p-4">
            <RatingBlock
              title="Venue fun score"
              helper="How fun was the venue itself?"
              value={form.venue_fun_rating}
              onChange={(v) => update("venue_fun_rating", v)}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary btn-lg shadow-lg"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner" />
          ) : (
            "Save concert"
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  help,
  required,
}: {
  label: string;
  children: React.ReactNode;
  help?: string;
  required?: boolean;
}) {
  return (
    <div className="form-control w-full gap-1">
      <label className="label py-0">
        <span className="label-text font-semibold text-base-content">
          {label}
          {required && <span className="text-error"> *</span>}
        </span>
      </label>
      {children}
      {help && (
        <label className="label py-0">
          <span className="label-text-alt text-base-content/70">{help}</span>
        </label>
      )}
    </div>
  );
}
