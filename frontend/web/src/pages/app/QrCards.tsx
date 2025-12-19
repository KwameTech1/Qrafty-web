import { useEffect, useMemo, useState, type FormEvent } from "react";
import QRCode from "qrcode";

import { apiFetch, getApiUrl } from "../../lib/api";

type Card = {
  id: string;
  label: string;
  publicId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = { items: Card[] };

type CreateResponse = { item: Card };

type PatchResponse = { item: Card };

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export default function QrCards() {
  const [items, setItems] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [label, setLabel] = useState("My QR Card");
  const [creating, setCreating] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => items.find((c) => c.id === selectedId) ?? null,
    [items, selectedId]
  );

  const publicUrl = selected
    ? `${window.location.origin}/p/${selected.publicId}`
    : null;
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ListResponse>("/qr-cards");
      setItems(data.items);
      setSelectedId((prev) => prev ?? data.items[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!publicUrl) {
        setQrDataUrl(null);
        return;
      }

      try {
        const url = await QRCode.toDataURL(publicUrl, {
          margin: 1,
          width: 320,
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        if (!cancelled) setQrDataUrl(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicUrl]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const data = await apiFetch<CreateResponse>("/qr-cards", {
        method: "POST",
        body: JSON.stringify({ label }),
      });
      setItems((prev) => [data.item, ...prev]);
      setSelectedId(data.item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const onToggleActive = async (card: Card) => {
    setError(null);
    const next = !card.isActive;

    setItems((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, isActive: next } : c))
    );

    try {
      const data = await apiFetch<PatchResponse>(`/qr-cards/${card.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: next }),
      });
      setItems((prev) => prev.map((c) => (c.id === card.id ? data.item : c)));
    } catch (e) {
      setItems((prev) => prev.map((c) => (c.id === card.id ? card : c)));
      setError(e instanceof Error ? e.message : "Update failed");
    }
  };

  const onDelete = async (card: Card) => {
    setError(null);
    const ok = window.confirm("Delete this QR card?");
    if (!ok) return;

    setItems((prev) => prev.filter((c) => c.id !== card.id));
    setSelectedId((prev) => (prev === card.id ? null : prev));

    try {
      await apiFetch<void>(`/qr-cards/${card.id}`, { method: "DELETE" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      void load();
    }
  };

  const onDownload = async () => {
    if (!selected || !publicUrl) return;
    setDownloading(true);
    try {
      const qrPng = await QRCode.toDataURL(publicUrl, {
        margin: 1,
        width: 900,
      });

      const cardWidth = 1200;
      const cardHeight = 1600;
      const padding = 72;
      const headerHeight = 180;
      const radius = 40;

      const canvas = document.createElement("canvas");
      canvas.width = cardWidth;
      canvas.height = cardHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // Card
      drawRoundedRect(
        ctx,
        padding,
        padding,
        cardWidth - padding * 2,
        cardHeight - padding * 2,
        radius
      );
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#e2e8f0"; // slate-200
      ctx.stroke();

      // Header band
      drawRoundedRect(
        ctx,
        padding,
        padding,
        cardWidth - padding * 2,
        headerHeight,
        radius
      );
      ctx.fillStyle = "#2563eb"; // blue-600
      ctx.fill();

      // Logo mark (simple Q badge to match app)
      const badgeSize = 72;
      const badgeX = padding + 40;
      const badgeY = padding + 54;
      drawRoundedRect(ctx, badgeX, badgeY, badgeSize, badgeSize, 16);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.stroke();
      ctx.fillStyle = "#0f172a"; // slate-900
      ctx.font =
        "700 40px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      ctx.textBaseline = "middle";
      ctx.fillText("Q", badgeX + 24, badgeY + badgeSize / 2 + 1);

      // Brand text
      ctx.fillStyle = "#ffffff";
      ctx.font =
        "700 44px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("QRAFTY", badgeX + badgeSize + 24, padding + 104);

      // Subtitle
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font =
        "500 26px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      ctx.fillText(
        "Scan to open your profile",
        badgeX + badgeSize + 24,
        padding + 148
      );

      // Title (label)
      const titleY = padding + headerHeight + 88;
      ctx.fillStyle = "#0f172a";
      ctx.font =
        "700 46px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      ctx.fillText(selected.label, padding + 40, titleY);

      // URL
      const urlY = titleY + 46;
      ctx.fillStyle = "#475569"; // slate-600
      ctx.font =
        "500 28px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      ctx.fillText(publicUrl, padding + 40, urlY);

      // QR frame
      const qrFrameSize = 820;
      const qrFrameX = Math.round((cardWidth - qrFrameSize) / 2);
      const qrFrameY = padding + headerHeight + 200;
      drawRoundedRect(ctx, qrFrameX, qrFrameY, qrFrameSize, qrFrameSize, 28);
      ctx.fillStyle = "#f8fafc"; // slate-50
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#e2e8f0";
      ctx.stroke();

      // Load and draw QR
      const img = new Image();
      img.decoding = "async";
      img.src = qrPng;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load QR image"));
      });

      const qrSize = 720;
      const qrX = Math.round((cardWidth - qrSize) / 2);
      const qrY = qrFrameY + Math.round((qrFrameSize - qrSize) / 2);
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Footer hint
      ctx.fillStyle = "#64748b"; // slate-500
      ctx.font =
        "500 26px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "Powered by QRAFTY",
        cardWidth / 2,
        cardHeight - padding - 32
      );
      ctx.textAlign = "start";

      const safeLabel = selected.label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const filename = `${safeLabel || "qrafty"}-${selected.publicId}-card.png`;

      const dataUrl = canvas.toDataURL("image/png");

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        QR Editor
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Create QR cards that link to your public profile.
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <section className="rounded-md border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Create new</h2>
          <form className="mt-3 space-y-3" onSubmit={onCreate}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Label
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={60}
                required
              />
            </div>
            <button
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              type="submit"
              disabled={creating}
            >
              {creating ? "Creating…" : "Create QR card"}
            </button>
          </form>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-900">Your cards</h2>
            {loading ? (
              <p className="mt-2 text-sm text-slate-600">Loading…</p>
            ) : items.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No QR cards yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {items.map((card) => (
                  <li
                    key={card.id}
                    className={
                      "rounded-md border p-3 " +
                      (selectedId === card.id
                        ? "border-blue-600"
                        : "border-slate-200")
                    }
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => setSelectedId(card.id)}
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {card.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {card.isActive ? "Active" : "Inactive"} ·{" "}
                        {card.publicId}
                      </p>
                    </button>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-50"
                        onClick={() => void onToggleActive(card)}
                      >
                        {card.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-50"
                        onClick={() => void onDelete(card)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-md border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Preview</h2>
          {!selected ? (
            <p className="mt-2 text-sm text-slate-600">Select a QR card.</p>
          ) : (
            <>
              <div className="mt-3 grid gap-3 sm:grid-cols-[180px_1fr] sm:items-start">
                <div>
                  <div className="rounded-md border border-slate-200 bg-white p-3">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`QR code for ${selected.label}`}
                        className="h-auto w-full"
                      />
                    ) : (
                      <p className="text-sm text-slate-600">Generating…</p>
                    )}
                  </div>

                  <button
                    className="mt-3 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    type="button"
                    onClick={() => void onDownload()}
                    disabled={!qrDataUrl || downloading}
                  >
                    {downloading ? "Preparing…" : "Download QR Card"}
                  </button>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {selected.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Public link</p>
                  <a
                    className="mt-1 block break-all text-sm text-blue-700 underline hover:text-blue-800"
                    href={publicUrl ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {publicUrl}
                  </a>

                  <p className="mt-4 text-sm text-slate-600">API base</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {getApiUrl()}
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
