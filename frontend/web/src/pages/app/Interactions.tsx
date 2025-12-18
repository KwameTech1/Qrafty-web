import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiFetch } from "../../lib/api";

type InteractionItem = {
  id: string;
  type: "SCAN" | "CONTACT";
  occurredAt: string;
  referrer: string | null;
  userAgent: string | null;
  qrCard: { id: string; label: string; publicId: string };
};

type InteractionsResponse = {
  items: InteractionItem[];
  nextCursor: string | null;
};

function formatOccurredAt(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function compactReferrer(referrer: string | null) {
  if (!referrer) return "Direct";
  try {
    const url = new URL(referrer);
    return url.host;
  } catch {
    return referrer;
  }
}

export default function Interactions() {
  const [items, setItems] = useState<InteractionItem[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const list = items ?? [];
    return {
      scans: list.filter((i) => i.type === "SCAN").length,
      contacts: list.filter((i) => i.type === "CONTACT").length,
    };
  }, [items]);

  const load = async (cursor?: string) => {
    const url = new URLSearchParams();
    url.set("limit", "50");
    if (cursor) url.set("cursor", cursor);
    return apiFetch<InteractionsResponse>(`/interactions?${url.toString()}`);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await load();
        if (!cancelled) {
          setItems(res.items);
          setNextCursor(res.nextCursor);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const onLoadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    setError(null);
    try {
      const res = await load(nextCursor);
      setItems((prev) => [
        ...((prev ?? []) as InteractionItem[]),
        ...res.items,
      ]);
      setNextCursor(res.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Interactions
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Scans and contact events across your QR cards.
          </p>
        </div>

        <Link
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          to="/app/analytics"
        >
          View analytics
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Scans</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {items ? totals.scans : "…"}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Contact events</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {items ? totals.contacts : "…"}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-4 sm:col-span-2">
          <p className="text-sm text-slate-600">What is a contact event?</p>
          <p className="mt-1 text-sm text-slate-700">
            A visitor tapped the Contact button on your public profile.
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-slate-200">
        {!items ? (
          <div className="p-4">
            <p className="text-sm text-slate-600">Loading…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-4">
            <p className="text-sm text-slate-600">No activity yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {items.map((item) => (
              <li key={item.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {item.type === "SCAN" ? "Scan" : "Contact"} ·{" "}
                      {item.qrCard.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {formatOccurredAt(item.occurredAt)} ·{" "}
                      {compactReferrer(item.referrer)}
                    </p>
                  </div>

                  <Link
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-50"
                    to={`/p/${item.qrCard.publicId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View public page
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items && nextCursor ? (
        <div className="mt-4">
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
            onClick={() => void onLoadMore()}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
