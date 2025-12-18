import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block rounded-md px-3 py-2 text-sm font-medium",
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-700 hover:bg-slate-100",
        ].join(" ")
      }
      end
    >
      {label}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-sm text-slate-600">Welcome</p>
            <p className="text-sm font-semibold text-slate-900">
              {user?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-md border border-slate-200 bg-white p-3">
          <nav className="grid gap-1">
            <NavItem to="/app" label="Dashboard" />
            <NavItem to="/app/qr" label="QR Editor" />
            <NavItem to="/app/analytics" label="Analytics" />
            <NavItem to="/app/inventory" label="Inventory" />
            <NavItem to="/app/interactions" label="Interactions" />
            <NavItem to="/app/marketplace" label="Marketplace" />
          </nav>
        </aside>

        <main className="rounded-md border border-slate-200 bg-white p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
