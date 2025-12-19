import { useEffect, useMemo, useState, type FormEvent } from "react";

import { apiFetch } from "../../lib/api";

type BusinessProfile = {
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

type GetMeResponse = { item: BusinessProfile | null };

type UpsertResponse = { item: BusinessProfile };

function toNullableInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.trunc(n));
}

export default function BusinessProfilePage() {
  const [item, setItem] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  const isExisting = Boolean(item?.id);

  const canDelete = useMemo(
    () => Boolean(item?.id) && !deleting,
    [item, deleting]
  );

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch<GetMeResponse>("/marketplace/me");
      setItem(res.item);

      if (res.item) {
        setName(res.item.name);
        setIndustry(res.item.industry);
        setLocation(res.item.location);
        setStartingPrice(
          res.item.startingPrice === null ? "" : String(res.item.startingPrice)
        );
        setWebsite(res.item.website ?? "");
        setDescription(res.item.description ?? "");
      } else {
        setName("");
        setIndustry("");
        setLocation("");
        setStartingPrice("");
        setWebsite("");
        setDescription("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      industry,
      location,
      startingPrice: toNullableInt(startingPrice),
      website: website.trim() ? website.trim() : null,
      description: description.trim() ? description.trim() : null,
    };

    try {
      const res = item
        ? await apiFetch<UpsertResponse>(`/marketplace/me/${item.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await apiFetch<UpsertResponse>("/marketplace/me", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      setItem(res.item);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!item) return;
    const ok = window.confirm(
      "Delete your business profile? This will remove it from the marketplace."
    );
    if (!ok) return;

    setDeleting(true);
    setError(null);
    try {
      await apiFetch<void>(`/marketplace/me/${item.id}`, { method: "DELETE" });
      setItem(null);
      setName("");
      setIndustry("");
      setLocation("");
      setStartingPrice("");
      setWebsite("");
      setDescription("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        Business profile
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Manage the profile shown in the Marketplace.
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-slate-600">Loading…</p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Business name
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Industry
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
                maxLength={60}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Location
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                maxLength={80}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Starting price (optional)
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 250"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Website (optional)
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Description (optional)
              </label>
              <textarea
                className="mt-1 min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={800}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : isExisting
                  ? "Save changes"
                  : "Create profile"}
            </button>

            {isExisting ? (
              <button
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                type="button"
                onClick={() => void load()}
                disabled={saving || deleting}
              >
                Refresh
              </button>
            ) : null}

            {isExisting ? (
              <button
                className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                type="button"
                onClick={() => void onDelete()}
                disabled={!canDelete || saving}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            ) : null}
          </div>

          {isExisting ? (
            <p className="text-xs text-slate-500">
              Changes appear in Marketplace after saving.
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Create a business profile to appear in Marketplace.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
