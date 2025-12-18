import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequireAuth from "./auth/RequireAuth";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/app/Dashboard";
import Placeholder from "./pages/app/Placeholder";
import QrCards from "./pages/app/QrCards";
import PublicProfile from "./pages/PublicProfile";

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
          <Route path="/app/qr" element={<QrCards />} />
          <Route
            path="/app/analytics"
            element={
              <Placeholder
                title="Analytics"
                description="Track scans and contact events across your QR cards."
              />
            }
          />
          <Route
            path="/app/inventory"
            element={
              <Placeholder
                title="Inventory"
                description="Manage your QR cards and digital assets."
              />
            }
          />
          <Route
            path="/app/interactions"
            element={
              <Placeholder
                title="Interactions"
                description="Review scan history and contact events."
              />
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
