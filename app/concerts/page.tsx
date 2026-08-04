import { AppShell } from "@/components/AppShell";
import { ConcertCard } from "@/components/ConcertCard";
import { EmptyState } from "@/components/EmptyState";
import { requireUser } from "@/lib/auth";
import type { Concert } from "@/lib/types";

export default async function MyConcertsPage() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  const concerts = (data ?? []) as Concert[];

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">My Concerts</h2>
            <p className="text-base-content/60 text-sm sm:text-base">
              Every show you&apos;ve logged — use Edit scores to change your
              ratings. Only you can see these concerts.
            </p>
          </div>
          {concerts.length > 0 && (
            <span className="badge badge-lg badge-outline">
              {concerts.length} concert{concerts.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {error && (
          <div role="alert" className="alert alert-error">
            <span>Could not load concerts: {error.message}</span>
          </div>
        )}

        {concerts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {concerts.map((c) => (
              <ConcertCard key={c.id} concert={c} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
