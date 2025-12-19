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

    return configured;
  }

  // In production the frontend and API are usually on different origins.
  // If VITE_API_URL isn't set, default to the deployed API to avoid silently
  // calling a non-existent ":4000" on the Vercel domain.
  if (import.meta.env.PROD) {
    return "https://qrafty-api.onrender.com";
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
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
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
