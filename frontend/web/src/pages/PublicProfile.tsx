import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";

import { apiFetch, getApiUrl } from "../lib/api";
import Footer from "../components/Footer";

type PublicResponse = {
  qrCard: { id: string; label: string; publicId: string };
  profile: {
    displayName: string | null;
    email: string;
    bio: string | null;
    phone: string | null;
    website: string | null;
    company: string | null;
    title: string | null;
    location: string | null;
  };
};

export default function PublicProfile() {
  const { publicId } = useParams();
  const [data, setData] = useState<PublicResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const trackContact = () => {
    if (!publicId) return;
    const url = `${getApiUrl()}/public/qr/${publicId}/contact`;

    try {
      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        const blob = new Blob([], { type: "text/plain" });
        navigator.sendBeacon(url, blob);
        return;
      }
    } catch {
      // ignore
    }

    try {
      void fetch(url, { method: "POST", keepalive: true });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch<PublicResponse>(`/public/qr/${publicId}`);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load profile");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!publicId || typeof window === "undefined") {
        setQrDataUrl(null);
        return;
      }

      const url = `${window.location.origin}/p/${publicId}`;

      try {
        const dataUrl = await QRCode.toDataURL(url, {
          margin: 1,
          width: 240,
        });
        if (!cancelled) setQrDataUrl(dataUrl);
      } catch {
        if (!cancelled) setQrDataUrl(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicId]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col bg-white">
        <div className="flex-1 p-6">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
            <Link
              className="mt-4 inline-block text-sm text-blue-700 underline hover:text-blue-800"
              to="/"
            >
              Back to QRAFTY
            </Link>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen flex-col bg-white">
        <div className="flex-1 p-6">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm text-slate-600">Loading…</p>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  const name =
    data.profile.displayName ?? data.profile.company ?? data.profile.email;

  const headline =
    data.profile.title ?? data.profile.company ?? data.qrCard.label;

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="flex-1 p-6">
        <div className="mx-auto w-full max-w-md">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="p-6">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-md border border-slate-300 bg-white">
                  <span className="text-sm font-semibold text-slate-900">
                    Q
                  </span>
                </div>
                <p className="text-sm font-semibold tracking-widest text-slate-900">
                  QRAFTY
                </p>
              </div>

              <h1 className="mt-8 text-center text-3xl font-semibold tracking-tight text-slate-900">
                {name}
              </h1>

              <p className="mt-2 text-center text-sm text-slate-600">
                {headline}
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-md border border-slate-200 p-4">
                  <p className="text-xs font-semibold tracking-widest text-slate-600">
                    PHONE
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    {data.profile.phone ?? "—"}
                  </p>
                </div>

                <div className="rounded-md border border-slate-200 p-4">
                  <p className="text-xs font-semibold tracking-widest text-slate-600">
                    EMAIL
                  </p>
                  <p className="mt-1 break-all text-sm text-slate-900">
                    {data.profile.email}
                  </p>
                </div>

                <div className="rounded-md border border-slate-200 p-4">
                  <p className="text-xs font-semibold tracking-widest text-slate-600">
                    LOCATION
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    {data.profile.location ?? "—"}
                  </p>
                </div>
              </div>

              {data.profile.bio ? (
                <div className="mt-6 rounded-md border border-slate-200 p-4">
                  <p className="text-xs font-semibold tracking-widest text-slate-600">
                    ABOUT
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {data.profile.bio}
                  </p>
                </div>
              ) : null}

              <div className="mt-6">
                <a
                  className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-blue-700"
                  href={`mailto:${data.profile.email}`}
                  onClick={() => trackContact()}
                >
                  Contact
                </a>

                {data.profile.website ? (
                  <a
                    className="mt-3 block w-full rounded-md border border-blue-200 bg-white px-4 py-3 text-center text-sm font-medium text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                    href={data.profile.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Website
                  </a>
                ) : null}
              </div>

              {qrDataUrl ? (
                <div className="mt-10 flex items-center justify-center">
                  <img
                    src={qrDataUrl}
                    alt="QR code for this QRAFTY profile"
                    className="h-48 w-48"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <Link
            className="mt-6 inline-block text-sm text-blue-700 underline hover:text-blue-800"
            to="/"
          >
            Back to QRAFTY
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
