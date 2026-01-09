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
        <div className="flex gap-2">
          <button
            className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            onClick={() => setShowAdd(true)}
            disabled={loading}
          >
            Add Product
          </button>
          <Link
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            to="/app/qr"
          >
            Manage QR cards
          </Link>
        </div>
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
