import type { Concert, ConcertCosts } from "@/lib/types";

export function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function totalCost(costs: ConcertCosts): number {
  return (
    toNumber(costs.ticket_cost) +
    toNumber(costs.ticket_fees) +
    toNumber(costs.parking_cost) +
    toNumber(costs.food_drink_cost) +
    toNumber(costs.merchandise_cost) +
    toNumber(costs.lodging_cost) +
    toNumber(costs.travel_cost) +
    toNumber(costs.other_cost)
  );
}

/** Cost per hour. Returns null when hours are zero or missing. */
export function costPerHour(total: number, hours: number): number | null {
  const h = toNumber(hours);
  if (h <= 0) return null;
  return total / h;
}

/**
 * Fun Points per $100 = (fun rating / total cost) * 100
 * Higher = better value. Returns null when total cost is zero.
 */
export function funPointsPer100(funRating: number, total: number): number | null {
  if (total <= 0) return null;
  return (toNumber(funRating) / total) * 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export type ConcertMetrics = {
  total: number;
  costPerHour: number | null;
  funPointsPer100: number | null;
};

export function concertMetrics(concert: ConcertCosts & {
  hours_at_event: number;
  fun_rating: number;
}): ConcertMetrics {
  const total = totalCost(concert);
  return {
    total,
    costPerHour: costPerHour(total, concert.hours_at_event),
    funPointsPer100: funPointsPer100(concert.fun_rating, total),
  };
}

export type DashboardStats = {
  totalConcerts: number;
  totalSpent: number;
  avgCost: number | null;
  avgFun: number | null;
  avgCostPerHour: number | null;
  bestValue: Concert | null;
  mostExpensive: Concert | null;
  highestFun: Concert | null;
  categoryTotals: {
    ticket: number;
    fees: number;
    parking: number;
    food: number;
    merch: number;
    lodging: number;
    travel: number;
    other: number;
  };
};

export function computeDashboardStats(concerts: Concert[]): DashboardStats {
  const emptyCategories = {
    ticket: 0,
    fees: 0,
    parking: 0,
    food: 0,
    merch: 0,
    lodging: 0,
    travel: 0,
    other: 0,
  };

  if (concerts.length === 0) {
    return {
      totalConcerts: 0,
      totalSpent: 0,
      avgCost: null,
      avgFun: null,
      avgCostPerHour: null,
      bestValue: null,
      mostExpensive: null,
      highestFun: null,
      categoryTotals: emptyCategories,
    };
  }

  const withMetrics = concerts.map((c) => ({
    concert: c,
    metrics: concertMetrics(c),
  }));

  const totalSpent = withMetrics.reduce((sum, x) => sum + x.metrics.total, 0);
  const avgFun =
    withMetrics.reduce((sum, x) => sum + toNumber(x.concert.fun_rating), 0) /
    concerts.length;

  const hourCosts = withMetrics
    .map((x) => x.metrics.costPerHour)
    .filter((v): v is number => v !== null);
  const avgCostPerHour =
    hourCosts.length > 0
      ? hourCosts.reduce((a, b) => a + b, 0) / hourCosts.length
      : null;

  const withValue = withMetrics.filter((x) => x.metrics.funPointsPer100 !== null);
  const bestValue =
    withValue.length > 0
      ? withValue.reduce((best, cur) =>
          (cur.metrics.funPointsPer100 ?? -1) > (best.metrics.funPointsPer100 ?? -1)
            ? cur
            : best
        ).concert
      : null;

  const mostExpensive = withMetrics.reduce((best, cur) =>
    cur.metrics.total > best.metrics.total ? cur : best
  ).concert;

  const highestFun = withMetrics.reduce((best, cur) =>
    toNumber(cur.concert.fun_rating) > toNumber(best.concert.fun_rating)
      ? cur
      : best
  ).concert;

  const categoryTotals = concerts.reduce(
    (acc, c) => ({
      ticket: acc.ticket + toNumber(c.ticket_cost),
      fees: acc.fees + toNumber(c.ticket_fees),
      parking: acc.parking + toNumber(c.parking_cost),
      food: acc.food + toNumber(c.food_drink_cost),
      merch: acc.merch + toNumber(c.merchandise_cost),
      lodging: acc.lodging + toNumber(c.lodging_cost),
      travel: acc.travel + toNumber(c.travel_cost),
      other: acc.other + toNumber(c.other_cost),
    }),
    emptyCategories
  );

  return {
    totalConcerts: concerts.length,
    totalSpent,
    avgCost: totalSpent / concerts.length,
    avgFun,
    avgCostPerHour,
    bestValue,
    mostExpensive,
    highestFun,
    categoryTotals,
  };
}

export type FunAverageRow = {
  name: string;
  avgFun: number;
  count: number;
};

/**
 * Average fun score grouped by artist or venue.
 * - artist group uses concert fun (fun_rating)
 * - venue group uses venue_fun_rating
 */
export function averageFunBy(
  concerts: Concert[],
  key: "artist" | "venue"
): FunAverageRow[] {
  const groups = new Map<string, { sum: number; count: number }>();

  for (const c of concerts) {
    const name = (c[key] ?? "").trim();
    if (!name) continue;
    const rating = toNumber(
      key === "venue"
        ? (c.venue_fun_rating ?? c.fun_rating)
        : c.fun_rating
    );
    const prev = groups.get(name) ?? { sum: 0, count: 0 };
    groups.set(name, {
      sum: prev.sum + rating,
      count: prev.count + 1,
    });
  }

  return Array.from(groups.entries())
    .map(([name, { sum, count }]) => ({
      name,
      avgFun: sum / count,
      count,
    }))
    .sort((a, b) => b.avgFun - a.avgFun || a.name.localeCompare(b.name));
}

/** Map RPC rows from venue_fun_averages / artist_fun_averages */
export function mapRpcFunAverages(
  rows: { name: string; avg_fun: number | string; show_count: number | string }[] | null
): FunAverageRow[] {
  if (!rows) return [];
  return rows
    .map((r) => ({
      name: r.name,
      avgFun: toNumber(r.avg_fun),
      count: toNumber(r.show_count),
    }))
    .sort((a, b) => b.avgFun - a.avgFun || a.name.localeCompare(b.name));
}
