const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
