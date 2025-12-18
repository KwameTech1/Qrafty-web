import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiFetch } from "../lib/api";

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

  if (error) {
    return (
      <main className="min-h-screen bg-white p-6">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
          <Link
            className="mt-4 inline-block text-sm text-slate-900 underline"
            to="/"
          >
            Back to QRAFTY
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-white p-6">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm text-slate-600">Loading…</p>
        </div>
      </main>
    );
  }

  const name =
    data.profile.displayName ?? data.profile.company ?? data.profile.email;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-md p-6">
        <p className="text-xs font-semibold tracking-widest text-slate-600">
          QRAFTY PROFILE
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {name}
        </h1>

        <p className="mt-1 text-sm text-slate-600">{data.qrCard.label}</p>

        {data.profile.title || data.profile.company ? (
          <p className="mt-4 text-sm text-slate-700">
            {[data.profile.title, data.profile.company]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}

        {data.profile.location ? (
          <p className="mt-1 text-sm text-slate-600">{data.profile.location}</p>
        ) : null}

        {data.profile.bio ? (
          <p className="mt-4 text-sm leading-6 text-slate-700">
            {data.profile.bio}
          </p>
        ) : null}

        <div className="mt-6 space-y-2">
          <a
            className="block rounded-md bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-800"
            href={`mailto:${data.profile.email}`}
          >
            Contact
          </a>

          {data.profile.phone ? (
            <a
              className="block rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-medium text-slate-900 hover:bg-slate-50"
              href={`tel:${data.profile.phone}`}
            >
              Call
            </a>
          ) : null}

          {data.profile.website ? (
            <a
              className="block rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-medium text-slate-900 hover:bg-slate-50"
              href={data.profile.website}
              target="_blank"
              rel="noreferrer"
            >
              Website
            </a>
          ) : null}
        </div>

        <Link
          className="mt-8 inline-block text-sm text-slate-900 underline"
          to="/"
        >
          Back to QRAFTY
        </Link>
      </div>
    </main>
  );
}
