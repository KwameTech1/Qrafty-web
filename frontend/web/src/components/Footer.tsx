import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-900">
            Q
          </div>
          <p className="text-sm font-semibold tracking-wide text-slate-900">
            QRAFTY
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link className="text-slate-600 hover:text-slate-900" to="/">
            Home
          </Link>
          <Link className="text-slate-600 hover:text-slate-900" to="/signup">
            Get started
          </Link>
          <Link className="text-slate-600 hover:text-slate-900" to="/login">
            Login
          </Link>
        </nav>

        <p className="text-xs text-slate-500">© {year} QRAFTY</p>
      </div>
    </footer>
  );
}
