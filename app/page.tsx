import { redirect } from "next/navigation";
import {
  DollarSign,
  Heart,
  Music2,
  Star,
  Timer,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { DashboardCharts } from "@/components/charts/DashboardCharts";
import { createClient } from "@/lib/supabase/server";
import {
  concertMetrics,
  computeDashboardStats,
  formatCurrency,
  formatNumber,
} from "@/lib/metrics";
import type { Concert } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  const concerts = (data ?? []) as Concert[];
  const stats = computeDashboardStats(concerts);

  const bestValueMetrics = stats.bestValue
    ? concertMetrics(stats.bestValue)
    : null;
  const mostExpensiveMetrics = stats.mostExpensive
    ? concertMetrics(stats.mostExpensive)
    : null;

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-base-content/60 text-sm sm:text-base">
            Snapshots of your spend, fun, and best-value shows
          </p>
        </div>

        {error && (
          <div role="alert" className="alert alert-error">
            <span>Could not load concerts: {error.message}</span>
          </div>
        )}

        {concerts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total concerts"
                value={String(stats.totalConcerts)}
                icon={<Music2 className="h-4 w-4" />}
              />
              <StatCard
                label="Total spent"
                value={formatCurrency(stats.totalSpent)}
                icon={<Wallet className="h-4 w-4" />}
                accent
              />
              <StatCard
                label="Avg cost / concert"
                value={
                  stats.avgCost !== null ? formatCurrency(stats.avgCost) : "—"
                }
                icon={<DollarSign className="h-4 w-4" />}
              />
              <StatCard
                label="Avg fun rating"
                value={
                  stats.avgFun !== null
                    ? `${formatNumber(stats.avgFun, 1)} / 10`
                    : "—"
                }
                icon={<Star className="h-4 w-4" />}
              />
              <StatCard
                label="Avg cost per hour"
                value={
                  stats.avgCostPerHour !== null
                    ? formatCurrency(stats.avgCostPerHour)
                    : "—"
                }
                icon={<Timer className="h-4 w-4" />}
              />
              <StatCard
                label="Best value concert"
                value={stats.bestValue?.concert_name ?? "—"}
                hint={
                  bestValueMetrics?.funPointsPer100 != null
                    ? `${formatNumber(bestValueMetrics.funPointsPer100, 2)} fun pts / $100`
                    : undefined
                }
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <StatCard
                label="Most expensive"
                value={stats.mostExpensive?.concert_name ?? "—"}
                hint={
                  mostExpensiveMetrics
                    ? formatCurrency(mostExpensiveMetrics.total)
                    : undefined
                }
                icon={<Trophy className="h-4 w-4" />}
              />
              <StatCard
                label="Highest fun rating"
                value={stats.highestFun?.concert_name ?? "—"}
                hint={
                  stats.highestFun
                    ? `${stats.highestFun.fun_rating}/10 fun`
                    : undefined
                }
                icon={<Heart className="h-4 w-4" />}
              />
            </div>

            <DashboardCharts concerts={concerts} stats={stats} />
          </>
        )}
      </div>
    </AppShell>
  );
}
