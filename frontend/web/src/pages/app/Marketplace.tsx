import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "../../lib/api";

type Business = {
  id: string;
  name: string;
  description: string | null;
  industry: string;
  location: string;
  startingPrice: number | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = { items: Business[]; nextCursor: string | null };

export default function Marketplace() {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [items, setItems] = useState<Business[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (industry.trim()) params.set("industry", industry.trim());
    if (location.trim()) params.set("location", location.trim());
    if (minPrice.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    params.set("limit", "20");
    return params.toString();
  }, [q, industry, location, minPrice, maxPrice]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<ListResponse>(
          `/marketplace/businesses?${queryString}`
        );
        if (cancelled) return;
        setItems(data.items);
        setNextCursor(data.nextCursor);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const params = new URLSearchParams(queryString);
      params.set("cursor", nextCursor);
      const data = await apiFetch<ListResponse>(
        `/marketplace/businesses?${params.toString()}`
      );
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Marketplace</h1>
        <p className="text-sm text-muted-foreground">
          Discover businesses and view profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm md:col-span-2"
          placeholder="Search name or description"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm"
          placeholder="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm"
            placeholder="Min $"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm"
            placeholder="Max $"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No results.</div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <Link
              key={b.id}
              to={`/app/marketplace/${b.id}`}
              className="block rounded-lg border bg-card p-4 hover:bg-accent"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {b.industry} · {b.location}
                    {b.startingPrice !== null
                      ? ` · from $${b.startingPrice}`
                      : ""}
                  </div>
                </div>
              </div>
              {b.description ? (
                <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {b.description}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      )}

      <div>
        <button
          className="h-10 rounded-md border bg-background px-4 text-sm disabled:opacity-50"
          disabled={!nextCursor || loadingMore}
          onClick={loadMore}
        >
          {loadingMore ? "Loading…" : nextCursor ? "Load more" : "End"}
        </button>
      </div>
    </div>
  );
}
