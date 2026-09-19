// ---------------------------------------------------------------------------
// API helpers.
// ---------------------------------------------------------------------------
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** SWR fetcher. Prefixes the API base and parses JSON. */
export const fetcher = async (path: string) => {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

/** POST JSON to the API. */
export async function postJSON<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/**
 * Current user id. Auth is mocked in the base, so we read a `uid` cookie set at
 * login. Interns: replace this with the real authenticated user id (decode the
 * JWT server-side or expose it via a session endpoint).
 */
export function getCurrentUserId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)uid=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}
