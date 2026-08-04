"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { COST_FIELDS } from "@/lib/types";
import { formatCurrency, totalCost, toNumber } from "@/lib/metrics";

const EMPTY_FORM = {
  concert_name: "",
  artist: "",
  venue: "",
  city: "",
  state: "",
  concert_date: "",
  distance_from_home: "0",
  hours_at_event: "3",
  ticket_cost: "0",
  ticket_fees: "0",
  parking_cost: "0",
  food_drink_cost: "0",
  merchandise_cost: "0",
  lodging_cost: "0",
  travel_cost: "0",
  other_cost: "0",
  fun_rating: "7",
  notes: "",
};

export function ConcertForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const liveTotal = useMemo(
    () =>
      totalCost({
        ticket_cost: toNumber(form.ticket_cost),
        ticket_fees: toNumber(form.ticket_fees),
        parking_cost: toNumber(form.parking_cost),
        food_drink_cost: toNumber(form.food_drink_cost),
        merchandise_cost: toNumber(form.merchandise_cost),
        lodging_cost: toNumber(form.lodging_cost),
        travel_cost: toNumber(form.travel_cost),
        other_cost: toNumber(form.other_cost),
      }),
    [form]
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

    const hours = toNumber(form.hours_at_event);
    const fun = Math.round(toNumber(form.fun_rating));

    if (!form.concert_name.trim() || !form.artist.trim() || !form.venue.trim()) {
      setError("Please fill in concert name, artist, and venue.");
      setLoading(false);
      return;
    }
    if (!form.city.trim() || !form.state.trim() || !form.concert_date) {
      setError("Please fill in city, state, and concert date.");
      setLoading(false);
      return;
    }
    if (hours <= 0) {
      setError("Hours at the event should be greater than zero.");
      setLoading(false);
      return;
    }
    if (fun < 1 || fun > 10) {
      setError("Fun rating must be between 1 and 10.");
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

    const { error: insertError } = await supabase.from("concerts").insert({
      user_id: user.id,
      concert_name: form.concert_name.trim(),
      artist: form.artist.trim(),
      venue: form.venue.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      concert_date: form.concert_date,
      distance_from_home: toNumber(form.distance_from_home),
      hours_at_event: hours,
      ticket_cost: toNumber(form.ticket_cost),
      ticket_fees: toNumber(form.ticket_fees),
      parking_cost: toNumber(form.parking_cost),
      food_drink_cost: toNumber(form.food_drink_cost),
      merchandise_cost: toNumber(form.merchandise_cost),
      lodging_cost: toNumber(form.lodging_cost),
      travel_cost: toNumber(form.travel_cost),
      other_cost: toNumber(form.other_cost),
      fun_rating: fun,
      notes: form.notes.trim() || null,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="alert" className="alert alert-success">
          <CheckCircle2 className="h-5 w-5" />
          <span>Concert saved! Add another, or check My Concerts / Dashboard.</span>
        </div>
      )}

      <section className="card bg-base-100 shadow-md border border-base-300">
        <div className="card-body gap-4">
          <div>
            <h2 className="card-title text-lg">Concert details</h2>
            <p className="text-sm text-base-content/60">
              Who you saw, where, and when
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Concert name"
              required
              help="A name you’ll recognize later"
            >
              <input
                className="input input-bordered w-full"
                value={form.concert_name}
                onChange={(e) => update("concert_name", e.target.value)}
                placeholder="Summer Stadium Night"
                required
              />
            </Field>
            <Field label="Artist or band" required>
              <input
                className="input input-bordered w-full"
                value={form.artist}
                onChange={(e) => update("artist", e.target.value)}
                placeholder="The Midnight Lights"
                required
              />
            </Field>
            <Field label="Venue" required>
              <input
                className="input input-bordered w-full"
                value={form.venue}
                onChange={(e) => update("venue", e.target.value)}
                placeholder="Main Street Amphitheater"
                required
              />
            </Field>
            <Field label="City" required>
              <input
                className="input input-bordered w-full"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Austin"
                required
              />
            </Field>
            <Field label="State" required>
              <input
                className="input input-bordered w-full"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                placeholder="TX"
                required
              />
            </Field>
            <Field label="Concert date" required>
              <input
                type="date"
                className="input input-bordered w-full"
                value={form.concert_date}
                onChange={(e) => update("concert_date", e.target.value)}
                required
              />
            </Field>
            <Field
              label="Distance from home (miles)"
              help="Rough estimate is fine"
            >
              <input
                type="number"
                min="0"
                step="any"
                className="input input-bordered w-full"
                value={form.distance_from_home}
                onChange={(e) => update("distance_from_home", e.target.value)}
              />
            </Field>
            <Field
              label="Hours at the event"
              required
              help="Used for cost-per-hour math"
            >
              <input
                type="number"
                min="0.1"
                step="any"
                className="input input-bordered w-full"
                value={form.hours_at_event}
                onChange={(e) => update("hours_at_event", e.target.value)}
                required
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes" help="Optional — setlist, friends, vibes…">
                <textarea
                  className="textarea textarea-bordered w-full min-h-24"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Anything else worth remembering"
                />
              </Field>
            </div>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md border border-base-300">
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="card-title text-lg">Costs</h2>
              <p className="text-sm text-base-content/60">
                Enter $0 for anything you didn’t spend
              </p>
            </div>
            <div className="badge badge-lg badge-primary badge-outline gap-1 py-3">
              Total: <strong>{formatCurrency(liveTotal)}</strong>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {COST_FIELDS.map(({ key, label }) => (
              <Field key={key} label={label}>
                <label className="input input-bordered flex items-center gap-2 w-full">
                  <span className="opacity-60">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="grow"
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </label>
              </Field>
            ))}
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md border border-base-300">
        <div className="card-body gap-4">
          <div>
            <h2 className="card-title text-lg">Fun rating</h2>
            <p className="text-sm text-base-content/60">
              How much fun was this show?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm font-medium">
              <span>1 — Terrible Time</span>
              <span className="text-primary text-lg font-bold">
                {form.fun_rating}/10
              </span>
              <span>10 — Best Time Ever</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              className="range range-primary"
              value={form.fun_rating}
              onChange={(e) => update("fun_rating", e.target.value)}
            />
            <div className="flex w-full justify-between px-1 text-xs opacity-50">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
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
        <span className="label-text font-medium">
          {label}
          {required && <span className="text-error"> *</span>}
        </span>
      </label>
      {children}
      {help && (
        <label className="label py-0">
          <span className="label-text-alt text-base-content/50">{help}</span>
        </label>
      )}
    </div>
  );
}
