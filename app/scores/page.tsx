import { AppShell } from "@/components/AppShell";
import { FunAveragesList } from "@/components/FunAveragesList";
import { requireUser } from "@/lib/auth";
import { mapRpcFunAverages } from "@/lib/metrics";

export default async function CommunityScoresPage() {
  const { supabase, user } = await requireUser();

  const [{ data: venues, error: venueError }, { data: artists, error: artistError }] =
    await Promise.all([
      supabase.rpc("venue_fun_averages"),
      supabase.rpc("artist_fun_averages"),
    ]);

  const venueRows = mapRpcFunAverages(
    (venues ?? []) as {
      name: string;
      avg_fun: number | string;
      show_count: number | string;
    }[]
  );
  const artistRows = mapRpcFunAverages(
    (artists ?? []) as {
      name: string;
      avg_fun: number | string;
      show_count: number | string;
    }[]
  );

  const loadError = venueError?.message || artistError?.message;

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Community scores</h2>
          <p className="text-base-content/60 text-sm sm:text-base max-w-2xl">
            Average fun scores from every concert logged by people using this
            app — so everyone can compare venues and artists. Personal ticket
            prices stay private.
          </p>
        </div>

        {loadError && (
          <div role="alert" className="alert alert-error">
            <span>Could not load community scores: {loadError}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <FunAveragesList
            title="Venue fun averages"
            subtitle="Community average venue fun score"
            rows={venueRows}
            emptyLabel="No venue scores yet. Be the first to log a concert!"
          />
          <FunAveragesList
            title="Concert fun by artist"
            subtitle="Community average concert fun for each artist"
            rows={artistRows}
            emptyLabel="No artist scores yet. Be the first to log a concert!"
          />
        </div>
      </div>
    </AppShell>
  );
}
