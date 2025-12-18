import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-600">
              QRAFTY
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              QR profiles that turn scans into real business interactions.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Create a shareable QR identity, track engagement, and build a
              presence that works everywhere—from events to storefronts.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {user ? (
                <>
                  <Link
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    to="/app"
                  >
                    Go to dashboard
                  </Link>
                  <button
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                    type="button"
                    onClick={() => void logout()}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    to="/signup"
                  >
                    Get started
                  </Link>
                  <Link
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                    to="/login"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {user ? (
            <div className="hidden rounded-md border border-slate-200 bg-slate-50 px-4 py-3 sm:block">
              <p className="text-xs text-slate-600">Signed in as</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {user.email}
              </p>
            </div>
          ) : null}
        </header>

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-slate-900">
            QR card options
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Start simple, then grow into deeper tracking and sharing.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Public QR profile
              </p>
              <p className="mt-1 text-sm text-slate-600">
                A fast, shareable page that works without an app.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Track interactions
              </p>
              <p className="mt-1 text-sm text-slate-600">
                See scans and contact events in one place.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Manage inventory
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Keep your QR cards organized across campaigns.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
