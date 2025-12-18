import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiFetch } from "../../lib/api";

type OverviewResponse = {
  days: number;
  start: string;
  totals: { scans: number; contacts: number };
  series: Array<{ day: string; scans: number; contacts: number }>;
};

type TopResponse = {
  items: Array<{
    qrCardId: string;
    label: string;
    publicId: string;
    scans: number;
  }>;
};

const DAYS_OPTIONS = [7, 14, 30] as const;

export default function Analytics() {
  const [days, setDays] = useState<(typeof DAYS_OPTIONS)[number]>(14);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [top, setTop] = useState<TopResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasAnyData = useMemo(
    () => (overview?.totals.scans ?? 0) + (overview?.totals.contacts ?? 0) > 0,
    [overview]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!cancelled) setError(null);
        const [o, t] = await Promise.all([
          apiFetch<OverviewResponse>(`/analytics/overview?days=${days}`),
          apiFetch<TopResponse>("/analytics/top"),
        ]);
        if (!cancelled) {
          setOverview(o);
          setTop(t);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load analytics");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Scans and contact events across your QR cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-slate-600">Range</p>
          <div className="flex rounded-md border border-slate-300 bg-white p-1">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                className={
                  "rounded px-2 py-1 text-xs font-medium " +
                  (days === d
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50")
                }
                onClick={() => setDays(d)}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Scans</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {overview ? overview.totals.scans : "…"}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Contact events</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {overview ? overview.totals.contacts : "…"}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Trend</h2>
        <p className="mt-1 text-sm text-slate-600">
          Daily activity over the last {days} days.
        </p>

        {!overview ? (
          <p className="mt-4 text-sm text-slate-600">Loading…</p>
        ) : !hasAnyData ? (
          <p className="mt-4 text-sm text-slate-600">No activity yet.</p>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview.series} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="scans"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="contacts"
                  stroke="#64748b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-md border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Top QR cards</h2>
        <p className="mt-1 text-sm text-slate-600">Most scanned cards.</p>

        {!top ? (
          <p className="mt-4 text-sm text-slate-600">Loading…</p>
        ) : top.items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No scans yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200">
            {top.items.map((item) => (
              <li
                key={item.qrCardId}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    /p/{item.publicId}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {item.scans}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
