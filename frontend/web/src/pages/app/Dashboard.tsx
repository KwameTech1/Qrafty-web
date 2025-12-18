import { useEffect, useState } from "react";

import { apiFetch } from "../../lib/api";

type OverviewResponse = {
  totals: {
    qrCards: number;
    interactions: number;
  };
  recentInteractions: Array<{
    id: string;
    type: "SCAN" | "CONTACT";
    occurredAt: string;
    referrer: string | null;
    userAgent: string | null;
    qrCard: { id: string; label: string; publicId: string };
  }>;
};

export default function Dashboard() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch<OverviewResponse>("/dashboard/overview");
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Overview of your QR cards and recent activity.
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm text-slate-600">QR cards</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data ? data.totals.qrCards : "…"}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total interactions</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data ? data.totals.interactions : "…"}
          </p>
        </div>
      </div>

      <h2 className="mt-6 text-sm font-semibold text-slate-900">
        Recent interactions
      </h2>
      <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
        {data && data.recentInteractions.length === 0 ? (
          <div className="p-4">
            <p className="text-sm text-slate-600">No activity yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {(data?.recentInteractions ?? Array.from({ length: 3 })).map(
              (item, idx) => (
                <li key={data ? item.id : idx} className="p-4">
                  <p className="text-sm font-medium text-slate-900">
                    {data ? item.type : "…"} · {data ? item.qrCard.label : "…"}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {data
                      ? new Date(item.occurredAt).toLocaleString()
                      : "Loading…"}
                  </p>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
