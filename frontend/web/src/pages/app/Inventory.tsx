import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiFetch } from "../../lib/api";

type ProductFormState = {
  label: string;
  isActive: boolean;
};

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
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProductFormState>({
    label: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<InventoryResponse>("/inventory/qr-cards");
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add product handler
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/inventory/qr-cards", {
        method: "POST",
        body: JSON.stringify(formState),
        headers: { "Content-Type": "application/json" },
      });
      setShowAdd(false);
      setFormState({ label: "", isActive: true });
      fetchData();
    } catch (err) {
      setError("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  // Edit product handler
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    setLoading(true);
    try {
      await apiFetch(`/inventory/qr-cards/${showEdit}`, {
        method: "PUT",
        body: JSON.stringify(formState),
        headers: { "Content-Type": "application/json" },
      });
      setShowEdit(null);
      setFormState({ label: "", isActive: true });
      fetchData();
    } catch (err) {
      setError("Failed to edit product");
    } finally {
      setLoading(false);
    }
  };

  // Delete product handler
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setLoading(true);
    try {
      await apiFetch(`/inventory/qr-cards/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      setError("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal and populate form
  const openEdit = (item: InventoryItem) => {
    setShowEdit(item.id);
    setFormState({ label: item.label, isActive: item.isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Inventory
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your QR cards and track their performance.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            onClick={() => setShowAdd(true)}
            disabled={loading}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Product
          </button>
          <Link
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            to="/app/qr"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Manage QR Cards
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Cards</p>
              <p className="text-2xl font-bold text-slate-900">
                {data ? totals.cards : "…"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Active</p>
              <p className="text-2xl font-bold text-slate-900">
                {data ? totals.active : "…"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Scans</p>
              <p className="text-2xl font-bold text-slate-900">
                {data ? totals.scans : "…"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-100">
              <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Contacts</p>
              <p className="text-2xl font-bold text-slate-900">
                {data ? totals.contacts : "…"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-slate-200">
        {loading ? (
          <div className="p-4">
            <p className="text-sm text-slate-600">Loading…</p>
          </div>
        ) : !data ? (
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
                    <button
                      className="rounded-md border border-slate-300 bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-900 hover:bg-yellow-200"
                      onClick={() => openEdit(item)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-md border border-slate-300 bg-red-100 px-3 py-1.5 text-xs font-medium text-red-900 hover:bg-red-200"
                      onClick={() => handleDelete(item.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
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

      {/* Add Product Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <form
            className="bg-white rounded-md p-6 shadow-md w-full max-w-sm"
            onSubmit={handleAdd}
          >
            <h2 className="text-lg font-semibold mb-4">Add Product</h2>
            <label className="block mb-2 text-sm">Label</label>
            <input
              className="w-full mb-4 p-2 border border-slate-300 rounded"
              type="text"
              value={formState.label}
              onChange={(e) =>
                setFormState((f) => ({ ...f, label: e.target.value }))
              }
              required
            />
            <label className="block mb-2 text-sm">Active</label>
            <select
              className="w-full mb-4 p-2 border border-slate-300 rounded"
              value={formState.isActive ? "true" : "false"}
              onChange={(e) =>
                setFormState((f) => ({
                  ...f,
                  isActive: e.target.value === "true",
                }))
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-3 py-2 rounded bg-slate-200"
                onClick={() => setShowAdd(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 rounded bg-green-600 text-white"
                disabled={loading}
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <form
            className="bg-white rounded-md p-6 shadow-md w-full max-w-sm"
            onSubmit={handleEdit}
          >
            <h2 className="text-lg font-semibold mb-4">Edit Product</h2>
            <label className="block mb-2 text-sm">Label</label>
            <input
              className="w-full mb-4 p-2 border border-slate-300 rounded"
              type="text"
              value={formState.label}
              onChange={(e) =>
                setFormState((f) => ({ ...f, label: e.target.value }))
              }
              required
            />
            <label className="block mb-2 text-sm">Active</label>
            <select
              className="w-full mb-4 p-2 border border-slate-300 rounded"
              value={formState.isActive ? "true" : "false"}
              onChange={(e) =>
                setFormState((f) => ({
                  ...f,
                  isActive: e.target.value === "true",
                }))
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-3 py-2 rounded bg-slate-200"
                onClick={() => setShowEdit(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 rounded bg-yellow-600 text-white"
                disabled={loading}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
