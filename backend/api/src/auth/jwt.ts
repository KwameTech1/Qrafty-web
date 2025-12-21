// Legacy module retained only to avoid breaking old imports.
// The app has migrated to Clerk authentication; JWT/cookie auth is removed.

export type AuthTokenPayload = { sub: string };

const COOKIE_NAME = "qrafty_auth";

export function getAuthCookieName() {
  return COOKIE_NAME;
}

export function signAuthToken(
  _env: unknown,
  _payload: AuthTokenPayload
): never {
  throw new Error("Legacy JWT auth is removed; use Clerk auth instead");
}

export function verifyAuthToken(_env: unknown, _token: string): never {
  throw new Error("Legacy JWT auth is removed; use Clerk auth instead");
}

export function buildAuthCookieOptions(_env: unknown) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
}
