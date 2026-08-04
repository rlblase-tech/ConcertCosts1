"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Concert } from "@/lib/types";
import {
  concertMetrics,
  formatCurrency,
  formatNumber,
  toNumber,
} from "@/lib/metrics";
import type { DashboardStats } from "@/lib/metrics";

const CHART_COLORS = [
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
];

type Props = {
  concerts: Concert[];
  stats: DashboardStats;
};

export function DashboardCharts({ concerts, stats }: Props) {
  const categoryData = [
    { name: "Tickets", value: stats.categoryTotals.ticket },
    { name: "Fees", value: stats.categoryTotals.fees },
    { name: "Parking", value: stats.categoryTotals.parking },
    { name: "Food & drink", value: stats.categoryTotals.food },
    { name: "Merch", value: stats.categoryTotals.merch },
    { name: "Lodging", value: stats.categoryTotals.lodging },
    { name: "Travel", value: stats.categoryTotals.travel },
    { name: "Other", value: stats.categoryTotals.other },
  ].filter((d) => d.value > 0);

  const byConcert = concerts.map((c) => {
    const m = concertMetrics(c);
    const short =
      c.concert_name.length > 16
        ? c.concert_name.slice(0, 14) + "…"
        : c.concert_name;
    return {
      name: short,
      fullName: c.concert_name,
      total: m.total,
      fun: toNumber(c.fun_rating),
      funPer100: m.funPointsPer100 ?? 0,
    };
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Spending by cost category">
        {categoryData.length === 0 ? (
          <ChartEmpty />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" name="Spent" radius={[6, 6, 0, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Total cost by concert">
        {byConcert.length === 0 ? (
          <ChartEmpty />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byConcert} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
                labelFormatter={(_, payload) =>
                  String(payload?.[0]?.payload?.fullName ?? "")
                }
              />
              <Bar dataKey="total" name="Total cost" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Fun rating by concert">
        {byConcert.length === 0 ? (
          <ChartEmpty />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byConcert} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => `${v}/10`}
                labelFormatter={(_, payload) =>
                  String(payload?.[0]?.payload?.fullName ?? "")
                }
              />
              <Bar dataKey="fun" name="Fun rating" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Fun Points per $100 by concert">
        {byConcert.length === 0 ? (
          <ChartEmpty />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byConcert} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => formatNumber(Number(v), 2)}
                labelFormatter={(_, payload) =>
                  String(payload?.[0]?.payload?.fullName ?? "")
                }
              />
              <Bar
                dataKey="funPer100"
                name="Fun Points per $100"
                fill={CHART_COLORS[2]}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-300">
      <div className="card-body">
        <h3 className="card-title text-base sm:text-lg">{title}</h3>
        <div className="w-full min-h-[280px]">{children}</div>
      </div>
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-base-content/50">
      No data to chart yet
    </div>
  );
}
