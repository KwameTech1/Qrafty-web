function isLoopbackHostname(hostname: string) {
  const normalized = hostname.trim().toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1";
}

function resolveApiUrl() {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) {
    if (typeof window !== "undefined") {
      try {
        const cfg = new URL(configured);
        const appHost = window.location.hostname;
        if (isLoopbackHostname(cfg.hostname) && !isLoopbackHostname(appHost)) {
          cfg.hostname = appHost;
          return cfg.toString().replace(/\/$/, "");
        }
      } catch {
        // ignore
      }
    }

    return configured.replace(/\/$/, "");
  }

  // In production we proxy API requests through the same origin (Vercel) to
  // keep auth cookies first-party and avoid third-party cookie blocking.
  if (import.meta.env.PROD) {
    return "/api";
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:4000`;
  }

  return "http://localhost:4000";
}

const API_URL = resolveApiUrl();

if (import.meta.env.DEV) {
  console.debug(
    `[api] VITE_API_URL=${import.meta.env.VITE_API_URL ?? "(unset)"} using=${API_URL}`
  );
}

export type ApiError = {
  error: string;
};

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers ?? undefined);

  // Avoid forcing a CORS preflight on simple GETs.
  // Only set JSON content-type when we're actually sending a body.
  if (init?.body != null && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      data && typeof data === "object" && data !== null && "error" in data
        ? String((data as ApiError).error)
        : "Request failed";
    throw new Error(message);
  }

  return data as T;
}

export function getApiUrl() {
  return API_URL;
}
