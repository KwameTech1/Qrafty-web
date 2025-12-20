import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@clerk/clerk-react";

export default function RequireAuth() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm text-slate-600">Loading…</p>
        </div>
      </main>
    );
  }

  if (!isSignedIn) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return <Outlet />;
}
