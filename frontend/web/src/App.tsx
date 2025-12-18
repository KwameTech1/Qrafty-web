import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequireAuth from "./auth/RequireAuth";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/app/Dashboard";
import Placeholder from "./pages/app/Placeholder";
import PublicProfile from "./pages/PublicProfile";

const QrCards = lazy(() => import("./pages/app/QrCards"));
const Analytics = lazy(() => import("./pages/app/Analytics"));
const Inventory = lazy(() => import("./pages/app/Inventory"));
const Interactions = lazy(() => import("./pages/app/Interactions"));

function RouteLoading() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto w-full max-w-md">
        <p className="text-sm text-slate-600">Loading…</p>
      </div>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/p/:publicId" element={<PublicProfile />} />

      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/app" element={<Dashboard />} />
          <Route
            path="/app/qr"
            element={
              <Suspense fallback={<RouteLoading />}>
                <QrCards />
              </Suspense>
            }
          />
          <Route
            path="/app/analytics"
            element={
              <Suspense fallback={<RouteLoading />}>
                <Analytics />
              </Suspense>
            }
          />
          <Route
            path="/app/inventory"
            element={
              <Suspense fallback={<RouteLoading />}>
                <Inventory />
              </Suspense>
            }
          />
          <Route
            path="/app/interactions"
            element={
              <Suspense fallback={<RouteLoading />}>
                <Interactions />
              </Suspense>
            }
          />
          <Route
            path="/app/marketplace"
            element={
              <Placeholder
                title="Marketplace"
                description="Discover businesses and view profiles."
              />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
