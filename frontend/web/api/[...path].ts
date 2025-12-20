const API_ORIGIN = "https://qrafty-api.onrender.com";

type QueryValue = string | string[] | undefined;

type VercelRequestLike = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, QueryValue>;
  body?: unknown;
};

type VercelResponseLike = {
  status: (code: number) => VercelResponseLike;
  setHeader: (name: string, value: string | string[]) => void;
  send: (body: Buffer) => void;
};

function headerToString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join(",") : (value ?? "");
}

function getTargetUrl(req: VercelRequestLike) {
  const rawPath = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : typeof req.query.path === "string"
      ? req.query.path
      : "";

  const url = new URL(`${API_ORIGIN}/${rawPath}`);

  // Preserve query params (except the catchall path param)
  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") continue;
    if (Array.isArray(value)) {
      for (const v of value) url.searchParams.append(key, String(v));
    } else if (value != null) {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

function pickForwardHeaders(req: VercelRequestLike) {
  const headers: Record<string, string> = {};

  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue;
    const lower = key.toLowerCase();

    if (
      lower === "connection" ||
      lower === "content-length" ||
      lower === "host" ||
      lower === "accept-encoding"
    ) {
      continue;
    }

    headers[lower] = headerToString(value);
  }

  headers["x-forwarded-host"] = headerToString(req.headers.host);
  headers["x-forwarded-proto"] = "https";

  return headers;
}

function stripCookieDomain(setCookie: string) {
  // If the upstream ever includes a Domain attribute, the browser will not store
  // it for qrafty-web.vercel.app. Ensure host-only cookies.
  return setCookie.replace(/;\s*domain=[^;]*/i, "");
}

export default async function handler(
  req: VercelRequestLike,
  res: VercelResponseLike
) {
  const method = (req.method ?? "GET").toUpperCase();
  const targetUrl = getTargetUrl(req);

  const init: RequestInit = {
    method,
    headers: pickForwardHeaders(req),
    redirect: "manual",
  };

  if (method !== "GET" && method !== "HEAD") {
    // Vercel provides the parsed body; re-encode it.
    // For our API, JSON is sufficient.
    if (req.body != null && typeof req.body !== "string") {
      init.body = JSON.stringify(req.body);
      (init.headers as Record<string, string>)["content-type"] =
        headerToString(req.headers["content-type"]) || "application/json";
    } else if (typeof req.body === "string") {
      init.body = req.body;
    }
  }

  const upstream = await fetch(targetUrl, init);

  res.status(upstream.status);

  // Forward headers (careful with Set-Cookie)
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === "transfer-encoding" ||
      lower === "content-encoding" ||
      lower === "connection" ||
      lower === "keep-alive"
    ) {
      return;
    }

    if (lower === "set-cookie") {
      return;
    }

    res.setHeader(key, value);
  });

  const getSetCookie = (
    upstream.headers as unknown as { getSetCookie?: () => string[] }
  ).getSetCookie;
  const setCookies =
    typeof getSetCookie === "function"
      ? getSetCookie.call(upstream.headers)
      : [];

  if (setCookies.length > 0) {
    res.setHeader(
      "set-cookie",
      setCookies.map((c) => stripCookieDomain(c))
    );
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) res.setHeader("set-cookie", stripCookieDomain(single));
  }

  const buf = Buffer.from(await upstream.arrayBuffer());
  res.send(buf);
}
