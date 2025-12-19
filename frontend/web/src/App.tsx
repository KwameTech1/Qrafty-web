import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequireAuth from "./auth/RequireAuth";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/app/Dashboard";
const PublicProfile = lazy(() => import("./pages/PublicProfile"));

const QrCards = lazy(() => import("./pages/app/QrCards"));
const Analytics = lazy(() => import("./pages/app/Analytics"));
const Inventory = lazy(() => import("./pages/app/Inventory"));
const Interactions = lazy(() => import("./pages/app/Interactions"));
const Marketplace = lazy(() => import("./pages/app/Marketplace"));
const MarketplaceDetail = lazy(() => import("./pages/app/MarketplaceDetail"));
const BusinessProfile = lazy(() => import("./pages/app/BusinessProfile"));
const Profile = lazy(() => import("./pages/app/Profile"));

function RouteLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-slate-600">Loading…</p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/p/:publicId"
        element={
          <Suspense fallback={<RouteLoading />}>
            <PublicProfile />
          </Suspense>
        }
      />

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
              <Suspense fallback={<RouteLoading />}>
                <Marketplace />
              </Suspense>
            }
          />
          <Route
            path="/app/marketplace/:id"
            element={
              <Suspense fallback={<RouteLoading />}>
                <MarketplaceDetail />
              </Suspense>
            }
          />
          <Route
            path="/app/business"
            element={
              <Suspense fallback={<RouteLoading />}>
                <BusinessProfile />
              </Suspense>
            }
          />
          <Route
            path="/app/profile"
            element={
              <Suspense fallback={<RouteLoading />}>
                <Profile />
              </Suspense>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
