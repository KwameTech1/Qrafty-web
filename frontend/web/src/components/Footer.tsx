import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700">
                Q
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-slate-900">
                  QRAFTY
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Create QR profiles, track engagement, and manage your business
                  presence.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <nav
              aria-label="Footer"
              className="grid grid-cols-2 gap-6 sm:grid-cols-3"
            >
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-900">
                  Explore
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <Link
                    className="block text-slate-600 hover:text-slate-900"
                    to="/"
                  >
                    Home
                  </Link>
                  <Link
                    className="block text-slate-600 hover:text-slate-900"
                    to="/signup"
                  >
                    Get started
                  </Link>
                  <Link
                    className="block text-slate-600 hover:text-slate-900"
                    to="/login"
                  >
                    Login
                  </Link>
                </div>
              </div>

              <div className="hidden sm:block">
                <p className="text-xs font-semibold tracking-wide text-slate-900">
                  Product
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <span className="block">QR profiles</span>
                  <span className="block">Analytics</span>
                  <span className="block">Inventory</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-900">
                  Built for
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <span className="block">Businesses</span>
                  <span className="block">Creators</span>
                  <span className="block">Teams</span>
                </div>
              </div>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">© {year} QRAFTY</p>
          <p className="text-xs text-slate-500">
            Secure, mobile-first QR experiences.
          </p>
        </div>
      </div>
    </footer>
  );
}
