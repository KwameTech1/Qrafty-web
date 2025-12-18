import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiFetch } from "../../lib/api";

type BusinessDetail = {
  id: string;
  name: string;
  description: string | null;
  industry: string;
  location: string;
  startingPrice: number | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; email: string; displayName: string | null };
};

type DetailResponse = { item: BusinessDetail };

export default function MarketplaceDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<BusinessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!id) {
          setItem(null);
          return;
        }
        setLoading(true);
        setError(null);
        const data = await apiFetch<DetailResponse>(
          `/marketplace/businesses/${id}`
        );
        if (!cancelled) setItem(data.item);
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
  }, [id]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-red-600">{error}</div>
        <Link className="text-sm underline" to="/app/marketplace">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Not found.</div>
        <Link className="text-sm underline" to="/app/marketplace">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link className="text-sm underline" to="/app/marketplace">
          Back to Marketplace
        </Link>
        <h1 className="text-xl font-semibold">{item.name}</h1>
        <div className="text-sm text-muted-foreground">
          {item.industry} · {item.location}
          {item.startingPrice !== null ? ` · from $${item.startingPrice}` : ""}
        </div>
      </div>

      {item.description ? (
        <div className="rounded-lg border bg-card p-4 text-sm leading-relaxed">
          {item.description}
        </div>
      ) : null}

      <div className="rounded-lg border bg-card p-4 text-sm">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div>
            <div className="text-muted-foreground">Website</div>
            {item.website ? (
              <a
                className="underline"
                href={item.website}
                target="_blank"
                rel="noreferrer"
              >
                {item.website}
              </a>
            ) : (
              <div className="text-muted-foreground">—</div>
            )}
          </div>
          <div>
            <div className="text-muted-foreground">Owner</div>
            <div>{item.owner?.displayName ?? item.owner?.email ?? "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
