import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium",
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-700 hover:bg-blue-50",
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const rawName = (user?.displayName ?? "").trim();
  const fallbackName = (user?.email ?? "").split("@")[0] ?? "";
  const firstName = (rawName || fallbackName).trim().split(/\s+/)[0] || "";
  const greetingName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
    : "";

  const onLogout = () => {
    setMobileNavOpen(false);
    void logout();
  };

  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 md:hidden"
              aria-label="Open menu"
            >
              Menu
            </button>

            <div className="min-w-0">
              <p className="text-xs text-slate-600">Welcome</p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {greetingName || "Account"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </header>

      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <button
            type="button"
            className="absolute inset-0 bg-blue-900/20"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />

          <aside className="relative h-full w-72 max-w-[85vw] border-r border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">QRAFTY</p>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <nav className="mt-3 grid gap-1">
              <NavLink
                to="/app"
                className={({ isActive }) =>
                  [
                    "block rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-blue-50",
                  ].join(" ")
                }
                end
                onClick={() => setMobileNavOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/app/qr"
                className={({ isActive }) =>
                  [
                    "block rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-blue-50",
                  ].join(" ")
                }
                end
                onClick={() => setMobileNavOpen(false)}
              >
                QR Editor
              </NavLink>
              <NavLink
                to="/app/analytics"
                className={({ isActive }) =>
                  [
                    "block rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-blue-50",
                  ].join(" ")
                }
                end
                onClick={() => setMobileNavOpen(false)}
              >
                Analytics
              </NavLink>
              <NavLink
                to="/app/inventory"
                className={({ isActive }) =>
                  [
                    "block rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-blue-50",
                  ].join(" ")
                }
                end
                onClick={() => setMobileNavOpen(false)}
              >
                Inventory
              </NavLink>
              <NavLink
                to="/app/interactions"
                className={({ isActive }) =>
                  [
                    "block rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-blue-50",
                  ].join(" ")
                }
                end
                onClick={() => setMobileNavOpen(false)}
              >
                Interactions
              </NavLink>
              <NavLink
                to="/app/marketplace"
                className={({ isActive }) =>
                  [
                    "block rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-blue-50",
                  ].join(" ")
                }
                end
                onClick={() => setMobileNavOpen(false)}
              >
                Marketplace
              </NavLink>
              <NavLink
                to="/app/business"
                className={({ isActive }) =>
                  [
                    "block rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-blue-50",
                  ].join(" ")
                }
                end
                onClick={() => setMobileNavOpen(false)}
              >
                Business Profile
              </NavLink>
              <NavLink
                to="/app/profile"
                className={({ isActive }) =>
                  [
                    "block rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-blue-50",
                  ].join(" ")
                }
                end
                onClick={() => setMobileNavOpen(false)}
              >
                Profile
              </NavLink>
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-3 py-3 sm:px-4 sm:py-4 md:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-md border border-slate-200 bg-white p-2 md:block md:p-3">
          <nav className="grid gap-1">
            <NavItem to="/app" label="Dashboard" />
            <NavItem to="/app/qr" label="QR Editor" />
            <NavItem to="/app/analytics" label="Analytics" />
            <NavItem to="/app/inventory" label="Inventory" />
            <NavItem to="/app/interactions" label="Interactions" />
            <NavItem to="/app/marketplace" label="Marketplace" />
            <NavItem to="/app/business" label="Business Profile" />
            <NavItem to="/app/profile" label="Profile" />
          </nav>
        </aside>

        <main className="rounded-md border border-slate-200 bg-white p-3 sm:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
