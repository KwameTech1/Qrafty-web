/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiFetch } from "../lib/api";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = async () => {
    try {
      const data = await apiFetch<{ user: AuthUser | null }>("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  };

  const logout = async () => {
    await apiFetch<void>("/auth/logout", { method: "POST" });
    setUser(null);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await apiFetch<{ user: AuthUser | null }>("/auth/me");
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ user, ready, refresh, logout }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
