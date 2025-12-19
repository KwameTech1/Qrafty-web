import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "../../auth/AuthContext";
import { apiFetch } from "../../lib/api";

type Profile = {
  id: string;
  email: string;
  displayName: string | null;
  title: string | null;
  company: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  bio: string | null;
};

type GetResponse = { profile: Profile };

type PatchBody = {
  displayName?: string | null;
  title?: string | null;
  company?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  bio?: string | null;
};

function toNullIfBlank(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export default function ProfilePage() {
  const { refresh } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch<GetResponse>("/profile/me");
      setEmail(res.profile.email);
      setDisplayName(res.profile.displayName ?? "");
      setTitle(res.profile.title ?? "");
      setCompany(res.profile.company ?? "");
      setPhone(res.profile.phone ?? "");
      setLocation(res.profile.location ?? "");
      setWebsite(res.profile.website ?? "");
      setBio(res.profile.bio ?? "");
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

    const body: PatchBody = {
      displayName: toNullIfBlank(displayName),
      title: toNullIfBlank(title),
      company: toNullIfBlank(company),
      phone: toNullIfBlank(phone),
      location: toNullIfBlank(location),
      website: toNullIfBlank(website),
      bio: toNullIfBlank(bio),
    };

    try {
      await apiFetch<GetResponse>("/profile/me", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      await refresh();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        Profile
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Fill in your phone and location to show them on your public QRAFTY
        profile.
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
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={email}
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Display name
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                placeholder="e.g. Software Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={40}
                placeholder="e.g. 123-456-7890"
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
                maxLength={120}
                placeholder="e.g. City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Company
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                maxLength={80}
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Website
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Bio
              </label>
              <textarea
                className="mt-1 min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={800}
                placeholder="A short intro that appears on your public profile"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>

            <button
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              type="button"
              onClick={() => void load()}
              disabled={saving}
            >
              Refresh
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Tip: your public QR pages read these fields from your account.
          </p>
        </form>
      )}
    </div>
  );
}
