import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiFetch } from "../../lib/api";

type InventoryItem = {
  id: string;
  label: string;
  publicId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  scans: number;
  contacts: number;
  lastActivityAt: string | null;
};

type InventoryResponse = {
  items: InventoryItem[];
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function Inventory() {
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const items = data?.items ?? [];
    return {
      cards: items.length,
      active: items.filter((i: InventoryItem) => i.isActive).length,
      scans: items.reduce(
        (acc: number, i: InventoryItem) => acc + (i.scans ?? 0),
        0
      ),
      contacts: items.reduce(
        (acc: number, i: InventoryItem) => acc + (i.contacts ?? 0),
        0
      ),
    };
  }, [data]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch<InventoryResponse>("/inventory/qr-cards");
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load inventory");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Your QR cards and their performance at a glance.
          </p>
        </div>

        <Link
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          to="/app/qr"
        >
          Manage QR cards
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Cards</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data ? totals.cards : "…"}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Active</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data ? totals.active : "…"}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Scans</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data ? totals.scans : "…"}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Contact events</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data ? totals.contacts : "…"}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-slate-200">
        {!data ? (
          <div className="p-4">
            <p className="text-sm text-slate-600">Loading…</p>
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-4">
            <p className="text-sm text-slate-600">No QR cards yet.</p>
            <Link
              className="mt-2 inline-block text-sm text-blue-700 underline hover:text-blue-800"
              to="/app/qr"
            >
              Create your first QR card
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {data.items.map((item: InventoryItem) => (
              <li key={item.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {item.isActive ? "Active" : "Inactive"} · /p/
                      {item.publicId}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-50"
                      to={`/p/${item.publicId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open public page
                    </Link>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">Scans</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {item.scans}
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">Contacts</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {item.contacts}
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 sm:col-span-2">
                    <p className="text-xs text-slate-600">Last activity</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDate(item.lastActivityAt)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
