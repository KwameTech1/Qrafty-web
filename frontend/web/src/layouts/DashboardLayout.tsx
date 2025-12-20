import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useClerk, useUser } from "@clerk/clerk-react";

const navSections: Array<{
  title: string;
  items: Array<{ to: string; label: string }>;
}> = [
  {
    title: "Overview",
    items: [
      { to: "/app", label: "Dashboard" },
      { to: "/app/analytics", label: "Analytics" },
    ],
  },
  {
    title: "Tools",
    items: [
      { to: "/app/qr", label: "QR Editor" },
      { to: "/app/interactions", label: "Interactions" },
      { to: "/app/inventory", label: "Inventory" },
      { to: "/app/marketplace", label: "Marketplace" },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/app/business", label: "Business Profile" },
      { to: "/app/profile", label: "Profile" },
    ],
  },
];

function NavItem({
  to,
  label,
  onClick,
}: {
  to: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block whitespace-nowrap rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
          isActive
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "text-slate-700 hover:bg-blue-50 hover:text-slate-900",
        ].join(" ")
      }
      end
      onClick={onClick}
    >
      {label}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const rawName = (user?.fullName ?? "").trim();
  const fallbackName =
    (user?.primaryEmailAddress?.emailAddress ?? "").split("@")[0] ?? "";
  const firstName = (rawName || fallbackName).trim().split(/\s+/)[0] || "";
  const greetingName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
    : "";

  const onLogout = () => {
    setMobileNavOpen(false);
    void signOut();
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
                {isLoaded ? greetingName || "Account" : "Loading…"}
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

          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white p-3">
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

            <nav className="mt-4 flex-1 space-y-4">
              {navSections.map((section) => (
                <div key={section.title}>
                  <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {section.title}
                  </p>
                  <div className="mt-2 grid gap-1">
                    {section.items.map((item) => (
                      <NavItem
                        key={item.to}
                        to={item.to}
                        label={item.label}
                        onClick={() => setMobileNavOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="px-3 text-xs text-slate-500">First version · v1</p>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-3 py-3 sm:px-4 sm:py-4 md:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-md border border-slate-200 bg-white p-2 md:block md:p-3">
          <div className="flex h-full flex-col">
            <nav className="flex-1 space-y-4">
              {navSections.map((section) => (
                <div key={section.title}>
                  <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {section.title}
                  </p>
                  <div className="mt-2 grid gap-1">
                    {section.items.map((item) => (
                      <NavItem key={item.to} to={item.to} label={item.label} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="px-3 text-xs text-slate-500">First version · v1</p>
            </div>
          </div>
        </aside>

        <main className="rounded-md border border-slate-200 bg-white p-3 sm:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
